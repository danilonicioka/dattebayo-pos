import { create } from 'zustand';
import { OrderItem, MenuItem } from '@dattebayo/core';

interface CartState {
    items: OrderItem[];
    editMode: boolean;
    editingOrderId: number | null;
    customerName: string;
    notes: string;
    addOrderItem: (menuItem: MenuItem, quantity?: number, variations?: any[]) => void;
    removeOrderItem: (index: number) => void;
    clearCart: () => void;
    initializeFromOrder: (order: any) => void;
    setCustomerName: (name: string) => void;
    setNotes: (notes: string) => void;
}

export const useCartStore = create<CartState>((set) => ({
    items: [],
    editMode: false,
    editingOrderId: null,
    customerName: '',
    notes: '',

    addOrderItem: (menuItem: MenuItem, quantity = 1, variations = []) => {
        set((state: CartState) => {
            const varsStr = JSON.stringify(variations);
            const existingItemIndex = state.items.findIndex(
                (item: OrderItem) => item.menuItem.id === menuItem.id && JSON.stringify(item.variations) === varsStr
            );

            if (existingItemIndex >= 0) {
                const newItems = [...state.items];
                newItems[existingItemIndex].quantity += quantity;
                return { items: newItems };
            }

            const newItem: OrderItem = {
                menuItem: menuItem,
                quantity: quantity,
                price: menuItem.price,
                variations: variations,
            };

            return { items: [...state.items, newItem] };
        });
    },

    removeOrderItem: (index: number) => {
        set((state: CartState) => ({
            items: state.items.filter((_, i: number) => i !== index),
        }));
    },

    clearCart: () => {
        set({ 
            items: [], 
            editMode: false, 
            editingOrderId: null,
            customerName: '',
            notes: ''
        });
    },

    initializeFromOrder: (order: any) => {
        const orderItems: OrderItem[] = order.items.map((item: any) => ({
            menuItem: {
                id: item.menuItemId,
                name: item.menuItemName,
                price: item.price,
            } as MenuItem,
            quantity: item.quantity,
            price: item.price,
            variations: item.variations.map((v: any) => ({
                menuItemVariationId: v.menuItemVariationId || v.id,
                name: v.name,
                additionalPrice: v.additionalPrice,
                selected: true,
                quantity: v.quantity || 1
            }))
        }));

        set({
            items: orderItems,
            editMode: true,
            editingOrderId: order.id,
            customerName: order.tableNumber || '',
            notes: order.notes || ''
        });
    },

    setCustomerName: (customerName: string) => set({ customerName }),
    setNotes: (notes: string) => set({ notes }),
}));

export const getCartTotal = (items: OrderItem[]) => {
    return items.reduce((total: number, item: OrderItem) => {
        const itemTotal = item.price * item.quantity;
        const variationsTotal = item.variations.reduce((vTotal: number, v: any) => vTotal + (v.additionalPrice || 0), 0) * item.quantity;
        return total + itemTotal + variationsTotal;
    }, 0);
};

export const getCartItemCount = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.quantity, 0);
};
