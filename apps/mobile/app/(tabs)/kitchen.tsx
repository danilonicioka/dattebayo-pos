import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Largura da coluna ocupa quase a tela inteira (subtraindo padding da borda)
const COLUMN_WIDTH = width - 40;
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

    const pendingOrders = orders
        .filter((o) => o.status === 'PENDING')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const preparingOrders = orders
        .filter((o) => o.status === 'PREPARING')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Identifica o pedido mais antigo independentemente para cada coluna (Novos e Em Preparo)
    const oldestPendingId = pendingOrders.length > 0 ? pendingOrders[0].id : null;
    const oldestPreparingId = preparingOrders.length > 0 ? preparingOrders[0].id : null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View>
                        <Text style={styles.greeting}>Área de Produção</Text>
                        <Text style={styles.headerTitle}>Painel da Cozinha</Text>
                    </View>
                </View>
                {isLoading && <ActivityIndicator size="small" color="#ee8b1b" />}
            </View>

            {error ? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.board}>

                {/* Coluna PENDENTE (Novos) */}
                <View style={styles.column}>
                    <View style={[styles.columnHeader, { backgroundColor: '#ee8b1b' }]}>
                        <Text style={styles.columnTitle}>Novos ({pendingOrders.length})</Text>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.columnContent}>
                        {pendingOrders.map((order) => (
                            <KitchenOrderCard
                                key={`pending-${order.id}`}
                                order={order}
                                onUpdateStatus={updateOrderStatus}
                                isOldest={order.id === oldestPendingId}
                            />
                        ))}
                        {pendingOrders.length === 0 && (
                            <Text style={styles.emptyText}>Nenhum novo pedido</Text>
                        )}
                    </ScrollView>
                </View>

                {/* Coluna PREPARANDO */}
                <View style={styles.column}>
                    <View style={[styles.columnHeader, { backgroundColor: '#223c0e' }]}>
                        <Text style={styles.columnTitle}>Em Preparo ({preparingOrders.length})</Text>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.columnContent}>
                        {preparingOrders.map((order) => (
                            <KitchenOrderCard
                                key={`preparing-${order.id}`}
                                order={order}
                                onUpdateStatus={updateOrderStatus}
                                isOldest={order.id === oldestPreparingId}
                            />
                        ))}
                        {preparingOrders.length === 0 && (
                            <Text style={styles.emptyText}>Cozinha livre</Text>
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
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 4,
    },
    board: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    column: {
        width: COLUMN_WIDTH,
        marginRight: 16,
        backgroundColor: '#ffffff',
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
