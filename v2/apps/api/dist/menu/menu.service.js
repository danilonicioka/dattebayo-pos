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
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MenuService = class MenuService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createMenuDto) {
        return this.prisma.menuItem.create({
            data: {
                name: createMenuDto.name,
                price: createMenuDto.price,
                category: createMenuDto.category,
                description: createMenuDto.description,
                available: createMenuDto.available ?? true,
                stockQuantity: createMenuDto.stockQuantity,
                manualPrice: createMenuDto.manualPrice,
                manualPriceEnabled: createMenuDto.manualPriceEnabled ?? false,
                applyMarkup: createMenuDto.applyMarkup ?? true,
                variations: createMenuDto.variations?.length ? {
                    create: createMenuDto.variations.map((v) => ({
                        name: v.name,
                        type: v.type,
                        additionalPrice: v.additionalPrice,
                        stockQuantity: v.stockQuantity,
                    }))
                } : undefined,
            }
        });
    }
    findAll() {
        return this.prisma.menuItem.findMany({
            include: { variations: true }
        });
    }
    findOne(id) {
        return this.prisma.menuItem.findUnique({
            where: { id },
            include: { variations: true }
        });
    }
    async update(id, updateMenuDto) {
        const { variations, id: _id, ...data } = updateMenuDto;
        const updateData = {
            ...data
        };
        if (variations) {
            await this.prisma.menuItemVariation.deleteMany({
                where: { menuItemId: id }
            });
            updateData.variations = {
                create: variations.map((v) => ({
                    name: v.name,
                    type: v.type,
                    additionalPrice: v.additionalPrice,
                    stockQuantity: v.stockQuantity,
                })),
            };
        }
        return this.prisma.menuItem.update({
            where: { id },
            data: updateData
        });
    }
    remove(id) {
        return this.prisma.menuItem.delete({
            where: { id }
        });
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenuService);
//# sourceMappingURL=menu.service.js.map