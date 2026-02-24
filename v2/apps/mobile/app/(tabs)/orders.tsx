import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { api } from '@/services/api';

// Interface básica baseada no Core simplificado para o frontend
interface OrderResponse {
    id: number;
    tableNumber: string | null;
    status: string;
    createdAt: string;
    items: {
        quantity: number;
        price: number;
        name: string;
    }[];
}

export default function OrdersScreen() {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const calculateTotal = (items: OrderResponse['items']) => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const renderStatus = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <View style={[styles.statusBadge, { backgroundColor: '#FFD54F' }]}><Text style={styles.statusText}>Pendente</Text></View>;
            case 'PREPARING':
                return <View style={[styles.statusBadge, { backgroundColor: '#4FC3F7' }]}><Text style={styles.statusText}>Preparando</Text></View>;
            case 'READY':
                return <View style={[styles.statusBadge, { backgroundColor: '#81C784' }]}><Text style={styles.statusText}>Pronto</Text></View>;
            case 'COMPLETED':
                return <View style={[styles.statusBadge, { backgroundColor: '#E0E0E0' }]}><Text style={[styles.statusText, { color: '#666' }]}>Finalizado</Text></View>;
            case 'CANCELLED':
                return <View style={[styles.statusBadge, { backgroundColor: '#E57373' }]}><Text style={styles.statusText}>Cancelado</Text></View>;
            default:
                return <View style={[styles.statusBadge, { backgroundColor: '#E0E0E0' }]}><Text style={[styles.statusText, { color: '#666' }]}>{status}</Text></View>;
        }
    };

    if (isLoading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D32F2F" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Meus Pedidos</Text>
            </View>

            <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#D32F2F']} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhum pedido encontrado.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.orderId}>Pedido #{item.id}</Text>
                                <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                            </View>
                            {renderStatus(item.status)}
                        </View>

                        <View style={styles.divider} />

                        {item.items.map((orderItem, idx) => (
                            <View key={idx} style={styles.itemRow}>
                                <Text style={styles.itemQty}>{orderItem.quantity}x</Text>
                                <Text style={styles.itemName} numberOfLines={1}>{orderItem.name}</Text>
                                <Text style={styles.itemPrice}>R$ {(orderItem.price * orderItem.quantity).toFixed(2).replace('.', ',')}</Text>
                            </View>
                        ))}

                        <View style={styles.divider} />

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>R$ {calculateTotal(item.items).toFixed(2).replace('.', ',')}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F9FC',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    listContainer: {
        padding: 24,
        paddingBottom: 100,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    orderId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    timeText: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemQty: {
        width: 24,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
    },
    itemName: {
        flex: 1,
        fontSize: 14,
        color: '#1A1A1A',
        paddingRight: 8,
    },
    itemPrice: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        color: '#666',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D32F2F',
    }
});
