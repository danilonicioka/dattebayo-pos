"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderSchema = exports.OrderItemSchema = exports.OrderItemVariationSchema = exports.UpdateMenuItemDTOSchema = exports.CreateMenuItemDTOSchema = exports.MenuItemSchema = exports.MenuItemVariationSchema = exports.OrderStatusSchema = void 0;
const zod_1 = require("zod");
// Enum for Order Status
exports.OrderStatusSchema = zod_1.z.enum([
    'PENDING',
    'PREPARING',
    'READY',
    'COMPLETED',
    'CANCELLED'
]);
// Variation for Menu Items (e.g. "Com Camarão", "Sem Cebola")
exports.MenuItemVariationSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    name: zod_1.z.string().min(1, "Name is required"),
    type: zod_1.z.enum(['MULTIPLE', 'SINGLE']),
    additionalPrice: zod_1.z.number().default(0.0),
    stockQuantity: zod_1.z.number().nullable().optional(), // null means unlimited
});
// Menu Item
exports.MenuItemSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    name: zod_1.z.string().min(1, "Name is required"),
    description: zod_1.z.string().max(500).optional().nullable(),
    price: zod_1.z.number().min(0, "Price must be positive"),
    category: zod_1.z.string().min(1, "Category is required"),
    available: zod_1.z.boolean().default(true),
    manualPrice: zod_1.z.number().optional().nullable(),
    manualPriceEnabled: zod_1.z.boolean().default(false),
    applyMarkup: zod_1.z.boolean().default(true),
    stockQuantity: zod_1.z.number().nullable().optional(), // null means unlimited
    variations: zod_1.z.array(exports.MenuItemVariationSchema).default([]),
});
// DTOs para HTTP Controller POST/PATCH no NestJS
exports.CreateMenuItemDTOSchema = exports.MenuItemSchema.omit({ id: true });
exports.UpdateMenuItemDTOSchema = exports.MenuItemSchema.partial().extend({
    id: zod_1.z.number(), // ID mandatório na rota de Update
});
// Order Item Variation (The specific choice made by the customer)
exports.OrderItemVariationSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    menuItemVariationId: zod_1.z.number(),
    name: zod_1.z.string(),
    additionalPrice: zod_1.z.number(),
});
// Order Item
exports.OrderItemSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    menuItem: exports.MenuItemSchema,
    quantity: zod_1.z.number().int().min(1, "Quantity must be at least 1"),
    price: zod_1.z.number().min(0), // Price recorded at the time of order
    specialInstructions: zod_1.z.string().max(200).optional().nullable(),
    variations: zod_1.z.array(exports.OrderItemVariationSchema).default([]),
});
// Order
exports.OrderSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    tableNumber: zod_1.z.string().optional().nullable(),
    status: exports.OrderStatusSchema.default('PENDING'),
    createdAt: zod_1.z.date().optional(), // Will be handled by the backend/DB
    updatedAt: zod_1.z.date().optional().nullable(),
    items: zod_1.z.array(exports.OrderItemSchema).default([]),
    notes: zod_1.z.string().max(500).optional().nullable(),
});
