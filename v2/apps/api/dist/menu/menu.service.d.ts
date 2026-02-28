import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class MenuService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createMenuDto: CreateMenuDto): import(".prisma/client").Prisma.Prisma__MenuItemClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        variations: {
            name: string;
            stockQuantity: number | null;
            id: number;
            type: string;
            additionalPrice: number;
            menuItemId: number;
        }[];
    } & {
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
    })[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__MenuItemClient<({
        variations: {
            name: string;
            stockQuantity: number | null;
            id: number;
            type: string;
            additionalPrice: number;
            menuItemId: number;
        }[];
    } & {
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
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, updateMenuDto: UpdateMenuDto): Promise<{
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
    }>;
    remove(id: number): import(".prisma/client").Prisma.Prisma__MenuItemClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
