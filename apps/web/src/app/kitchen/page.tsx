'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, ChefHat, Settings, Utensils, Flame } from 'lucide-react';
import { api } from '@/services/api';
import './Kitchen.css';

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    specialInstructions?: string;
    variations?: any[];
}

interface Order {
    id: number;
    tableNumber: string | number;
    createdAt: string;
    status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED';
    items: OrderItem[];
    notes?: string;
}

export default function KitchenPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Erro ao buscar pedidos da cozinha:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // 10s como no mobile
        return () => clearInterval(interval);
    }, []);

    const updateOrderStatus = async (orderId: number, nextStatus: string) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
            fetchOrders();
        } catch (error) {
            console.error('Erro ao atualizar status do pedido:', error);
        }
    };

    const pendingOrders = orders
        .filter((o) => o.status === 'PENDING')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const preparingOrders = orders
        .filter((o) => o.status === 'PREPARING')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const oldestPendingId = pendingOrders.length > 0 ? pendingOrders[0].id : null;
    const oldestPreparingId = preparingOrders.length > 0 ? preparingOrders[0].id : null;

    const OrderCard = ({ order, isOldest }: { order: Order, isOldest: boolean }) => {
        const handleStatusAdvance = () => {
            if (order.status === 'PENDING') updateOrderStatus(order.id, 'PREPARING');
            else if (order.status === 'PREPARING') updateOrderStatus(order.id, 'READY');
            else if (order.status === 'READY') updateOrderStatus(order.id, 'DELIVERED');
        };

        const getIcon = () => {
            switch (order.status) {
                case 'PENDING': return <Clock size={18} />;
                case 'PREPARING': return <ChefHat size={18} />;
                case 'READY': return <CheckCircle2 size={18} />;
                default: return <Utensils size={18} />;
            }
        };

        const getActionLabel = () => {
            switch (order.status) {
                case 'PENDING': return 'Aceitar Pedido';
                case 'PREPARING': return 'Marcar como Pronto';
                case 'READY': return 'Entregar ao Cliente';
                default: return 'Finalizado';
            }
        };

        const displayName = order.tableNumber ? `${order.tableNumber}` : 'Pedido';

        return (
            <div className={`order-card ${order.status} ${isOldest ? 'is-oldest' : ''}`}>
                <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isOldest && <Flame size={20} color="#EF4444" fill="#EF4444" />}
                        <span className="order-number">
                            {displayName}
                        </span>
                    </div>
                    <span className="order-id">#{order.id}</span>
                </div>
                <div className="order-time">{formatTime(order.createdAt)}</div>

                <div className="items-list-box">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="order-item-row">
                            <span className="item-qty">{item.quantity}x</span>
                            <div style={{ flex: 1 }}>
                                <span className="item-name">{item.name}</span>
                                {item.specialInstructions && (
                                    <div className="item-notes">Obs: {item.specialInstructions}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {order.notes && (
                    <div className="general-notes">
                        <div className="general-notes-text">Nota: {order.notes}</div>
                    </div>
                )}

                <button
                    className={`action-btn ${order.status}`}
                    onClick={handleStatusAdvance}
                >
                    {getIcon()}
                    <span>{getActionLabel()}</span>
                </button>
            </div>
        );
    };

    return (
        <div className="kitchen-container">
            <header className="kitchen-header">
                <div className="header-left">
                    <div>
                        <p className="greeting-text">Área de Produção</p>
                        <h1 className="title-1">Painel da Cozinha</h1>
                    </div>
                </div>
                {loading && <div className="loading-spinner-small" />}
            </header>

            <div className="boards-wrapper">
                {/* Novos Column */}
                <div className="board-column">
                    <div className="board-header pending">
                        Novos ({pendingOrders.length})
                    </div>
                    <div className="order-list">
                        {loading && pendingOrders.length === 0 ? (
                            <div className="empty-state">Carregando...</div>
                        ) : pendingOrders.length === 0 ? (
                            <div className="empty-text">Nenhum novo pedido</div>
                        ) : (
                            pendingOrders.map(order => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    isOldest={order.id === oldestPendingId}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Em Preparo Column */}
                <div className="board-column">
                    <div className="board-header preparing">
                        Em Preparo ({preparingOrders.length})
                    </div>
                    <div className="order-list">
                        {preparingOrders.length === 0 ? (
                            <div className="empty-text">Cozinha livre</div>
                        ) : (
                            preparingOrders.map(order => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    isOldest={order.id === oldestPreparingId}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
