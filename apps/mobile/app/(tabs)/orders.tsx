import { useEffect, useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/services/api';
import { socket } from '@/services/socket';
import { useOrdersStore } from '@/store/ordersStore';
import { OrderStatus } from '@dattebayo/core';
import { Clock, ChefHat, CheckCircle2, ChevronDown, Utensils, Flame, Wifi, WifiOff } from 'lucide-react-native';
import { formatProductNameWithVariations } from '@/utils/formatters';
import { scale, fontScale, verticalScale } from '@/utils/responsive';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useToastStore } from '@/store/toastStore';
import { useCartStore } from '@/store/cartStore';
import { router } from 'expo-router';
// Interface básica baseada no Core simplificado para o frontend
interface OrderResponse {
    id: number;
    tableNumber: string | null;
    status: string;
    createdAt: string;
    items: {
        quantity: number;
        price: number;
        menuItemName: string;
        variations?: { name: string, additionalPrice: number }[];
    }[];
}

export default function OrdersScreen() {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [filter, setFilter] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
    const { updateOrderStatus } = useOrdersStore();
    const triggerToast = useToastStore(state => state.triggerToast);

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

    const handleUpdateStatus = async (orderId: number, nextStatus: OrderStatus) => {
        closeConfirmModal();
        try {
            await updateOrderStatus(orderId, nextStatus);
            triggerToast(nextStatus === 'COMPLETED' ? 'Pedido entregue com sucesso!' : 'Pedido cancelado.', 'success');
            fetchOrders();
        } catch (error) {
            triggerToast('Erro ao atualizar pedido.', 'error');
        }
    };

    const fetchOrders = useCallback(async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchOrders();

            const handleUpdate = () => {
                console.log('Mobile Real-time update: fetching orders...');
                fetchOrders();
            };

            const onConnect = () => {
                setIsConnected(true);
                fetchOrders(); // Sync on reconnect
            };

            const onDisconnect = () => {
                setIsConnected(false);
            };

            socket.on('order_created', handleUpdate);
            socket.on('order_updated', handleUpdate);
            socket.on('connect', onConnect);
            socket.on('disconnect', onDisconnect);

            return () => {
                socket.off('order_created', handleUpdate);
                socket.off('order_updated', handleUpdate);
                socket.off('connect', onConnect);
                socket.off('disconnect', onDisconnect);
            };
        }, [fetchOrders])
    );
 
    const handleConcludeAll = async () => {
        openConfirmModal(
            'Concluir Todos',
            'Tem certeza que deseja concluir TODOS os pedidos ativos? Esta ação moverá todos para o histórico.',
            'success',
            async () => {
                closeConfirmModal();
                try {
                    setIsLoading(true);
                    // Chamada para o endpoint WEB (fora do /api)
                    await api.post('../orders/conclude-all');
                    triggerToast('Todos os pedidos concluídos! ✅', 'success');
                    fetchOrders();
                } catch (error) {
                    console.error('Erro ao concluir todos:', error);
                    triggerToast('Erro ao concluir todos os pedidos.', 'error');
                    setIsLoading(false);
                }
            }
        );
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const calculateTotal = (items: OrderResponse['items']) => {
        return items.reduce((total, item) =>
            total + ((item.price + (item.variations?.reduce((acc, v) => acc + v.additionalPrice, 0) || 0)) * item.quantity)
            , 0);
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
                return <View style={[styles.statusBadge, { backgroundColor: '#E0E0E0' }]}><Text style={[styles.statusText, { color: '#666' }]}>Finalizado/Entregue</Text></View>;
            case 'CANCELLED':
                return <View style={[styles.statusBadge, { backgroundColor: '#E57373' }]}><Text style={styles.statusText}>Cancelado</Text></View>;
            default:
                return <View style={[styles.statusBadge, { backgroundColor: '#E0E0E0' }]}><Text style={[styles.statusText, { color: '#666' }]}>{status}</Text></View>;
        }
    };

    const filteredOrders = useMemo(() => {
        const filtered = orders.filter(order => {
            if (filter === 'ACTIVE') {
                return ['PENDING', 'PREPARING', 'READY'].includes(order.status);
            }
            return ['COMPLETED', 'CANCELLED'].includes(order.status);
        });

        // Ordena: Em Andamento (Mais antigo primeiro), Histórico (Mais recente primeiro)
        return filtered.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return filter === 'ACTIVE' ? timeA - timeB : timeB - timeA;
        });
    }, [orders, filter]);

    if (isLoading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ee8b1b" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>Meus Pedidos</Text>
                    <View style={[styles.connectionBadge, isConnected ? styles.onlineBadge : styles.offlineBadge]}>
                        {isConnected ? <Wifi size={14} color="#4CAF50" /> : <WifiOff size={14} color="#F44336" />}
                        <Text style={styles.connectionText}>{isConnected ? 'Online' : 'Offline'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.filterContainer}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'ACTIVE' && styles.filterButtonActive]}
                        onPress={() => setFilter('ACTIVE')}
                    >
                        <Text style={[styles.filterText, filter === 'ACTIVE' && styles.filterTextActive]}>Em Andamento</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'HISTORY' && styles.filterButtonActive]}
                        onPress={() => setFilter('HISTORY')}
                    >
                        <Text style={[styles.filterText, filter === 'HISTORY' && styles.filterTextActive]}>Histórico</Text>
                    </TouchableOpacity>
                </View>

                {filter === 'ACTIVE' && orders.some(o => ['PENDING', 'PREPARING', 'READY'].includes(o.status)) && (
                    <TouchableOpacity
                        style={styles.concludeAllButton}
                        onPress={handleConcludeAll}
                    >
                        <CheckCircle2 size={scale(16)} color="#ffffff" />
                        <Text style={styles.concludeAllText}>Concluir Todos</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ee8b1b']} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhum pedido encontrado.</Text>
                    </View>
                }
                renderItem={({ item, index }) => {
                    const isNextInLine = filter === 'ACTIVE' && index === 0;

                    return (
                        <View style={[styles.card, isNextInLine && styles.cardHighlight]}>
                            <View style={styles.cardHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(6) }}>
                                    {isNextInLine && (
                                        <Flame size={scale(20)} color="#EF4444" fill="#EF4444" />
                                    )}
                                    <View>
                                        <Text style={styles.orderId}>
                                            {item.tableNumber ? `${item.tableNumber} #${item.id}` : `Pedido #${item.id}`}
                                        </Text>
                                        <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                    </View>
                                </View>
                                {renderStatus(item.status)}
                            </View>

                            <View style={styles.divider} />

                            {item.items.map((orderItem, idx) => (
                                <View key={idx} style={{ marginBottom: 8 }}>
                                    <View style={styles.itemRow}>
                                        <Text style={styles.itemQty}>{orderItem.quantity}x</Text>
                                        <Text style={styles.itemName} numberOfLines={2}>
                                            {formatProductNameWithVariations(orderItem.menuItemName, orderItem.variations)}
                                        </Text>
                                        <Text style={styles.itemPrice}>
                                            R$ {((orderItem.price + (orderItem.variations?.reduce((acc, v) => acc + v.additionalPrice, 0) || 0)) * orderItem.quantity).toFixed(2).replace('.', ',')}
                                        </Text>
                                    </View>
                                </View>
                            ))}

                            <View style={styles.divider} />

                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalValue}>R$ {calculateTotal(item.items).toFixed(2).replace('.', ',')}</Text>
                            </View>

                            {filter === 'ACTIVE' && (
                                <View style={styles.actionsContainer}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.editButton]}
                                        onPress={() => {
                                            useCartStore.getState().initializeFromOrder(item);
                                            router.push('/');
                                        }}
                                    >
                                        <Text style={styles.editText}>Editar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.cancelButton]}
                                        onPress={() => openConfirmModal(
                                            'Cancelar Pedido',
                                            `Deseja realmente cancelar o pedido #${item.id}?`,
                                            'danger',
                                            () => handleUpdateStatus(item.id, 'CANCELLED')
                                        )}
                                    >
                                        <Text style={styles.cancelText}>Cancelar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.deliverButton]}
                                        onPress={() => openConfirmModal(
                                            'Entregar ao Cliente',
                                            `Confirmar a entrega do pedido #${item.id} ao cliente?`,
                                            'success',
                                            () => handleUpdateStatus(item.id, 'COMPLETED')
                                        )}
                                    >
                                        <Text style={styles.deliverText}>Entregar</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )
                }}
            />
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.action}
                onCancel={closeConfirmModal}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F9FC',
    },
    header: {
        paddingHorizontal: scale(24),
        paddingTop: verticalScale(60),
        paddingBottom: verticalScale(20),
        backgroundColor: '#223c0e',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
    },
    connectionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    onlineBadge: {
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
    },
    offlineBadge: {
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
    },
    connectionText: {
        fontSize: fontScale(12),
        fontWeight: '600',
        color: 'white',
    },
    title: {
        fontSize: fontScale(28),
        fontWeight: 'bold',
        color: '#ffffff',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: scale(24),
        paddingBottom: verticalScale(16),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    filterButton: {
        flex: 1,
        paddingVertical: verticalScale(8),
        alignItems: 'center',
        borderBottomWidth: scale(2),
        borderBottomColor: 'transparent',
    },
    filterButtonActive: {
        borderBottomColor: '#ee8b1b',
    },
    filterText: {
        fontSize: fontScale(15),
        fontWeight: '600',
        color: '#888',
    },
    filterTextActive: {
        color: '#ee8b1b',
    },
    concludeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        backgroundColor: '#ee8b1b', // Dattebayo Orange
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: scale(16),
        marginLeft: scale(8),
        alignSelf: 'center',
    },
    concludeAllText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: fontScale(12),
    },
    listContainer: {
        padding: scale(24),
        paddingBottom: verticalScale(100),
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: verticalScale(40),
    },
    emptyText: {
        fontSize: fontScale(16),
        color: '#666',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: verticalScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.05,
        shadowRadius: scale(8),
        elevation: 2,
    },
    cardHighlight: {
        borderWidth: scale(3),
        borderColor: '#EF4444',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: verticalScale(4) },
        shadowOpacity: 0.3,
        shadowRadius: scale(8),
        elevation: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    orderId: {
        fontSize: fontScale(18),
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    timeText: {
        fontSize: fontScale(14),
        color: '#888',
        marginTop: verticalScale(2),
    },
    statusBadge: {
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(4),
        borderRadius: scale(8),
    },
    statusText: {
        color: '#fff',
        fontSize: fontScale(12),
        fontWeight: 'bold',
    },
    divider: {
        height: verticalScale(1),
        backgroundColor: '#F0F0F0',
        marginVertical: verticalScale(12),
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    itemQty: {
        width: scale(24),
        fontSize: fontScale(14),
        fontWeight: 'bold',
        color: '#666',
    },
    itemName: {
        flex: 1,
        fontSize: fontScale(14),
        color: '#1A1A1A',
        paddingRight: scale(8),
    },
    itemExtra: {
        fontSize: fontScale(12),
        color: '#6B7280',
        paddingLeft: scale(24),
        marginTop: verticalScale(-4),
        fontStyle: 'italic',
    },
    itemPrice: {
        fontSize: fontScale(14),
        color: '#666',
        fontWeight: '500',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: fontScale(14),
        color: '#666',
    },
    totalValue: {
        fontSize: fontScale(18),
        fontWeight: 'bold',
        color: '#ee8b1b',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(16),
        paddingTop: verticalScale(16),
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        gap: scale(12),
    },
    actionButton: {
        flex: 1,
        paddingVertical: verticalScale(10),
        borderRadius: scale(8),
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#3B82F6', // Blue for Edit
    },
    editText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#FFF2F2',
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    cancelText: {
        color: '#D32F2F',
        fontWeight: 'bold',
    },
    deliverButton: {
        backgroundColor: '#ee8b1b', // Dattebayo Orange
    },
    deliverText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    }
});
