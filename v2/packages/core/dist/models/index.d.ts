import { z } from 'zod';
export declare const OrderStatusSchema: z.ZodEnum<{
    PENDING: "PENDING";
    PREPARING: "PREPARING";
    READY: "READY";
    COMPLETED: "COMPLETED";
    CANCELLED: "CANCELLED";
}>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export declare const MenuItemVariationSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    name: z.ZodString;
    type: z.ZodEnum<{
        MULTIPLE: "MULTIPLE";
        SINGLE: "SINGLE";
    }>;
    additionalPrice: z.ZodDefault<z.ZodNumber>;
    stockQuantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
export type MenuItemVariation = z.infer<typeof MenuItemVariationSchema>;
export declare const MenuItemSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    price: z.ZodNumber;
    category: z.ZodString;
    available: z.ZodDefault<z.ZodBoolean>;
    manualPrice: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    manualPriceEnabled: z.ZodDefault<z.ZodBoolean>;
    applyMarkup: z.ZodDefault<z.ZodBoolean>;
    stockQuantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    variations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodNumber>;
        name: z.ZodString;
        type: z.ZodEnum<{
            MULTIPLE: "MULTIPLE";
            SINGLE: "SINGLE";
        }>;
        additionalPrice: z.ZodDefault<z.ZodNumber>;
        stockQuantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type MenuItem = z.infer<typeof MenuItemSchema>;
export declare const CreateMenuItemDTOSchema: z.ZodObject<{
    name: z.ZodString;
    stockQuantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    price: z.ZodNumber;
    category: z.ZodString;
    available: z.ZodDefault<z.ZodBoolean>;
    manualPrice: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    manualPriceEnabled: z.ZodDefault<z.ZodBoolean>;
    applyMarkup: z.ZodDefault<z.ZodBoolean>;
    variations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodNumber>;
        name: z.ZodString;
        type: z.ZodEnum<{
            MULTIPLE: "MULTIPLE";
            SINGLE: "SINGLE";
        }>;
        additionalPrice: z.ZodDefault<z.ZodNumber>;
        stockQuantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type CreateMenuItemDTO = z.infer<typeof CreateMenuItemDTOSchema>;
export declare const UpdateMenuItemDTOSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    price: z.ZodOptional<z.ZodNumber>;
    category: z.ZodOptional<z.ZodString>;
    available: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    manualPrice: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    manualPriceEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    applyMarkup: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    stockQuantity: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    variations: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodNumber>;
        name: z.ZodString;
        type: z.ZodEnum<{
            MULTIPLE: "MULTIPLE";
            SINGLE: "SINGLE";
        }>;
        additionalPrice: z.ZodDefault<z.ZodNumber>;
        stockQuantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    id: z.ZodNumber;
}, z.core.$strip>;
export type UpdateMenuItemDTO = z.infer<typeof UpdateMenuItemDTOSchema>;
export declare const OrderItemVariationSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    menuItemVariationId: z.ZodNumber;
    name: z.ZodString;
    additionalPrice: z.ZodNumber;
}, z.core.$strip>;
export type OrderItemVariation = z.infer<typeof OrderItemVariationSchema>;
export declare const OrderItemSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    menuItem: z.ZodObject<{
        id: z.ZodOptional<z.ZodNumber>;
        name: z.ZodString;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        price: z.ZodNumber;
        category: z.ZodString;
        available: z.ZodDefault<z.ZodBoolean>;
        manualPrice: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        manualPriceEnabled: z.ZodDefault<z.ZodBoolean>;
        applyMarkup: z.ZodDefault<z.ZodBoolean>;
        stockQuantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        variations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodNumber>;
            name: z.ZodString;
            type: z.ZodEnum<{
                MULTIPLE: "MULTIPLE";
                SINGLE: "SINGLE";
            }>;
            additionalPrice: z.ZodDefault<z.ZodNumber>;
            stockQuantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    quantity: z.ZodNumber;
    price: z.ZodNumber;
    specialInstructions: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    variations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodNumber>;
        menuItemVariationId: z.ZodNumber;
        name: z.ZodString;
        additionalPrice: z.ZodNumber;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export declare const OrderSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    tableNumber: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodDefault<z.ZodEnum<{
        PENDING: "PENDING";
        PREPARING: "PREPARING";
        READY: "READY";
        COMPLETED: "COMPLETED";
        CANCELLED: "CANCELLED";
    }>>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
    items: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodNumber>;
        menuItem: z.ZodObject<{
            id: z.ZodOptional<z.ZodNumber>;
            name: z.ZodString;
            description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            price: z.ZodNumber;
            category: z.ZodString;
            available: z.ZodDefault<z.ZodBoolean>;
            manualPrice: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            manualPriceEnabled: z.ZodDefault<z.ZodBoolean>;
            applyMarkup: z.ZodDefault<z.ZodBoolean>;
            stockQuantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            variations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodOptional<z.ZodNumber>;
                name: z.ZodString;
                type: z.ZodEnum<{
                    MULTIPLE: "MULTIPLE";
                    SINGLE: "SINGLE";
                }>;
                additionalPrice: z.ZodDefault<z.ZodNumber>;
                stockQuantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        quantity: z.ZodNumber;
        price: z.ZodNumber;
        specialInstructions: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        variations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodNumber>;
            menuItemVariationId: z.ZodNumber;
            name: z.ZodString;
            additionalPrice: z.ZodNumber;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type Order = z.infer<typeof OrderSchema>;
