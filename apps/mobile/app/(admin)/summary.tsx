import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api, API_URL } from '@/services/api';
import axios from 'axios';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TouchableOpacity, Alert, Platform } from 'react-native';
import { scale, fontScale, verticalScale } from '@/utils/responsive';
import { ConfirmModal } from '@/components/ConfirmModal';

interface SalesSummary {
    totalRevenue: number;
    totalOrders: number;
    productStats: {
        name: string;
        itemsSold: number;
        revenue: number;
    }[];
}

export default function SummaryScreen() {
    const [summary, setSummary] = useState<SalesSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

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

    const fetchSummary = async () => {
        try {
            // Get all completed orders instead of a summary endpoint to avoid backend changes
            const { data: completedOrders } = await api.get<any[]>('/orders/status/completed');
            
            let totalRevenue = 0;
            let totalOrders = completedOrders.length;
            const statsMap: Record<string, { name: string, itemsSold: number, revenue: number }> = {};

            completedOrders.forEach(order => {
                totalRevenue += (order.total || 0);
                if (order.items) {
                    order.items.forEach((item: any) => {
                        const name = item.menuItemName;
                        if (!statsMap[name]) {
                            statsMap[name] = { name, itemsSold: 0, revenue: 0 };
                        }
                        statsMap[name].itemsSold += (item.quantity || 0);
                        statsMap[name].revenue += (item.subtotal || 0);
                    });
                }
            });

            const productStats = Object.values(statsMap).sort((a, b) => b.revenue - a.revenue);

            setSummary({
                totalRevenue,
                totalOrders,
                productStats
            });
        } catch (e) {
            console.error('Erro ao buscar resumo de vendas:', e);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSummary();
        }, [])
    );

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchSummary();
    };

    const handleClear = () => {
        openConfirmModal(
            'Zerar Caixa',
            'Tem certeza que deseja limpar o caixa? Todos os pedidos entregues serão apagados permanentemente.',
            'danger',
            performClear
        );
    };

    const performClear = async () => {
        closeConfirmModal();
        try {
            setIsLoading(true);
            // Using the existing web endpoint for clearing history
            const webUrl = API_URL.replace('/api', '/history/clear');
            await axios.post(webUrl);
            
            setToastMessage({ text: 'Caixa zerado com sucesso!', type: 'success' });
            setTimeout(() => setToastMessage(null), 3000);
            fetchSummary();
        } catch (e) {
            console.error('Erro ao limpar caixa:', e);
            setToastMessage({ text: 'Erro ao tentar limpar o caixa.', type: 'error' });
            setTimeout(() => setToastMessage(null), 3000);
            setIsLoading(false);
        }
    };

    if (isLoading && !summary) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#ee8b1b" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(12) }}>
                    <TouchableOpacity onPress={() => router.replace('/')}>
                        <IconSymbol name="chevron.left" color="#ffffff" size={scale(28)} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.greeting}>Administração</Text>
                        <Text style={styles.title}>Relatórios de Caixa</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                    <IconSymbol name="trash.fill" color="#ffffff" size={scale(20)} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.metricsGrid}>
                    {/* Faturamento */}
                    <View style={[styles.metricCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                        <View style={styles.metricHeader}>
                            <IconSymbol name="trending.up" color="#16A34A" size={scale(24)} />
                            <Text style={styles.metricTitle}>Faturamento</Text>
                        </View>
                        <Text style={[styles.metricValue, { color: '#16A34A' }]}>
                            R$ {(summary?.totalRevenue || 0).toFixed(2).replace('.', ',')}
                        </Text>
                        <Text style={styles.metricSubtitle}>Apenas pedidos concluídos</Text>
                    </View>

                    {/* Volume de Pedidos */}
                    <View style={[styles.metricCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                        <View style={styles.metricHeader}>
                            <IconSymbol name="package.fill" color="#2563EB" size={scale(24)} />
                            <Text style={styles.metricTitle}>Volume</Text>
                        </View>
                        <Text style={[styles.metricValue, { color: '#2563EB' }]}>
                            {summary?.totalOrders || 0}
                        </Text>
                        <Text style={styles.metricSubtitle}>Pedidos entregues</Text>
                    </View>
                </View>

                {/* Seção Produtos */}
                <Text style={styles.sectionTitle}>Vendas por Produto</Text>

                {summary?.productStats && summary.productStats.length > 0 ? (
                    <View style={styles.categoryList}>
                        {summary.productStats.map((stat, idx) => (
                            <View key={`product-${idx}`} style={styles.categoryRow}>
                                <View style={styles.categoryInfo}>
                                    <View style={styles.categoryIconBox}>
                                        <IconSymbol name="tag.fill" color="#6366F1" size={scale(20)} />
                                    </View>
                                    <View>
                                        <Text style={styles.categoryName}>{stat.name}</Text>
                                        <Text style={styles.categoryVolume}>{stat.itemsSold} {stat.itemsSold === 1 ? 'item vendido' : 'itens vendidos'}</Text>
                                    </View>
                                </View>
                                <Text style={styles.categoryRevenue}>R$ {stat.revenue.toFixed(2).replace('.', ',')}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>Nenhuma venda registrada.</Text>
                    </View>
                )}
            </ScrollView>

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
                <View style={[styles.globalToast, toastMessage.type === 'error' && styles.globalToastError]}>
                    <Text style={styles.globalToastText}>{toastMessage.text}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(24),
        paddingTop: verticalScale(60),
        paddingBottom: verticalScale(20),
        backgroundColor: '#223c0e',
        borderBottomWidth: 0,
        marginBottom: verticalScale(16),
    },
    greeting: {
        fontSize: fontScale(14),
        color: '#d4edda',
        fontWeight: '500',
    },
    title: {
        fontSize: fontScale(28),
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: verticalScale(4),
    },
    clearButton: {
        width: scale(40),
        height: scale(40),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#DC2626',
        borderRadius: scale(8),
    },
    content: {
        padding: scale(24),
        paddingBottom: verticalScale(100),
    },
    metricsGrid: {
        flexDirection: 'column',
        gap: scale(16),
        marginBottom: verticalScale(32),
    },
    metricCard: {
        padding: scale(20),
        borderRadius: scale(16),
        borderWidth: 1,
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
        marginBottom: verticalScale(16),
    },
    metricTitle: {
        fontSize: fontScale(16),
        fontWeight: '600',
        color: '#4B5563',
    },
    metricValue: {
        fontSize: fontScale(36),
        fontWeight: '900',
        marginBottom: verticalScale(4),
    },
    metricSubtitle: {
        fontSize: fontScale(13),
        color: '#6B7280',
    },
    sectionTitle: {
        fontSize: fontScale(20),
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: verticalScale(16),
    },
    emptyState: {
        padding: scale(24),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: scale(12),
        marginBottom: verticalScale(24),
    },
    emptyStateText: {
        fontSize: fontScale(16),
        color: '#6B7280',
    },
    categoryList: {
        backgroundColor: '#fff',
        borderRadius: scale(12),
        padding: scale(16),
        marginBottom: verticalScale(24),
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
    },
    categoryIconBox: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(8),
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryName: {
        fontSize: fontScale(16),
        fontWeight: 'bold',
        color: '#1F2937',
    },
    categoryVolume: {
        fontSize: fontScale(14),
        color: '#6B7280',
        marginTop: verticalScale(2),
    },
    categoryRevenue: {
        fontSize: fontScale(16),
        fontWeight: 'bold',
        color: '#10B981',
    },
    globalToast: {
        position: 'absolute',
        bottom: verticalScale(40),
        alignSelf: 'center',
        backgroundColor: '#059669', // Success green
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(24),
        borderRadius: scale(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.15,
        shadowRadius: scale(4),
        elevation: 5,
        zIndex: 9999,
    },
    globalToastError: {
        backgroundColor: '#EF4444', // Error red
    },
    globalToastText: {
        color: '#fff',
        fontSize: fontScale(14),
        fontWeight: 'bold',
        textAlign: 'center',
    }
});
