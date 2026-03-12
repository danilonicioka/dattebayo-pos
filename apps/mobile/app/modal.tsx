import { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform, TextInput, KeyboardAvoidingView } from 'react-native';
import { useCartStore, getCartTotal } from '@/store/cartStore';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react-native';
import { api } from '@/services/api';
import { router } from 'expo-router';
import { formatProductNameWithVariations } from '@/utils/formatters';
import { scale, fontScale, verticalScale } from '@/utils/responsive';
import { useToastStore } from '@/store/toastStore';

export default function ModalScreen() {
  const { items, addOrderItem, removeOrderItem, clearCart } = useCartStore();
  const cartTotal = getCartTotal(items);
  const [isLoading, setIsLoading] = useState(false);
  const [amountReceived, setAmountReceived] = useState('');
  const [customerName, setCustomerName] = useState('');
  const triggerToast = useToastStore(state => state.triggerToast);

  const change = amountReceived ? parseFloat(amountReceived) - cartTotal : 0;

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const orderDto = {
        tableNumber: customerName || null,
        notes: 'Pedido via App',
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions || '',
          variations: item.variations.map((v: any) => ({
            menuItemVariationId: parseInt(v.menuItemVariationId || v.id, 10),
            name: v.name,
            additionalPrice: v.additionalPrice,
          }))
        }))
      };

      await api.post('/orders', orderDto);

      // Limpa os status, fecha a tela e aciona o toast global (sem delay)
      clearCart();
      setCustomerName('');
      triggerToast('Pedido Realizado! 🎉\nO pedido foi enviado.', 'success');
      router.back();

    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      triggerToast('Ops! Erro ao confirmar pedido.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <ShoppingCart color="#CCC" size={scale(48)} />
        <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
        <Text style={styles.emptySubtitle}>Adicione itens do cardápio para fazer um pedido.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: scale(24), marginTop: verticalScale(24), marginBottom: verticalScale(16) }}>
          <Text style={[styles.title, { marginHorizontal: 0, marginTop: 0, marginBottom: 0 }]}>Resumo do Pedido</Text>
          <TouchableOpacity onPress={() => clearCart()} style={{ flexDirection: 'row', alignItems: 'center', gap: scale(6), backgroundColor: '#FEE2E2', paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: scale(16) }}>
            <Trash2 color="#EF4444" size={scale(16)} />
            <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: fontScale(14) }}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {formatProductNameWithVariations(item.menuItem.name, item.variations)}
                </Text>

                <Text style={styles.price}>
                  R$ {((item.price + item.variations.reduce((acc: number, v: any) => acc + v.additionalPrice, 0)) * item.quantity).toFixed(2).replace('.', ',')}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => removeOrderItem(index)}
                >
                  <Trash2 color="#D32F2F" size={scale(18)} />
                </TouchableOpacity>

                <View style={styles.qtyBox}>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                </View>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => addOrderItem(item.menuItem, 1, item.variations)}
                >
                  <Plus color="#059669" size={scale(18)} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R$ {cartTotal.toFixed(2).replace('.', ',')}</Text>
          </View>

          <View style={styles.paymentSection}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Nome do Cliente</Text>
              <TextInput
                style={[styles.textInput, { textAlign: 'left', width: scale(150) }]}
                placeholder="Opcional"
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Valor Recebido</Text>
              <TextInput
                style={styles.textInput}
                placeholder="R$ 0,00"
                keyboardType="numeric"
                value={amountReceived}
                onChangeText={(text) => setAmountReceived(text.replace(',', '.'))}
              />
            </View>

            {amountReceived !== '' && (
              <View style={styles.changeRow}>
                <Text style={styles.changeLabel}>Troco</Text>
                <Text style={[styles.changeValue, change < 0 && styles.changeNegative]}>
                  R$ {change.toFixed(2).replace('.', ',')}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.checkoutBtn, isLoading && styles.checkoutBtnDisabled]}
            onPress={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.checkoutBtnText}>Confirmar Pedido</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(24),
  },
  emptyTitle: {
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
    fontSize: fontScale(22),
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  emptySubtitle: {
    marginTop: verticalScale(8),
    fontSize: fontScale(15),
    color: '#9CA3AF',
    textAlign: 'center',
  },
  title: {
    fontSize: fontScale(24),
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginHorizontal: scale(24),
    marginTop: verticalScale(24),
    marginBottom: verticalScale(16),
  },
  listContainer: {
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(24),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 2,
  },
  cardInfo: {
    flex: 1,
    paddingRight: scale(16),
  },
  itemName: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: verticalScale(4),
  },
  variationText: {
    fontSize: fontScale(12),
    color: '#666',
    fontStyle: 'italic',
  },
  price: {
    fontSize: fontScale(14),
    color: '#666',
    fontWeight: 'bold',
    marginTop: verticalScale(4),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: scale(8),
    padding: scale(4),
  },
  actionBtn: {
    width: scale(32),
    height: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: scale(6),
  },
  qtyBox: {
    width: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: fontScale(14),
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  footer: {
    padding: scale(24),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: verticalScale(40),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  totalLabel: {
    fontSize: fontScale(18),
    color: '#666',
  },
  totalValue: {
    fontSize: fontScale(24),
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  checkoutBtn: {
    backgroundColor: '#ee8b1b', // Dattebayo Orange
    borderRadius: scale(12),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
  },
  checkoutBtnDisabled: {
    backgroundColor: '#FDBA74',
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: 'bold',
  },
  paymentSection: {
    marginBottom: verticalScale(20),
    backgroundColor: '#F9FAFB',
    borderRadius: scale(12),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  inputLabel: {
    fontSize: fontScale(16),
    color: '#4B5563',
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    width: scale(100),
    textAlign: 'right',
    fontSize: fontScale(14),
    fontWeight: '500',
    color: '#1A1A1A',
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  changeLabel: {
    fontSize: fontScale(16),
    color: '#4B5563',
    fontWeight: 'bold',
  },
  changeValue: {
    fontSize: fontScale(20),
    fontWeight: 'bold',
    color: '#059669',
  },
  changeNegative: {
    color: '#D32F2F',
  },
  globalToast: {
    position: 'absolute',
    bottom: verticalScale(40),
    alignSelf: 'center',
    backgroundColor: '#059669', // Success green
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(24),
    borderRadius: scale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.15,
    shadowRadius: scale(4),
    elevation: 5,
    zIndex: 9999,
  },
  globalToastError: {
    backgroundColor: '#EF4444', // Error red
  },
  globalToastText: {
    color: '#fff',
    fontSize: fontScale(14),
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

