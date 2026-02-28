export declare class CreateMenuDto {
    name: string;
    price: number;
    category: string;
    description?: string;
    available?: boolean;
    stockQuantity?: number;
    manualPriceEnabled?: boolean;
    manualPrice?: number | null;
    applyMarkup?: boolean;
    variations?: any[];
}
