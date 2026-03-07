import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { useFocusEffect, Stack } from 'expo-router';
import { Wifi, WifiOff } from 'lucide-react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

import { scale, fontScale, verticalScale } from '@/utils/responsive';
// Largura da coluna ocupa quase a tela inteira (subtraindo padding da borda)
const COLUMN_WIDTH = width - scale(40);
import { useOrdersStore } from '@/store/ordersStore';
import { socket } from '@/services/socket';
import { OrderStatus } from '@dattebayo/core';
import { KitchenOrderCard } from '@/components/KitchenOrderCard';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useToastStore } from '@/store/toastStore';

export default function KitchenScreen() {
    const { orders, fetchOrders, updateOrderStatus, isLoading, error } = useOrdersStore();
    const triggerToast = useToastStore(state => state.triggerToast);
    const [isConnected, setIsConnected] = useState(socket.connected);

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

    const handleRequestUpdateStatus = (orderId: number, nextStatus: OrderStatus) => {
        const order = orders.find(o => o.id === orderId);
        const displayName = order?.tableNumber ? `${order.tableNumber}` : `Pedido #${orderId}`;

        let title = '';
        let message = '';
        let type: 'info' | 'success' = 'info';

        if (nextStatus === 'PREPARING') {
            title = 'Aceitar Pedido';
            message = `Iniciar o preparo para ${displayName}?`;
        } else if (nextStatus === 'READY') {
            title = 'Marcar como Pronto';
            message = `O ${displayName} já está pronto para entrega?`;
            type = 'success';
        } else if (nextStatus === 'COMPLETED') {
            title = 'Entregar';
            message = `Confirmar entrega do ${displayName} ao cliente?`;
            type = 'success';
        }

        openConfirmModal(title, message, type, () => performUpdateStatus(orderId, nextStatus));
    };

    const performUpdateStatus = async (orderId: number, nextStatus: OrderStatus) => {
        closeConfirmModal();
        try {
            await updateOrderStatus(orderId, nextStatus);

            const msgs: Record<string, string> = {
                'PREPARING': 'Pedido em preparação.',
                'READY': 'Pedido pronto!',
                'COMPLETED': 'Pedido entregue.'
            };
            triggerToast(msgs[nextStatus] || 'Atualizado.', 'success');
            fetchOrders();
        } catch (err) {
            triggerToast('Erro ao atualizar.', 'error');
        }
    };

    const notificationPlayer = useAudioPlayer(require('@/assets/notification.mp3'));

    const playNotification = () => {
        try {
            // Vibração
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Som
            notificationPlayer.seekTo(0);
            notificationPlayer.play();
        } catch (error) {
            console.error('Error playing notification:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders();

            const handleUpdate = () => {
                console.log('Mobile Kitchen Real-time update: fetching orders...');
                fetchOrders();
            };

            const handleNewOrder = () => {
                console.log('Mobile: New order received! Notifying...');
                playNotification();
                fetchOrders();
            };

            const onConnect = () => {
                setIsConnected(true);
                fetchOrders(); // Sync on reconnect
            };

            const onDisconnect = () => {
                setIsConnected(false);
            };

            socket.on('order_created', handleNewOrder);
            socket.on('order_updated', handleUpdate);
            socket.on('connect', onConnect);
            socket.on('disconnect', onDisconnect);

            return () => {
                socket.off('order_created', handleNewOrder);
                socket.off('order_updated', handleUpdate);
                socket.off('connect', onConnect);
                socket.off('disconnect', onDisconnect);
            };
        }, [fetchOrders])
    );

    const pendingOrders = orders
        .filter((o) => o.status === 'PENDING')
        .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

    const preparingOrders = orders
        .filter((o) => o.status === 'PREPARING')
        .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

    // Identifica o pedido mais antigo independentemente para cada coluna (Novos e Em Preparo)
    const oldestPendingId = pendingOrders.length > 0 ? pendingOrders[0].id : null;
    const oldestPreparingId = preparingOrders.length > 0 ? preparingOrders[0].id : null;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Cozinha', headerBackTitle: 'Voltar' }} />
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(12) }}>
                    <View>
                        <Text style={styles.greeting}>Área de Produção</Text>
                        <Text style={styles.headerTitle}>Painel da Cozinha</Text>
                    </View>
                    <View style={[styles.connectionBadge, isConnected ? styles.onlineBadge : styles.offlineBadge]}>
                        {isConnected ? <Wifi size={14} color="#4CAF50" /> : <WifiOff size={14} color="#F44336" />}
                        <Text style={styles.connectionText}>{isConnected ? 'Online' : 'Offline'}</Text>
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
                                onUpdateStatus={handleRequestUpdateStatus}
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
                                onUpdateStatus={handleRequestUpdateStatus}
                                isOldest={order.id === oldestPreparingId}
                            />
                        ))}
                        {preparingOrders.length === 0 && (
                            <Text style={styles.emptyText}>Cozinha livre</Text>
                        )}
                    </ScrollView>
                </View>

            </ScrollView>

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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(24),
        paddingTop: verticalScale(16),
        paddingBottom: verticalScale(16),
        backgroundColor: '#223c0e',
        borderBottomWidth: 0,
        marginBottom: verticalScale(16),
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
    greeting: {
        fontSize: fontScale(14),
        color: '#d4edda',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: fontScale(28),
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: verticalScale(4),
    },
    board: {
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(16),
    },
    column: {
        width: COLUMN_WIDTH,
        marginRight: scale(16),
        backgroundColor: '#ffffff',
        borderRadius: scale(16),
        overflow: 'hidden',
    },
    columnHeader: {
        padding: scale(16),
        borderTopLeftRadius: scale(16),
        borderTopRightRadius: scale(16),
    },
    columnTitle: {
        color: '#fff',
        fontSize: fontScale(18),
        fontWeight: 'bold',
    },
    columnContent: {
        padding: scale(16),
        paddingBottom: verticalScale(40),
        flexGrow: 1,
    },
    emptyText: {
        color: '#9CA3AF',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: verticalScale(32),
    },
    errorBox: {
        backgroundColor: '#FEE2E2',
        marginHorizontal: scale(16),
        padding: scale(12),
        borderRadius: scale(8),
        marginBottom: verticalScale(16),
        borderLeftWidth: scale(4),
        borderLeftColor: '#EF4444',
    },
    errorText: {
        color: '#991B1B',
        fontWeight: '500',
    }
});
