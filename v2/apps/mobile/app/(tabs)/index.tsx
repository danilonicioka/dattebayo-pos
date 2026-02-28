import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { MenuItem } from '@dattebayo/core';
import { ShoppingCart, Plus } from 'lucide-react-native';
import { useCartStore, getCartItemCount } from '@/store/cartStore';
import { api } from '@/services/api';
import { Link, useFocusEffect, router } from 'expo-router';
import { useCallback } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedItemForVariations, setSelectedItemForVariations] = useState<MenuItem | null>(null);
  const [selectedVariations, setSelectedVariations] = useState<number[]>([]);

  const cartItems = useCartStore((state) => state.items);
  const addOrderItem = useCartStore((state) => state.addOrderItem);
  const itemCount = getCartItemCount(cartItems);

  const fetchMenu = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<MenuItem[]>('/menu');

      setItems(res.data.filter(i => {
        if (!i.available) return false;

        const isMandatoryRadio = i.variations && i.variations.length > 1 && i.variations[0].type === 'SINGLE';
        const isMandatoryMulti = i.variations && i.variations.length > 0 && i.variations[0].type === 'MULTIPLE';
        const hasMandatoryVariations = isMandatoryRadio || isMandatoryMulti;

        if (hasMandatoryVariations) {
          // Se tiver variação obrigatória, a disponibilidade no cardápio
          // depende do estoque das opções, não do item base.
          // Mostra se pelo menos uma opção tiver estoque.
          return i.variations!.some(v => v.stockQuantity === null || v.stockQuantity === undefined || v.stockQuantity > 0);
        }

        // Para itens sem variações obrigatórias, usar o estoque base
        return i.stockQuantity === null || i.stockQuantity === undefined || i.stockQuantity > 0;
      }));
    } catch (e) {
      console.error('Falha ao obter Menu Público');
    } finally {
      setIsLoading(false);
    }
  }

  // Reload data consistently when screen active/focused
  useFocusEffect(
    useCallback(() => {
      fetchMenu();
    }, [])
  );

  const handleAddItem = (item: MenuItem) => {
    // Override price if dynamic price is enabled
    const finalItem = {
      ...item,
      price: item.manualPriceEnabled && item.manualPrice != null ? item.manualPrice : item.price
    };

    if (item.variations && item.variations.length > 0) {
      setSelectedItemForVariations(finalItem);

      // Se for rádio (mais de uma variação SINGLE), pré-seleciona a primeira disponível
      const isRadio = item.variations.length > 1 && item.variations[0].type === 'SINGLE';
      if (isRadio) {
        const firstAvailable = item.variations.find(v =>
          !(v.stockQuantity !== null && v.stockQuantity !== undefined && v.stockQuantity <= 0)
        );
        if (firstAvailable) {
          setSelectedVariations([firstAvailable.id!]);
        } else {
          setSelectedVariations([]);
        }
      } else {
        setSelectedVariations([]);
      }
    } else {
      addOrderItem(finalItem);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/products')}
            style={styles.managementButton}
          >
            <IconSymbol name="gearshape.fill" size={22} color="#4B5563" />
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>Olá, Atendente</Text>
            <Text style={styles.title}>Cardápio</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Link href="/modal" asChild>
            <TouchableOpacity style={styles.cartButton}>
              <ShoppingCart color="#fff" size={24} />
              {itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#D32F2F" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id!.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.itemDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <View style={styles.priceContainer}>
                  <View>
                    <Text style={[
                      styles.price,
                      item.manualPriceEnabled && item.manualPrice != null ? { color: '#D32F2F' } : null
                    ]}>
                      R$ {(item.manualPriceEnabled && item.manualPrice != null ? item.manualPrice : item.price).toFixed(2).replace('.', ',')}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddItem(item)}
                  >
                    <Plus color="#fff" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal de Variações */}
      <Modal
        visible={!!selectedItemForVariations}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItemForVariations(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Opções para {selectedItemForVariations?.name}</Text>
            <ScrollView style={styles.variationsList}>
              {selectedItemForVariations?.variations?.map(v => {
                const isSelected = selectedVariations.includes(v.id!);
                const isOutOfStock = v.stockQuantity !== null && v.stockQuantity !== undefined && v.stockQuantity <= 0;

                return (
                  <TouchableOpacity
                    key={v.id?.toString()}
                    style={[styles.variationOption, isOutOfStock && styles.variationDisabled]}
                    disabled={isOutOfStock}
                    onPress={() => {
                      const isRadio = selectedItemForVariations && selectedItemForVariations.variations!.length > 1 && v.type === 'SINGLE';

                      if (isRadio) {
                        // Comportamento de Rádio: Sempre seleciona apenas este
                        setSelectedVariations([v.id!]);
                      } else {
                        // Comportamento normal ou Multi
                        if (isSelected) {
                          // Se for MULTIPLE, só desmarca se tiver mais de um selecionado? 
                          // Não, deixamos desmarcar, mas o botão confirmar bloqueia.
                          setSelectedVariations(curr => curr.filter(id => id !== v.id!));
                        } else {
                          setSelectedVariations(curr => [...curr, v.id!]);
                        }
                      }
                    }}
                  >
                    <View>
                      <Text style={[styles.variationName, isOutOfStock && styles.variationDisabledText]}>
                        {v.name} {isOutOfStock && "(Esgotado)"}
                      </Text>
                      {v.additionalPrice > 0 && (
                        <Text style={[styles.variationPrice, isOutOfStock && styles.variationDisabledText]}>
                          + R$ {v.additionalPrice.toFixed(2).replace('.', ',')}
                        </Text>
                      )}
                    </View>
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                      isOutOfStock && styles.checkboxDisabled
                    ]}>
                      {isSelected && <Text style={styles.checkboxTick}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            {(() => {
              const isMandatoryRadio = selectedItemForVariations && selectedItemForVariations.variations!.length > 1 && selectedItemForVariations.variations![0].type === 'SINGLE';
              const isMandatoryMulti = selectedItemForVariations && selectedItemForVariations.variations![0].type === 'MULTIPLE';
              const isMissingMandatory = (isMandatoryRadio || isMandatoryMulti) && selectedVariations.length === 0;
              if (isMissingMandatory) {
                return (
                  <Text style={{ color: '#D32F2F', fontSize: 13, textAlign: 'center', marginVertical: 8, fontWeight: '500' }}>
                    * Seleção obrigatória
                  </Text>
                );
              }
              return null;
            })()}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedItemForVariations(null)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  (() => {
                    const isMandatoryRadio = selectedItemForVariations && selectedItemForVariations.variations!.length > 1 && selectedItemForVariations.variations![0].type === 'SINGLE';
                    const isMandatoryMulti = selectedItemForVariations && selectedItemForVariations.variations![0].type === 'MULTIPLE';
                    const isMissingMandatory = (isMandatoryRadio || isMandatoryMulti) && selectedVariations.length === 0;
                    return isMissingMandatory ? { backgroundColor: '#9CA3AF' } : null;
                  })()
                ]}
                onPress={() => {
                  if (selectedItemForVariations) {
                    const isMandatoryRadio = selectedItemForVariations.variations!.length > 1 && selectedItemForVariations.variations![0].type === 'SINGLE';
                    const isMandatoryMulti = selectedItemForVariations.variations![0].type === 'MULTIPLE';
                    const isMissingMandatory = (isMandatoryRadio || isMandatoryMulti) && selectedVariations.length === 0;

                    if (isMissingMandatory) return;

                    const varsToApply = selectedItemForVariations.variations?.filter(v => selectedVariations.includes(v.id!)).map(v => ({
                      menuItemVariationId: v.id!,
                      name: v.name,
                      additionalPrice: v.additionalPrice
                    })) || [];
                    addOrderItem(selectedItemForVariations, 1, varsToApply);
                    setSelectedItemForVariations(null);
                  }
                }}>
                <Text style={styles.confirmBtnText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
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
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D32F2F', // Restaurante red
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#1A1A1A',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  managementButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
  },
  cardInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  itemDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },

  addButton: {
    backgroundColor: '#1A1A1A',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  variationsList: {
    marginBottom: 24,
  },
  variationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  variationName: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  variationPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  checkboxTick: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#4B5563',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  variationDisabled: {
    backgroundColor: '#F9FAFB',
    opacity: 0.6,
  },
  variationDisabledText: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  checkboxDisabled: {
    backgroundColor: '#E5E7EB',
    borderColor: '#D1D5DB',
  }
});
