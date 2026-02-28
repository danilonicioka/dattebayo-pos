export declare class CreateOrderItemVariationDto {
    menuItemVariationId: number;
    name: string;
    additionalPrice: number;
}
export declare class CreateOrderItemDto {
    menuItemId?: number;
    name: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
    variations?: CreateOrderItemVariationDto[];
}
export declare class CreateOrderDto {
    tableNumber?: string;
    notes?: string;
    items: CreateOrderItemDto[];
}
