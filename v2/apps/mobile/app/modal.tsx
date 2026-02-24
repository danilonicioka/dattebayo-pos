import { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useCartStore, getCartTotal } from '@/store/cartStore';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react-native';
import { api } from '@/services/api';
import { router } from 'expo-router';

export default function ModalScreen() {
  const { items, addOrderItem, removeOrderItem, clearCart } = useCartStore();
  const cartTotal = getCartTotal(items);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const orderDto = {
        tableNumber: 'Mesa 1', // Mockado por enquanto
        notes: 'Pedido via App',
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions || '',
          variations: item.variations.map(v => ({
            menuItemVariationId: v.menuItemVariationId || v.id,
            name: v.name,
            additionalPrice: v.additionalPrice,
          }))
        }))
      };

      await api.post('/orders', orderDto);

      // Alert.alert no React Native Web não suporta array de botões como onPress nativo.
      // Usamos lógica cross-platform simples com window.alert no web, e react-native no mobile
      if (Platform.OS === 'web') {
        window.alert('Pedido Realizado! 🎉\n\nSeu pedido já foi enviado para a lanchonete.');
        clearCart();
        router.back();
      } else {
        Alert.alert(
          'Pedido Realizado! 🎉',
          'Seu pedido já foi enviado para a lanchonete.',
          [
            {
              text: 'OK',
              onPress: () => {
                clearCart();
                router.back();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      Alert.alert('Ops!', 'Não foi possível confirmar o pedido. Verifique a conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <ShoppingCart color="#CCC" size={48} />
        <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
        <Text style={styles.emptySubtitle}>Adicione itens do cardápio para fazer um pedido.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo do Pedido</Text>

      <FlatList
        data={items}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.itemName}>{item.menuItem.name}</Text>
              <Text style={styles.price}>
                R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => removeOrderItem(index)}
              >
                <Trash2 color="#D32F2F" size={18} />
              </TouchableOpacity>

              <View style={styles.qtyBox}>
                <Text style={styles.qtyText}>{item.quantity}</Text>
              </View>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => addOrderItem(item.menuItem, 1)}
              >
                <Plus color="#1A1A1A" size={18} />
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
    padding: 24,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInfo: {
    flex: 1,
    paddingRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 4,
  },
  actionBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 6,
  },
  qtyBox: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  footer: {
    padding: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: 40,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: '#666',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  checkoutBtn: {
    backgroundColor: '#D32F2F', // Restaurante red
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutBtnDisabled: {
    backgroundColor: '#EF9A9A',
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
