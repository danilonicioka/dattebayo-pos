import { create } from 'zustand';
import { OrderItem, MenuItem } from '@dattebayo/core';

interface CartState {
    items: OrderItem[];
    addOrderItem: (menuItem: MenuItem, quantity?: number) => void;
    removeOrderItem: (index: number) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
    items: [],

    addOrderItem: (menuItem, quantity = 1) => {
        set((state) => {
            const existingItemIndex = state.items.findIndex(
                (item) => item.menuItem.id === menuItem.id && item.variations.length === 0
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
                variations: [],
            };

            return { items: [...state.items, newItem] };
        });
    },

    removeOrderItem: (index) => {
        set((state) => ({
            items: state.items.filter((_, i) => i !== index),
        }));
    },

    clearCart: () => {
        set({ items: [] });
    },
}));

export const getCartTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => {
        const itemTotal = item.price * item.quantity;
        const variationsTotal = item.variations.reduce((vTotal, v) => vTotal + v.additionalPrice, 0) * item.quantity;
        return total + itemTotal + variationsTotal;
    }, 0);
};

export const getCartItemCount = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.quantity, 0);
};
