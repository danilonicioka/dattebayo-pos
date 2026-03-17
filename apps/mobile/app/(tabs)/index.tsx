import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { MenuItem } from '@dattebayo/core';
import { ShoppingCart, Plus, ChefHat } from 'lucide-react-native';
import { useCartStore, getCartItemCount } from '@/store/cartStore';
import { api } from '@/services/api';
import { Link, useFocusEffect, router } from 'expo-router';
import { useCallback } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { scale, fontScale, verticalScale } from '@/utils/responsive';

export default function HomeScreen() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedItemForVariations, setSelectedItemForVariations] = useState<MenuItem | null>(null);
  const [selectedVariations, setSelectedVariations] = useState<number[]>([]);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

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
      console.error('Falha ao obter Menu Público:', e);
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

    setSelectedItemForVariations(finalItem);
    setSelectedQuantity(1);

    if (item.variations && item.variations.length > 0) {
      const isRadio = item.variations.some(v => v.type === 'SINGLE');
      if (isRadio) {
        // Cálculo de consumo total no carrinho para o Camarão Milanesa
        let camaraoCartConsumption = 0;
        const itemName = (item.name || '').toLowerCase();
        const isCamarao = item.id === 10 || itemName.includes('camarão milanesa');

        if (isCamarao) {
          camaraoCartConsumption = cartItems.reduce((acc, cartItem) => {
            const cItemName = (cartItem.menuItem.name || '').toLowerCase();
            if (cartItem.menuItem.id === 10 || cItemName.includes('camarão milanesa')) {
              const units = cartItem.variations?.reduce((u: number, v: any) => {
                const vId = Number(v.menuItemVariationId || v.id);
                const vName = (v.name || '').toLowerCase();
                if (vId === 19 || vName === 'unidade') return u + 1; // Unidade
                if (vId === 20 || vName.includes('porção')) return u + 5; // Porção
                return u;
              }, 0) || 0;
              return acc + (units * cartItem.quantity);
            }
            return acc;
          }, 0);
        }

        const firstAvailable = item.variations!.find(v => {
          let effectiveStock = null;
          if (isCamarao) {
            if (item.stockQuantity !== null && item.stockQuantity !== undefined) {
              const vName = (v.name || '').toLowerCase();
              if (v.id === 19 || vName === 'unidade') effectiveStock = item.stockQuantity - camaraoCartConsumption;
              else if (v.id === 20 || vName.includes('porção')) effectiveStock = Math.floor((item.stockQuantity - camaraoCartConsumption) / 5);
            }
          } else {
            const variationCartCount = cartItems.reduce((acc, cartItem) => acc + (cartItem.variations?.some((cartVar: any) => String(cartVar.menuItemVariationId || cartVar.id) === String(v.id)) ? cartItem.quantity : 0), 0);
            effectiveStock = v.stockQuantity !== null && v.stockQuantity !== undefined ? v.stockQuantity - variationCartCount : null;
          }
          return !(effectiveStock !== null && effectiveStock <= 0);
        });
        if (firstAvailable) {
          setSelectedVariations([firstAvailable.id!]);
        } else {
          setSelectedVariations([]);
        }
      } else {
        setSelectedVariations([]);
      }
    } else {
      setSelectedVariations([]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(12) }}>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/products')}
            style={styles.managementButton}
          >
            <IconSymbol name="gearshape.fill" size={scale(22)} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/kitchen')}
            style={styles.managementButton}
          >
            <ChefHat size={scale(22)} color="#ffffff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>Olá, Atendente</Text>
            <Text style={styles.title}>Caixa</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Link href="/modal" asChild>
            <TouchableOpacity style={styles.cartButton}>
              <ShoppingCart color="#fff" size={scale(24)} />
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
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#ee8b1b" />
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
                    <Plus color="#fff" size={scale(20)} />
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
            <Text style={styles.modalTitle}>
              {selectedItemForVariations?.variations?.length ? `Opções para ${selectedItemForVariations?.name}` : `Adicionar ${selectedItemForVariations?.name}`}
            </Text>
            <ScrollView style={styles.variationsList}>
              {selectedItemForVariations?.variations?.map((v: any) => {
                const variationCartCount = cartItems.reduce((acc, item) => acc + (item.variations?.some((cartVar: any) => String(cartVar.menuItemVariationId || cartVar.id) === String(v.id)) ? item.quantity : 0), 0);
                
                let effectiveStock = null;
                // Caso especial Camarão Milanesa
                const itemName = (selectedItemForVariations?.name || '').toLowerCase();
                const isCamarao = selectedItemForVariations?.id === 10 || itemName.includes('camarão milanesa');

                if (isCamarao) {
                  const camaraoCartConsumption = cartItems.reduce((acc, item) => {
                    const cItemName = (item.menuItem?.name || (item as any).name || '').toLowerCase();
                    if (item.id === 10 || (item as any).productId === 10 || cItemName.includes('camarão milanesa')) {
                      const units = item.variations?.reduce((u: number, v: any) => {
                        const vId = Number(v.menuItemVariationId || v.id);
                        const vName = (v.name || '').toLowerCase();
                        if (vId === 19 || vName === 'unidade') return u + 1; // Unidade
                        if (vId === 20 || vName.includes('porção')) return u + 5; // Porção
                        return u;
                      }, 0) || 0;
                      return acc + (units * item.quantity);
                    }
                    return acc;
                  }, 0);

                  if (selectedItemForVariations!.stockQuantity !== null && selectedItemForVariations!.stockQuantity !== undefined) {
                    const vName = (v.name || '').toLowerCase();
                    if (v.id === 19 || vName === 'unidade') { // Unidade
                      effectiveStock = selectedItemForVariations!.stockQuantity - camaraoCartConsumption;
                    } else if (v.id === 20 || vName.includes('porção')) { // Porção
                      effectiveStock = Math.floor((selectedItemForVariations!.stockQuantity - camaraoCartConsumption) / 5);
                    }
                  }
                } else {
                  const variationCartCount = cartItems.reduce((acc, item) => acc + (item.variations?.some((cartVar: any) => String(cartVar.menuItemVariationId || cartVar.id) === String(v.id)) ? item.quantity : 0), 0);
                  effectiveStock = v.stockQuantity !== null && v.stockQuantity !== undefined ? v.stockQuantity - variationCartCount : null;
                }

                const isSelected = selectedVariations.includes(v.id!);
                const isOutOfStock = effectiveStock !== null && effectiveStock <= 0;

                return (
                  <TouchableOpacity
                    key={v.id?.toString()}
                    style={[styles.variationOption, isOutOfStock && styles.variationDisabled]}
                    disabled={isOutOfStock}
                    onPress={() => {
                      const isRadio = selectedItemForVariations && selectedItemForVariations.variations!.some(varItem => varItem.type === 'SINGLE');

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
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={[styles.variationName, isOutOfStock && styles.variationDisabledText]}>
                          {v.name}
                        </Text>
                        {isOutOfStock ? (
                          <Text style={{ fontSize: 13, color: '#EF4444', fontWeight: 'bold', marginLeft: 6 }}>(Esgotado)</Text>
                        ) : ( effectiveStock !== null && (
                          <Text style={{ fontSize: 13, color: '#F59E0B', fontWeight: 'bold', marginLeft: 6 }}>({effectiveStock} unid.)</Text>
                        ))}
                      </View>
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
              const hasVariations = selectedItemForVariations && selectedItemForVariations.variations && selectedItemForVariations.variations.length > 0;
              const isMissingMandatory = hasVariations && selectedVariations.length === 0;
              if (isMissingMandatory) {
                return (
                  <Text style={{ color: '#D32F2F', fontSize: 13, textAlign: 'center', marginVertical: 8, fontWeight: '500' }}>
                    * Seleção obrigatória
                  </Text>
                );
              }
              return null;
            })()}

            <View style={styles.modalQtyContainer}>
              <Text style={styles.modalQtyLabel}>Quantidade:</Text>
              <View style={styles.modalQtyControls}>
                <TouchableOpacity
                  style={[styles.modalQtyBtn, selectedQuantity <= 1 && styles.modalQtyBtnDisabled]}
                  disabled={selectedQuantity <= 1}
                  onPress={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                >
                  <Text style={[styles.modalQtyBtnText, selectedQuantity <= 1 && styles.modalQtyBtnTextDisabled]}>-</Text>
                </TouchableOpacity>
                <Text style={styles.modalQtyValue}>{selectedQuantity}</Text>
                <TouchableOpacity
                  style={styles.modalQtyBtn}
                  onPress={() => setSelectedQuantity(selectedQuantity + 1)}
                >
                  <Text style={styles.modalQtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedItemForVariations(null)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  (() => {
                    const hasVariations = selectedItemForVariations && selectedItemForVariations.variations && selectedItemForVariations.variations.length > 0;
                    const isMissingMandatory = hasVariations && selectedVariations.length === 0;
                    return isMissingMandatory ? { backgroundColor: '#9CA3AF' } : null;
                  })()
                ]}
                onPress={() => {
                  if (selectedItemForVariations) {
                    const hasVariations = selectedItemForVariations.variations && selectedItemForVariations.variations.length > 0;
                    const isMissingMandatory = hasVariations && selectedVariations.length === 0;

                    if (isMissingMandatory) return;

                    const varsToApply = selectedItemForVariations.variations?.filter(v => selectedVariations.includes(v.id!)).map(v => ({
                      menuItemVariationId: v.id!,
                      name: v.name,
                      additionalPrice: v.additionalPrice
                    })) || [];
                    addOrderItem(selectedItemForVariations, selectedQuantity, varsToApply);
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(20),
    backgroundColor: '#223c0e',
    borderBottomWidth: 0,
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
  cartButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: '#ee8b1b', // Dattebayo Orange
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ee8b1b',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 5,
  },
  badge: {
    position: 'absolute',
    top: scale(-4),
    right: scale(-4),
    backgroundColor: '#1A1A1A',
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: fontScale(12),
    fontWeight: 'bold',
  },
  managementButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(12),
    backgroundColor: '#ffffff20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff30',
  },
  listContainer: {
    padding: scale(24),
    paddingBottom: verticalScale(100),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: scale(16),
    marginBottom: verticalScale(16),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 2,
    flexDirection: 'row',
  },
  cardInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: verticalScale(6),
  },
  itemDesc: {
    fontSize: fontScale(14),
    color: '#666',
    lineHeight: fontScale(20),
    marginBottom: verticalScale(16),
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  price: {
    fontSize: fontScale(18),
    fontWeight: '800',
    color: '#1A1A1A',
  },

  addButton: {
    backgroundColor: '#ee8b1b',
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: scale(24),
    padding: scale(24),
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: fontScale(20),
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: verticalScale(16),
  },
  variationsList: {
    marginBottom: verticalScale(24),
  },
  variationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  variationName: {
    fontSize: fontScale(16),
    color: '#1A1A1A',
    fontWeight: '500',
  },
  variationPrice: {
    fontSize: fontScale(14),
    color: '#666',
    marginTop: verticalScale(4),
  },
  checkbox: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
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
    fontSize: fontScale(14),
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: scale(12),
  },
  cancelBtn: {
    flex: 1,
    padding: scale(16),
    borderRadius: scale(12),
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#4B5563',
    fontWeight: 'bold',
    fontSize: fontScale(16),
  },
  confirmBtn: {
    flex: 1,
    padding: scale(16),
    borderRadius: scale(12),
    backgroundColor: '#ee8b1b',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: fontScale(16),
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
  },
  modalQtyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginBottom: verticalScale(24),
  },
  modalQtyLabel: {
    fontSize: fontScale(16),
    fontWeight: '500',
    color: '#1A1A1A',
  },
  modalQtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
    backgroundColor: '#F9FAFB',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(6),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalQtyBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalQtyBtnDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  modalQtyBtnText: {
    fontSize: fontScale(20),
    color: '#EE8B1B',
    fontWeight: 'bold',
    lineHeight: fontScale(22),
  },
  modalQtyBtnTextDisabled: {
    color: '#9CA3AF',
  },
  modalQtyValue: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: '#1A1A1A',
    minWidth: scale(24),
    textAlign: 'center',
  }
});
