import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { MenuItem } from '@dattebayo/core';
import { api } from '@/services/api';
import { Edit2, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function GerenciarScreen() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMenu = async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Aqui carregamos TODOS os itens da API
            const response = await api.get<MenuItem[]>('/menu');
            setItems(response.data);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar cardápio');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const handleToggleAvailability = async (item: MenuItem, newValue: boolean) => {
        // Optimistic Update UI
        setItems(current => current.map(i => i.id === item.id ? { ...i, available: newValue } : i));

        try {
            await api.patch(`/menu/${item.id}`, { available: newValue });
        } catch (err: any) {
            console.log('FALHA DE PATCH MENU:', err.response?.data || err.message);
            Alert.alert('Erro', 'Não foi possível atualizar o status do produto.');
            // Revert in case of failure
            setItems(current => current.map(i => i.id === item.id ? { ...i, available: !newValue } : i));
        }
    };

    // Agrupar Itens por Categoria para exibir na tela admin
    const categorias = Array.from(new Set(items.map(item => item.category)));

    if (isLoading && items.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#E11D48" />
                <Text style={styles.loadingText}>Carregando Produtos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => router.replace('/')} style={{ marginRight: 12 }}>
                        <IconSymbol name="chevron.left" color="#1A1A1A" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Gerenciamento</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/edit-item' as any)}
                >
                    <Plus color="#fff" size={20} />
                    <Text style={styles.addButtonText}>Novo Item</Text>
                </TouchableOpacity>
            </View>

            {error ? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchMenu}><Text style={styles.retryText}>Tentar Novamente</Text></TouchableOpacity>
                </View>
            ) : null}

            <ScrollView style={styles.scrollArea}>
                {categorias.map(categoria => (
                    <View key={categoria} style={styles.categorySection}>
                        <Text style={styles.categoryTitle}>{categoria}</Text>

                        {items.filter(i => i.category === categoria).map(item => (
                            <View key={item.id} style={[styles.itemCard, !item.available && styles.itemCardDisabled]}>

                                <View style={styles.itemInfo}>
                                    <Text style={[styles.itemName, !item.available && styles.textDisabled]}>{item.name}</Text>
                                    <Text style={[
                                        styles.itemPrice,
                                        item.manualPriceEnabled && item.manualPrice != null ? { color: '#6366F1' } : null
                                    ]}>
                                        R$ {(item.manualPriceEnabled && item.manualPrice != null ? item.manualPrice : item.price).toFixed(2).replace('.', ',')}
                                    </Text>

                                    {item.variations && item.variations.length > 0 && (
                                        <View style={{ marginTop: 4 }}>
                                            <Text style={styles.variationsCount}>
                                                {item.variations.length} variaçõe(s)
                                            </Text>
                                            {item.variations.some(v => v.stockQuantity === 0) && (
                                                <Text style={styles.variationAlert}>
                                                    ⚠️ {item.variations.filter(v => v.stockQuantity === 0).length} esgotada(s)
                                                </Text>
                                            )}
                                        </View>
                                    )}

                                    {item.stockQuantity !== undefined && (
                                        <View style={styles.stockInfo}>
                                            <IconSymbol name="package.fill" size={12} color={item.stockQuantity === 0 ? '#EF4444' : '#6B7280'} />
                                            <Text style={[
                                                styles.stockText,
                                                item.stockQuantity === 0 && { color: '#EF4444', fontWeight: 'bold' }
                                            ]}>
                                                {item.stockQuantity === null ? 'Estoque Ilimitado' : `${item.stockQuantity} em estoque`}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Controles Administrativos */}
                                <View style={styles.itemControls}>
                                    <View style={styles.switchGroup}>
                                        <Text style={[styles.switchLabel, !item.available && styles.textDisabled]}>
                                            {item.available ? 'Ativo' : 'Esgotado'}
                                        </Text>
                                        <Switch
                                            value={item.available}
                                            onValueChange={(val) => handleToggleAvailability(item, val)}
                                            trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                                            thumbColor={item.available ? '#fff' : '#f4f3f4'}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() => router.push({ pathname: '/edit-item', params: { id: item.id } } as any)}
                                    >
                                        <Edit2 size={20} color="#4B5563" />
                                    </TouchableOpacity>
                                </View>

                            </View>
                        ))}
                    </View>
                ))}

                {items.length === 0 && !isLoading && (
                    <Text style={styles.emptyText}>Nenhum produto cadastrado no sistema.</Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingTop: 48,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#6B7280',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111827',
        flexShrink: 1,
        marginRight: 8,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E11D48',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    scrollArea: {
        paddingHorizontal: 16,
    },
    categorySection: {
        marginBottom: 24,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 8,
    },
    itemCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    itemCardDisabled: {
        backgroundColor: '#F9FAFB',
        opacity: 0.7,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    itemPrice: {
        fontSize: 15,
        color: '#059669',
        fontWeight: '600',
        marginTop: 4,
    },

    variationsCount: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    variationAlert: {
        fontSize: 11,
        color: '#EF4444',
        fontWeight: 'bold',
        marginTop: 2,
    },
    stockInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 6,
    },
    stockText: {
        fontSize: 12,
        color: '#6B7280',
    },
    textDisabled: {
        color: '#9CA3AF',
    },
    itemControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    switchGroup: {
        alignItems: 'center',
    },
    switchLabel: {
        fontSize: 10,
        color: '#111827',
        marginBottom: 4,
        fontWeight: '500',
    },
    editButton: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    errorBox: {
        backgroundColor: '#FEE2E2',
        marginHorizontal: 16,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: '#991B1B',
    },
    retryText: {
        color: '#B91C1C',
        fontWeight: 'bold',
        marginTop: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 40,
        fontStyle: 'italic',
    }
});
