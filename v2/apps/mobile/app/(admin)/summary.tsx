import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/services/api';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TouchableOpacity } from 'react-native';

interface SalesSummary {
    totalRevenue: number;
    totalOrders: number;
    recentOrders: {
        id: number;
        tableNumber: string | null;
        total: number;
        createdAt: string;
        itemsCount: number;
    }[];
}

export default function SummaryScreen() {
    const [summary, setSummary] = useState<SalesSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchSummary = async () => {
        try {
            const { data } = await api.get<SalesSummary>('/orders/summary');
            setSummary(data);
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

    if (isLoading && !summary) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#D32F2F" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <TouchableOpacity onPress={() => router.replace('/')} style={{ marginRight: 12 }}>
                        <IconSymbol name="chevron.left" color="#1A1A1A" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.greeting}>Relatórios</Text>
                </View>
                <Text style={styles.title}>Caixa de Hoje</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.metricsGrid}>
                    {/* Faturamento */}
                    <View style={[styles.metricCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                        <View style={styles.metricHeader}>
                            <IconSymbol name="trending.up" color="#16A34A" size={24} />
                            <Text style={styles.metricTitle}>Faturamento</Text>
                        </View>
                        <Text style={[styles.metricValue, { color: '#16A34A' }]}>
                            R$ {(summary?.totalRevenue || 0).toFixed(2).replace('.', ',')}
                        </Text>
                        <Text style={styles.metricSubtitle}>Apenas pedidos concluídos hoje</Text>
                    </View>

                    {/* Volume de Pedidos */}
                    <View style={[styles.metricCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                        <View style={styles.metricHeader}>
                            <IconSymbol name="package.fill" color="#2563EB" size={24} />
                            <Text style={styles.metricTitle}>Volume</Text>
                        </View>
                        <Text style={[styles.metricValue, { color: '#2563EB' }]}>
                            {summary?.totalOrders || 0}
                        </Text>
                        <Text style={styles.metricSubtitle}>Pedidos entregues hoje</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Últimos Entregues</Text>

                {summary?.recentOrders && summary.recentOrders.length > 0 ? (
                    summary.recentOrders.map((order) => (
                        <View key={order.id} style={styles.orderRow}>
                            <View style={styles.orderInfo}>
                                <Text style={styles.orderId}>Pedido #{order.id}</Text>
                                <Text style={styles.orderMeta}>
                                    Mesa {order.tableNumber || 'Balcão'} • {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'itens'}
                                </Text>
                                <Text style={styles.orderTime}>
                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                            <Text style={styles.orderTotal}>R$ {order.total.toFixed(2).replace('.', ',')}</Text>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>Nenhuma venda finalizada ainda hoje.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    greeting: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginTop: 4,
    },
    content: {
        padding: 24,
        paddingBottom: 100,
    },
    metricsGrid: {
        flexDirection: 'column',
        gap: 16,
        marginBottom: 32,
    },
    metricCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    metricTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    metricValue: {
        fontSize: 36,
        fontWeight: '900',
        marginBottom: 4,
    },
    metricSubtitle: {
        fontSize: 13,
        color: '#6B7280',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    orderInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    orderMeta: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    orderTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    orderTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#16A34A',
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    emptyStateText: {
        color: '#6B7280',
        fontSize: 15,
    }
});
