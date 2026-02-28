import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OrderResponseDTO, OrderItemResponseDTO, OrderStatus } from '@dattebayo/core';
import { CheckCircle2, ChefHat, Clock, Utensils } from 'lucide-react-native';

interface KitchenOrderCardProps {
    order: OrderResponseDTO;
    onUpdateStatus: (orderId: number, nextStatus: OrderStatus) => void;
    isOldest?: boolean;
}

export function KitchenOrderCard({ order, onUpdateStatus, isOldest = false }: KitchenOrderCardProps) {

    const handleStatusAdvance = () => {
        if (order.status === 'PENDING' || order.status === 'PREPARING') {
            onUpdateStatus(order.id, 'READY');
        }
    };

    const getStatusColor = () => {
        switch (order.status) {
            case 'PENDING':
            case 'PREPARING': return '#F59E0B';  // Laranja
            case 'READY': return '#10B981';      // Verde
            default: return '#6B7280';           // Cinza
        }
    };

    const getActionLabel = () => {
        switch (order.status) {
            case 'PENDING':
            case 'PREPARING': return 'Marcar como Pronto';
            default: return '';
        }
    };

    const getIcon = () => {
        switch (order.status) {
            case 'PENDING':
            case 'PREPARING': return <ChefHat color="#fff" size={18} />;
            case 'READY': return <CheckCircle2 color="#fff" size={18} />;
            default: return <Utensils color="#fff" size={18} />;
        }
    }

    return (
        <View style={[
            styles.card,
            { borderTopColor: getStatusColor() },
            isOldest && styles.oldestCard
        ]}>

            {/* Cabeçalho do Ticket */}
            <View style={styles.header}>
                <Text style={styles.tableText}>{order.tableNumber}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {isOldest && (
                        <View style={styles.urgentBadge}>
                            <Text style={styles.urgentText}>Próximo</Text>
                        </View>
                    )}
                    <Text style={styles.idText}>#{order.id}</Text>
                </View>
            </View>
            <Text style={styles.timeText}>
                {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Text>

            {/* Itens do Pedido */}
            <View style={styles.itemsList}>
                {order.items.map((item: OrderItemResponseDTO) => (
                    <View key={item.id} style={styles.itemRow}>
                        <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                        <View style={styles.itemDetails}>
                            <Text style={styles.itemName}>{item.name}</Text>

                            {/* Variações e Extras */}
                            {item.variations?.map((v) => (
                                <Text key={v.id} style={styles.itemExtra}>+ {v.name}</Text>
                            ))}

                            {/* Observações */}
                            {item.specialInstructions ? (
                                <Text style={styles.itemNote}>Obs: {item.specialInstructions}</Text>
                            ) : null}
                        </View>
                    </View>
                ))}
            </View>

            {/* Notas Gerais do Pedido */}
            {order.notes ? (
                <View style={styles.generalNotes}>
                    <Text style={styles.generalNotesText}>Mesa: {order.notes}</Text>
                </View>
            ) : null}

            {/* Botão de Ação do Ticket */}
            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: getStatusColor() }]}
                    onPress={handleStatusAdvance}
                    activeOpacity={0.8}
                >
                    {getIcon()}
                    <Text style={styles.actionText}>{getActionLabel()}</Text>
                </TouchableOpacity>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderTopWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: 280, // Largura fixa para ficar bonito no scroll horizontal do Kanban
        marginRight: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    tableText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    idText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    timeText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 12,
    },
    itemsList: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    oldestCard: {
        borderWidth: 2,
        borderColor: '#EF4444',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    urgentBadge: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#FCA5A5'
    },
    urgentText: {
        color: '#B91C1C',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    itemRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    itemQuantity: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
        width: 24,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    itemExtra: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
        paddingLeft: 4,
    },
    itemNote: {
        fontSize: 12,
        fontStyle: 'italic',
        color: '#D97706',
        marginTop: 2,
        paddingLeft: 4,
    },
    generalNotes: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 8,
        marginBottom: 12,
    },
    generalNotesText: {
        fontSize: 13,
        color: '#4B5563',
        fontStyle: 'italic',
    },
    actionButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    }
});
