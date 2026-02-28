import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useOrdersStore } from '@/store/ordersStore';
import { KitchenOrderCard } from '@/components/KitchenOrderCard';

export default function KitchenScreen() {
    const { orders, fetchOrders, updateOrderStatus, isLoading, error } = useOrdersStore();

    useEffect(() => {
        fetchOrders();
        // Auto-Reload para atualizar a esteira a cada 10 seg na cozinha
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const pendingOrders = orders.filter((o) => o.status === 'PENDING');
    const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
    const readyOrders = orders.filter((o) => o.status === 'READY');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Painel da Cozinha</Text>
                {isLoading && <ActivityIndicator size="small" color="#666" />}
            </View>

            {error ? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.board}>

                {/* Coluna PENDENTE (Novos) */}
                <View style={styles.column}>
                    <View style={[styles.columnHeader, { backgroundColor: '#F59E0B' }]}>
                        <Text style={styles.columnTitle}>Novos ({pendingOrders.length})</Text>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.columnContent}>
                        {pendingOrders.map((order) => (
                            <KitchenOrderCard key={`pending-${order.id}`} order={order} onUpdateStatus={updateOrderStatus} />
                        ))}
                        {pendingOrders.length === 0 && (
                            <Text style={styles.emptyText}>Nenhum novo pedido</Text>
                        )}
                    </ScrollView>
                </View>

                {/* Coluna PREPARANDO */}
                <View style={styles.column}>
                    <View style={[styles.columnHeader, { backgroundColor: '#3B82F6' }]}>
                        <Text style={styles.columnTitle}>Na Chapa ({preparingOrders.length})</Text>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.columnContent}>
                        {preparingOrders.map((order) => (
                            <KitchenOrderCard key={`preparing-${order.id}`} order={order} onUpdateStatus={updateOrderStatus} />
                        ))}
                        {preparingOrders.length === 0 && (
                            <Text style={styles.emptyText}>Cozinha livre</Text>
                        )}
                    </ScrollView>
                </View>

                {/* Coluna PRONTO */}
                <View style={styles.column}>
                    <View style={[styles.columnHeader, { backgroundColor: '#10B981' }]}>
                        <Text style={styles.columnTitle}>Pronto p/ Entrega ({readyOrders.length})</Text>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.columnContent}>
                        {readyOrders.map((order) => (
                            <KitchenOrderCard key={`ready-${order.id}`} order={order} onUpdateStatus={updateOrderStatus} />
                        ))}
                        {readyOrders.length === 0 && (
                            <Text style={styles.emptyText}>Nenhum pedido aguardando</Text>
                        )}
                    </ScrollView>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E5E7EB', // Cinza de Painel Kanban
        paddingTop: 48, // Safe Area superior
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#111827',
    },
    board: {
        paddingHorizontal: 16,
    },
    column: {
        width: 300, // Largura Fixa p/ Efeito de Esteira
        marginRight: 16,
        backgroundColor: '#F3F4F6', // Coluna Branca/Gelo
        borderRadius: 16,
        overflow: 'hidden',
    },
    columnHeader: {
        padding: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    columnTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    columnContent: {
        padding: 16,
        paddingBottom: 40,
        flexGrow: 1,
    },
    emptyText: {
        color: '#9CA3AF',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 32,
    },
    errorBox: {
        backgroundColor: '#FEE2E2',
        marginHorizontal: 16,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
    },
    errorText: {
        color: '#991B1B',
        fontWeight: '500',
    }
});
