import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto): Promise<{
        items: ({
            menuItem: {
                name: string;
                price: number;
                category: string;
                description: string | null;
                available: boolean;
                stockQuantity: number | null;
                manualPriceEnabled: boolean;
                manualPrice: number | null;
                applyMarkup: boolean;
                id: number;
            } | null;
            variations: {
                name: string;
                id: number;
                additionalPrice: number;
                menuItemVariationId: number;
                orderItemId: number;
            }[];
        } & {
            name: string;
            price: number;
            id: number;
            menuItemId: number | null;
            quantity: number;
            specialInstructions: string | null;
            orderId: number;
        })[];
    } & {
        id: number;
        tableNumber: string | null;
        notes: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        items: ({
            variations: {
                name: string;
                id: number;
                additionalPrice: number;
                menuItemVariationId: number;
                orderItemId: number;
            }[];
        } & {
            name: string;
            price: number;
            id: number;
            menuItemId: number | null;
            quantity: number;
            specialInstructions: string | null;
            orderId: number;
        })[];
    } & {
        id: number;
        tableNumber: string | null;
        notes: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getSummary(): Promise<{
        totalRevenue: number;
        totalOrders: number;
        recentOrders: {
            id: number;
            tableNumber: string | null;
            total: number;
            createdAt: Date;
            itemsCount: number;
        }[];
    }>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__OrderClient<({
        items: ({
            menuItem: {
                name: string;
                price: number;
                category: string;
                description: string | null;
                available: boolean;
                stockQuantity: number | null;
                manualPriceEnabled: boolean;
                manualPrice: number | null;
                applyMarkup: boolean;
                id: number;
            } | null;
            variations: {
                name: string;
                id: number;
                additionalPrice: number;
                menuItemVariationId: number;
                orderItemId: number;
            }[];
        } & {
            name: string;
            price: number;
            id: number;
            menuItemId: number | null;
            quantity: number;
            specialInstructions: string | null;
            orderId: number;
        })[];
    } & {
        id: number;
        tableNumber: string | null;
        notes: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateOrderDto: UpdateOrderDto): import(".prisma/client").Prisma.Prisma__OrderClient<{
        id: number;
        tableNumber: string | null;
        notes: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__OrderClient<{
        id: number;
        tableNumber: string | null;
        notes: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
