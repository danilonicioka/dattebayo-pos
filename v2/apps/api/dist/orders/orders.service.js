"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createOrderDto) {
        const mapped = createOrderDto.items.map(item => ({
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            specialInstructions: item.specialInstructions,
            variations: {
                create: item.variations?.map(variation => ({
                    menuItemVariationId: variation.menuItemVariationId,
                    name: variation.name,
                    additionalPrice: variation.additionalPrice
                })) || []
            }
        }));
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    tableNumber: createOrderDto.tableNumber,
                    notes: createOrderDto.notes,
                    status: 'PENDING',
                    items: {
                        create: mapped
                    }
                },
                include: {
                    items: {
                        include: {
                            variations: true,
                            menuItem: true
                        }
                    }
                }
            });
            for (const item of createOrderDto.items) {
                const menuItem = await tx.menuItem.findUnique({ where: { id: item.menuItemId } });
                if (menuItem && menuItem.stockQuantity !== null) {
                    const newStock = Math.max(0, menuItem.stockQuantity - item.quantity);
                    await tx.menuItem.update({
                        where: { id: menuItem.id },
                        data: { stockQuantity: newStock }
                    });
                }
            }
            return order;
        });
    }
    findAll() {
        return this.prisma.order.findMany({
            include: { items: { include: { variations: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getSummary() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const orders = await this.prisma.order.findMany({
            where: {
                status: 'DELIVERED',
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: {
                items: {
                    include: {
                        variations: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        let totalRevenue = 0;
        for (const order of orders) {
            let orderTotal = 0;
            for (const item of order.items) {
                let itemTotal = item.price;
                for (const v of item.variations) {
                    itemTotal += v.additionalPrice;
                }
                orderTotal += (itemTotal * item.quantity);
            }
            totalRevenue += orderTotal;
        }
        const recentOrders = orders.slice(0, 10).map(order => {
            let total = 0;
            for (const item of order.items) {
                let itemTotal = item.price;
                for (const v of item.variations) {
                    itemTotal += v.additionalPrice;
                }
                total += (itemTotal * item.quantity);
            }
            return {
                id: order.id,
                tableNumber: order.tableNumber,
                total,
                createdAt: order.createdAt,
                itemsCount: order.items.reduce((acc, curr) => acc + curr.quantity, 0)
            };
        });
        return {
            totalRevenue,
            totalOrders: orders.length,
            recentOrders
        };
    }
    findOne(id) {
        return this.prisma.order.findUnique({
            where: { id },
            include: { items: { include: { variations: true, menuItem: true } } }
        });
    }
    update(id, updateOrderDto) {
        return this.prisma.order.update({
            where: { id },
            data: updateOrderDto
        });
    }
    remove(id) {
        return this.prisma.order.delete({
            where: { id }
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map