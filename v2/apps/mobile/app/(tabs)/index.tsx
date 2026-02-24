import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { MOCK_MENU_ITEMS } from '@/constants/mockData';
import { MenuItem } from '@dattebayo/core';
import { ShoppingCart, Plus } from 'lucide-react-native';
import { useCartStore, getCartItemCount } from '@/store/cartStore';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const cartItems = useCartStore((state) => state.items);
  const addOrderItem = useCartStore((state) => state.addOrderItem);

  const itemCount = getCartItemCount(cartItems);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, Atendente</Text>
          <Text style={styles.title}>Cardápio</Text>
        </View>
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

      <FlatList
        data={MOCK_MENU_ITEMS}
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
                <Text style={styles.price}>
                  R$ {item.price.toFixed(2).replace('.', ',')}
                </Text>

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addOrderItem(item)}
                >
                  <Plus color="#fff" size={20} />
                </TouchableOpacity>
              </View>
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
  }
});
