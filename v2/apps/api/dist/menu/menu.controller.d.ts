import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
export declare class MenuController {
    private readonly menuService;
    constructor(menuService: MenuService);
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
    findOne(id: string): import(".prisma/client").Prisma.Prisma__MenuItemClient<({
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
    update(id: string, updateMenuDto: UpdateMenuDto): Promise<{
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
    remove(id: string): import(".prisma/client").Prisma.Prisma__MenuItemClient<{
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
