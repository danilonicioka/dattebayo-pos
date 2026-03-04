'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, ChefHat, Trash2, Printer, Settings } from 'lucide-react';
import { api } from '@/services/api';
import './Orders.css';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    variations?: { name: string, additionalPrice: number }[];
}

interface Order {
    id: number;
    tableNumber: string | null;
    createdAt: string;
    status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
    items: OrderItem[];
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (orderId: number | string, newStatus: string) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const calculateOrderTotal = (items: OrderItem[]) => {
        return items.reduce((total, item) => {
            const variationsTotal = item.variations?.reduce((acc, v) => acc + (v.additionalPrice || 0), 0) || 0;
            return total + ((item.price + variationsTotal) * item.quantity);
        }, 0);
    };

    const filteredOrders = orders.filter(order =>
        activeTab === 'ACTIVE'
            ? ['PENDING', 'PREPARING', 'READY'].includes(order.status)
            : ['DELIVERED', 'CANCELLED'].includes(order.status)
    ).sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return activeTab === 'ACTIVE' ? timeA - timeB : timeB - timeA;
    });

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const translateStatus = (status: string) => {
        const map: any = {
            PENDING: 'Pendente',
            PREPARING: 'Preparando',
            READY: 'Pronto',
            DELIVERED: 'Entregue',
            CANCELLED: 'Cancelado'
        };
        return map[status] || status;
    };

    return (
        <div className="orders-container">
            <header className="orders-header">
                <h1 className="title-1">Meus Pedidos</h1>
            </header>

            <div className="status-tabs">
                <button
                    className={`tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ACTIVE')}
                >
                    Em Andamento
                </button>
                <button
                    className={`tab-btn ${activeTab === 'HISTORY' ? 'active' : ''}`}
                    onClick={() => setActiveTab('HISTORY')}
                >
                    Histórico
                </button>
            </div>

            <div className="orders-list">
                {loading && orders.length === 0 ? (
                    <div className="loading-state">Carregando pedidos...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="empty-state">
                        <CheckCircle size={48} opacity={0.2} />
                        <p>Nenhum pedido encontrado.</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="order-row-card">
                            <div className="card-header">
                                <div>
                                    <span className="order-number">
                                        {order.tableNumber ? `${order.tableNumber} #${order.id}` : `Pedido #${order.id}`}
                                    </span>
                                    <div className="time-text">{formatTime(order.createdAt)}</div>
                                </div>
                                <span className={`status-badge ${order.status}`}>
                                    {translateStatus(order.status)}
                                </span>
                            </div>

                            <div className="divider" />

                            <div className="order-items">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="item-row">
                                        <span className="item-qty">{item.quantity}x</span>
                                        <span className="item-name">{item.name}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="divider" />

                            <div className="total-row">
                                <span className="total-label">Total</span>
                                <span className="total-value">R$ {calculateOrderTotal(order.items).toFixed(2).replace('.', ',')}</span>
                            </div>

                            {activeTab === 'ACTIVE' && (
                                <div className="order-actions">
                                    <button
                                        className="action-btn btn-cancel"
                                        onClick={() => updateStatus(order.id, 'CANCELLED')}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="action-btn btn-deliver"
                                        onClick={() => updateStatus(order.id, 'DELIVERED')}
                                    >
                                        Entregar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
