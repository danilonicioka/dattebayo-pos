import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/services/api';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TouchableOpacity, Alert, Platform } from 'react-native';
import { scale, fontScale, verticalScale } from '@/utils/responsive';

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
    }
});
