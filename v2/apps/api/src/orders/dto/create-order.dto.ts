export class CreateOrderItemVariationDto {
    menuItemVariationId: number;
    name: string;
    additionalPrice: number;
}

export class CreateOrderItemDto {
    menuItemId?: number;
    name: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
    variations?: CreateOrderItemVariationDto[];
}

export class CreateOrderDto {
    tableNumber?: string;
    notes?: string;
    items: CreateOrderItemDto[];
}
