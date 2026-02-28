import { create } from 'zustand';
import { Order, OrderStatus } from '@dattebayo/core';
import { api } from '@/services/api';

export type OrderResponseDTO = Order;
export interface UpdateOrderStatusDTO {
    status: OrderStatus;
}

interface OrdersState {
    orders: OrderResponseDTO[];
    isLoading: boolean;
    error: string | null;
    fetchOrders: () => Promise<void>;
    updateOrderStatus: (orderId: number, status: OrderStatus) => Promise<void>;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
    orders: [],
    isLoading: false,
    error: null,

    fetchOrders: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get<OrderResponseDTO[]>('/orders');
            set({ orders: response.data, isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'Erro ao carregar pedidos', isLoading: false });
        }
    },

    updateOrderStatus: async (orderId: number, status: OrderStatus) => {
        try {
            const payload: UpdateOrderStatusDTO = { status };
            await api.patch(`/orders/${orderId}/status`, payload);

            // Atualização Local Otimista (Sem recarregar lista inteira)
            const currentOrders = get().orders;
            set({
                orders: currentOrders.map(order =>
                    order.id === orderId ? { ...order, status } : order
                )
            });
        } catch (err: any) {
            console.error('Falha ao atualizar pedido:', err);
            // Re-fetch in case of optimistic failure
            await get().fetchOrders();
        }
    }
}));
