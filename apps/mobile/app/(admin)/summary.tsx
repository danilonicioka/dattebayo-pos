import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/services/api';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TouchableOpacity, Alert, Platform } from 'react-native';

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

    const handleClear = () => {
        if (Platform.OS === 'web') {
            if (window.confirm('Tem certeza que deseja limpar o caixa? Todos os pedidos entregues serão apagados permanentemente.')) {
                performClear();
            }
        } else {
            Alert.alert(
                'Limpar Caixa',
                'Tem certeza que deseja limpar o caixa? Todos os pedidos entregues serão apagados permanentemente.',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Limpar', style: 'destructive', onPress: performClear },
                ]
            );
        }
    };

    const performClear = async () => {
        try {
            setIsLoading(true);
            await api.post('/orders/clear');
            fetchSummary();
        } catch (e) {
            console.error('Erro ao limpar caixa:', e);
            Alert.alert('Ops', 'Erro ao tentar limpar o caixa.');
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => router.replace('/')}>
                        <IconSymbol name="chevron.left" color="#ffffff" size={28} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.greeting}>Administração</Text>
                        <Text style={styles.title}>Relatórios de Caixa</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                    <IconSymbol name="trash.fill" color="#ffffff" size={20} />
                    <Text style={styles.clearButtonText}>Limpar</Text>
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
                            <IconSymbol name="trending.up" color="#16A34A" size={24} />
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
                            <IconSymbol name="package.fill" color="#2563EB" size={24} />
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
                                        <IconSymbol name="tag.fill" color="#6366F1" size={20} />
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
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#223c0e',
        borderBottomWidth: 0,
        marginBottom: 16,
    },
    greeting: {
        fontSize: 14,
        color: '#d4edda',
        fontWeight: '500',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 4,
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DC2626',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    clearButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
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
    emptyState: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 24,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#6B7280',
    },
    categoryList: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    categoryIconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    categoryVolume: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    categoryRevenue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10B981',
    }
});
