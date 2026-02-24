export class CreateMenuDto {
    name: string;
    price: number;
    category: string;
    description?: string;
    available?: boolean;
    stockQuantity?: number;
}
