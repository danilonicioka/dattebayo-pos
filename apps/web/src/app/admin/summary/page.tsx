'use client';

import { useState, useCallback, useEffect } from 'react';
import { TrendingUp, Package, Trash2, Tag, ChevronLeft, Check, X } from 'lucide-react';
import { api } from '@/services/api';
import { ConfirmModal } from '@/components/ConfirmModal';
import './Summary.css';

interface DashboardMetrics {
    totalRevenue: number;
    completedOrdersCount: number;
    productStats: Array<{
        name: string;
        itemsSold: number;
        revenue: number;
    }>;
}

// [x] Fix Admin Summary Product Grouping <!-- id: 82 -->
//     - [x] Change API grouping to product-based <!-- id: 83 -->
//     - [x] Sync field names with mobile and web <!-- id: 84 -->

export default function SummaryPage() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Toast State
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'success' | 'warning' | 'info';
        action: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'warning',
        action: () => { }
    });

    const openConfirmModal = (title: string, message: string, type: 'danger' | 'success' | 'warning' | 'info', action: () => void) => {
        setConfirmModal({ isOpen: true, title, message, type, action });
    };

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const fetchMetrics = useCallback(async () => {
        try {
            const response = await api.get('/orders/summary');
            setMetrics(response.data);
        } catch (error) {
            console.error('Erro ao buscar métricas:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    const confirmClear = async () => {
        closeConfirmModal();
        try {
            setIsLoading(true);
            await api.post('/orders/clear');
            setToastMessage({ text: 'Caixa limpo com sucesso.', type: 'success' });
            setTimeout(() => setToastMessage(null), 3000);
            fetchMetrics();
        } catch (error) {
            console.error('Erro ao limpar caixa:', error);
            setToastMessage({ text: 'Erro ao tentar limpar o caixa.', type: 'error' });
            setTimeout(() => setToastMessage(null), 3000);
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        openConfirmModal(
            'Zerar Caixa',
            'Tem certeza que deseja zerar o histórico de pedidos entregues? Isso não pode ser desfeito.',
            'danger',
            confirmClear
        );
    };

    if (isLoading && !metrics) {
        return (
            <div className="summary-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <p>Carregando relatórios...</p>
            </div>
        );
    }

    return (
        <div className="summary-container animate-fade-in">
            <header className="summary-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => window.location.href = '/'}>
                        <ChevronLeft size={28} />
                    </button>
                    <div>
                        <p className="greeting-text">Administração</p>
                        <h1 className="title-1">Relatórios de Caixa</h1>
                    </div>
                </div>
                <button className="clear-btn" onClick={handleClear}>
                    <Trash2 size={20} />
                </button>
            </header>

            <div className="metrics-section">
                <div className="metrics-grid">
                    {/* Faturamento */}
                    <div className="metric-card revenue">
                        <div className="metric-header">
                            <TrendingUp size={24} color="#16A34A" />
                            <span className="metric-title">Faturamento</span>
                        </div>
                        <span className="metric-value green">
                            R$ {metrics?.totalRevenue.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="metric-subtitle">Total acumulado em caixa</span>
                    </div>

                    {/* Volume de Pedidos */}
                    <div className="metric-card volume">
                        <div className="metric-header">
                            <Package size={24} color="#2563EB" />
                            <span className="metric-title">Volume</span>
                        </div>
                        <span className="metric-value blue">
                            {metrics?.completedOrdersCount || 0}
                        </span>
                        <span className="metric-subtitle">Pedidos entregues</span>
                    </div>
                </div>

                <h3 className="section-title">Vendas por Produto</h3>

                {metrics?.productStats && metrics.productStats.length > 0 ? (
                    <div className="category-list">
                        {metrics.productStats.map((stat, index) => (
                            <div key={index} className="category-row">
                                <div className="category-info">
                                    <div className="category-icon-box">
                                        <Tag size={20} color="#6366F1" />
                                    </div>
                                    <div>
                                        <div className="category-name">{stat.name}</div>
                                        <div className="category-volume">
                                            {stat.itemsSold} {stat.itemsSold === 1 ? 'item vendido' : 'itens vendidos'}
                                        </div>
                                    </div>
                                </div>
                                <div className="category-revenue">
                                    R$ {stat.revenue.toFixed(2).replace('.', ',')}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>Nenhuma venda registrada até o momento.</p>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.action}
                onCancel={closeConfirmModal}
            />

            {/* Global Toast */}
            {toastMessage && (
                <div className={`global-toast ${toastMessage.type}`}>
                    {toastMessage.type === 'success' && <Check size={18} className="toast-icon" />}
                    {toastMessage.type === 'error' && <X size={18} className="toast-icon" />}
                    <span>{toastMessage.text}</span>
                </div>
            )}
        </div>
    );
}
