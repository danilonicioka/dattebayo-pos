import { z } from 'zod';

// Enum for Order Status
export const OrderStatusSchema = z.enum([
    'PENDING',
    'PREPARING',
    'READY',
    'COMPLETED',
    'CANCELLED'
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

// Variation for Menu Items (e.g. "Com Camarão", "Sem Cebola")
export const MenuItemVariationSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Name is required"),
    type: z.enum(['MULTIPLE', 'SINGLE']),
    additionalPrice: z.number().default(0.0),
    stockQuantity: z.number().nullable().optional(), // null means unlimited
});
export type MenuItemVariation = z.infer<typeof MenuItemVariationSchema>;

// Menu Item
export const MenuItemSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Name is required"),
    description: z.string().max(500).optional().nullable(),
    price: z.number().min(0, "Price must be positive"),
    category: z.string().min(1, "Category is required"),
    available: z.boolean().default(true),
    manualPrice: z.number().optional().nullable(),
    manualPriceEnabled: z.boolean().default(false),
    applyMarkup: z.boolean().default(true),
    stockQuantity: z.number().nullable().optional(), // null means unlimited
    variations: z.array(MenuItemVariationSchema).default([]),
});
export type MenuItem = z.infer<typeof MenuItemSchema>;

// DTOs para HTTP Controller POST/PATCH no NestJS
export const CreateMenuItemDTOSchema = MenuItemSchema.omit({ id: true });
export type CreateMenuItemDTO = z.infer<typeof CreateMenuItemDTOSchema>;

export const UpdateMenuItemDTOSchema = MenuItemSchema.partial().extend({
    id: z.number(), // ID mandatório na rota de Update
});
export type UpdateMenuItemDTO = z.infer<typeof UpdateMenuItemDTOSchema>;

// Order Item Variation (The specific choice made by the customer)
export const OrderItemVariationSchema = z.object({
    id: z.number().optional(),
    menuItemVariationId: z.number(),
    name: z.string(),
    additionalPrice: z.number(),
});
export type OrderItemVariation = z.infer<typeof OrderItemVariationSchema>;

// Order Item
export const OrderItemSchema = z.object({
    id: z.number().optional(),
    menuItem: MenuItemSchema,
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    price: z.number().min(0), // Price recorded at the time of order
    specialInstructions: z.string().max(200).optional().nullable(),
    variations: z.array(OrderItemVariationSchema).default([]),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

// Order
export const OrderSchema = z.object({
    id: z.number().optional(),
    tableNumber: z.string().optional().nullable(),
    status: OrderStatusSchema.default('PENDING'),
    createdAt: z.date().optional(), // Will be handled by the backend/DB
    updatedAt: z.date().optional().nullable(),
    items: z.array(OrderItemSchema).default([]),
    notes: z.string().max(500).optional().nullable(),
});
export type Order = z.infer<typeof OrderSchema>;
