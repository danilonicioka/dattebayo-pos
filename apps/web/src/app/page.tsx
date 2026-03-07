'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Settings, Grid, Plus, Minus, Tag, Check, X, ArrowLeft, Trash2, ChefHat } from 'lucide-react';
import { api } from '@/services/api';
import { formatProductNameWithVariations } from '@/utils/formatters';
import './Cashier.css';

interface MenuItemVariation {
  id: string;
  name: string;
  additionalPrice: number;
  type: 'SINGLE' | 'MULTIPLE';
  stockQuantity: number | null;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  available: boolean;
  stockQuantity: number | null;
  manualPriceEnabled: boolean;
  manualPrice: number | null;
  variations?: MenuItemVariation[];
}

interface CartItem {
  id: string; // internal cart id (unique for same product with different variations)
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variations: {
    menuItemVariationId: string;
    name: string;
    additionalPrice: number;
  }[];
}

export default function CashierPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Variation Selection State
  const [selectedItemForVariations, setSelectedItemForVariations] = useState<MenuItem | null>(null);
  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await api.get('/menu/public');
      const items = response.data;
      setMenuItems(items);

      // Extract unique categories
      const distinctCategories = Array.from(new Set(items.map((item: MenuItem) => item.category))) as string[];
      setCategories(['Todos', ...distinctCategories]);
    } catch (error) {
      console.error('Erro ao buscar o menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateItemPrice = (item: MenuItem | CartItem) => {
    let total = item.price;
    if ('variations' in item && item.variations) {
      item.variations.forEach(v => total += v.additionalPrice);
    }
    return total;
  };

  const handleAddItem = (item: MenuItem) => {
    // Override price if dynamic price is enabled
    const basePrice = item.manualPriceEnabled && item.manualPrice != null ? item.manualPrice : item.price;

    // Create a normalized item object
    const finalItem: MenuItem = {
      ...item,
      price: basePrice
    };

    if (item.variations && item.variations.length > 0) {
      setSelectedItemForVariations(finalItem);

      // Pre-select first SINGLE variation if it's a radio-style group
      const isRadio = item.variations.length > 1 && item.variations[0].type === 'SINGLE';
      if (isRadio) {
        const firstAvailable = item.variations.find(v =>
          !(v.stockQuantity !== null && v.stockQuantity !== undefined && v.stockQuantity <= 0)
        );
        if (firstAvailable) {
          setSelectedVariations([firstAvailable.id]);
        } else {
          setSelectedVariations([]);
        }
      } else {
        setSelectedVariations([]);
      }
    } else {
      addToCart(finalItem, 1, []);
    }
  };

  const addToCart = (product: MenuItem, quantity: number, vars: any[]) => {
    setCart(prev => {
      // Check if exact same product with same variations exists
      const varIdString = vars.map(v => v.menuItemVariationId).sort().join(',');
      const existingIndex = prev.findIndex(item =>
        item.productId === product.id &&
        item.variations.map(v => v.menuItemVariationId).sort().join(',') === varIdString
      );

      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }

      const newItem: CartItem = {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        variations: vars
      };
      return [...prev, newItem];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === cartItemId) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const itemTotal = calculateItemPrice(item) * item.quantity;
      return acc + itemTotal;
    }, 0);
  };

  const handleConfirmVariations = () => {
    if (!selectedItemForVariations) return;

    const isMandatoryRadio = selectedItemForVariations.variations!.length > 1 && selectedItemForVariations.variations![0].type === 'SINGLE';
    const isMandatoryMulti = selectedItemForVariations.variations![0].type === 'MULTIPLE';
    const isMissingMandatory = (isMandatoryRadio || isMandatoryMulti) && selectedVariations.length === 0;

    if (isMissingMandatory) return;

    const varsToApply = selectedItemForVariations.variations?.filter(v => selectedVariations.includes(v.id)).map(v => ({
      menuItemVariationId: v.id,
      name: v.name,
      additionalPrice: v.additionalPrice
    })) || [];

    addToCart(selectedItemForVariations, 1, varsToApply);
    setSelectedItemForVariations(null);
    setSelectedVariations([]);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const orderData = {
        tableNumber: customerName || null,
        items: cart.map(item => ({
          menuItemId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variations: item.variations.map(v => ({
            menuItemVariationId: v.menuItemVariationId,
            name: v.name,
            additionalPrice: v.additionalPrice
          }))
        }))
      };

      await api.post('/orders', orderData);

      setCart([]);
      setIsCartOpen(false);
      setCustomerName('');
      setAmountReceived('');

      setToastMessage({ text: 'Pedido realizado com sucesso! 🎉', type: 'success' });
      setTimeout(() => setToastMessage(null), 3500);

    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      setToastMessage({ text: 'Erro ao finalizar pedido.', type: 'error' });
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const filteredItems = selectedCategory === 'Todos'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const cartTotal = cart.reduce((acc, item) => acc + (calculateItemPrice(item) * item.quantity), 0);
  const change = amountReceived ? parseFloat(amountReceived.replace(',', '.')) - cartTotal : 0;

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="cashier-container">
      <div className="catalog-section">
        <header className="catalog-header">
          <div className="header-left">
            <button className="management-btn" onClick={() => window.location.href = '/admin/products/edit'}>
              <Settings size={22} className="icon-white" />
            </button>
            <button className="management-btn" onClick={() => window.location.href = '/kitchen'}>
              <ChefHat size={22} className="icon-white" />
            </button>
            <div className="title-stack">
              <span className="greeting">Olá, Atendente</span>
              <h1 className="title-large">Caixa</h1>
            </div>
          </div>

          <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={24} color="#fff" />
            {cartItemCount > 0 && (
              <span className="badge">
                <span className="badge-text">{cartItemCount}</span>
              </span>
            )}
          </button>
        </header>

        <div className="categories-wrapper desktop-only">
          <div className="categories-list">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <Grid size={16} />
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="products-grid">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Carregando cardápio...</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`product-card animate-in stagger-${(index % 4) + 1}`}
              >
                <div className="product-info">
                  <h3 className="product-title">{item.name}</h3>
                  {item.description ? (
                    <p className="product-desc">{item.description}</p>
                  ) : null}
                  <div className="product-footer">
                    <p className="product-price">
                      {item.price.toFixed(2).replace('.', ',')}
                    </p>
                    <button className="add-quick-btn" onClick={() => handleAddItem(item)}>
                      <Plus size={20} color="#fff" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <aside className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div className="cart-header-left">
            <button className="close-cart-btn mobile-only" onClick={() => setIsCartOpen(false)}>
              <ArrowLeft size={24} />
            </button>
            <h2 className="title-3">Pedido Atual</h2>
          </div>
          <button className="clear-cart-btn" onClick={() => setCart([])}>Limpar</button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCart size={48} className="cart-empty-icon" />
            <p className="title-3" style={{ marginBottom: '8px' }}>Carrinho Vazio</p>
            <p className="cart-empty-sub">Adicione itens para começar</p>
          </div>
        ) : (
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div className="cart-item-info">
                  <div className="cart-item-name">
                    {formatProductNameWithVariations(item.name, item.variations)}
                  </div>
                  <div className="cart-item-price">
                    R$ {(calculateItemPrice(item) * item.quantity).toFixed(2).replace('.', ',')}
                  </div>
                </div>
                <div className="cart-item-actions">
                  <button className="remove-item-btn" onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={18} />
                  </button>
                  <div className="qty-controls">
                    <button onClick={() => updateQuantity(item.id, -1)}><Minus size={16} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}><Plus size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cart-footer">
          <div className="payment-section">
            <div className="payment-input-row" style={{ marginBottom: '12px' }}>
              <span className="payment-label">Nome do Cliente</span>
              <input
                type="text"
                className="amount-input"
                style={{ textAlign: 'left', width: '140px' }}
                placeholder="Opcional"
                onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="payment-input-row">
              <span className="payment-label">Valor Recebido</span>
              <input
                type="text"
                className="amount-input"
                placeholder="R$ 0,00"
                onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value.replace(',', '.'))}
              />
            </div>
            {amountReceived !== '' && (
              <div className="change-row">
                <span className="change-label">Troco</span>
                <span className={`change-value ${change < 0 ? 'negative' : ''}`}>
                  R$ {change.toFixed(2).replace('.', ',')}
                </span>
              </div>
            )}
          </div>

          <div className="total-row">
            <span className="total-label">Subtotal</span>
            <span className="total-value">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
          </div>
          <button
            className="checkout-btn"
            disabled={cart.length === 0}
            onClick={() => {
              handleCheckout();
              setAmountReceived('');
              setCustomerName('');
            }}
          >
            Confirmar Pedido
          </button>
          <button
            className="continue-shopping-btn mobile-only"
            onClick={() => setIsCartOpen(false)}
          >
            Voltar ao Cardápio
          </button>
        </div>
      </aside>

      {/* Variation Selection Modal */}
      {selectedItemForVariations && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Opções para {selectedItemForVariations.name}</h2>
            <div className="variations-list">
              {selectedItemForVariations.variations?.map(v => {
                const isSelected = selectedVariations.includes(v.id!);
                const isOutOfStock = v.stockQuantity !== null && v.stockQuantity !== undefined && v.stockQuantity <= 0;

                return (
                  <div
                    key={v.id}
                    className={`variation-option ${isOutOfStock ? 'disabled' : ''}`}
                    onClick={() => {
                      if (isOutOfStock) return;
                      const isRadio = selectedItemForVariations.variations!.length > 1 && v.type === 'SINGLE';

                      if (isRadio) {
                        setSelectedVariations([v.id!]);
                      } else {
                        if (isSelected) {
                          setSelectedVariations(curr => curr.filter(id => id !== v.id!));
                        } else {
                          setSelectedVariations(curr => [...curr, v.id!]);
                        }
                      }
                    }}
                  >
                    <div>
                      <div className={`variation-name ${isOutOfStock ? 'disabled' : ''}`}>
                        {v.name} {isOutOfStock && "(Esgotado)"}
                      </div>
                      {v.additionalPrice > 0 && (
                        <div className="variation-price">
                          + R$ {v.additionalPrice.toFixed(2).replace('.', ',')}
                        </div>
                      )}
                    </div>
                    <div className={`checkbox ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'disabled' : ''}`}>
                      {isSelected && <Check size={14} className="checkbox-tick" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {(() => {
              const isMandatoryRadio = selectedItemForVariations.variations!.length > 1 && selectedItemForVariations.variations![0].type === 'SINGLE';
              const isMandatoryMulti = selectedItemForVariations.variations![0].type === 'MULTIPLE';
              const isMissingMandatory = (isMandatoryRadio || isMandatoryMulti) && selectedVariations.length === 0;
              if (isMissingMandatory) {
                return (
                  <p style={{ color: '#D32F2F', fontSize: '13px', textAlign: 'center', margin: '0 0 16px', fontWeight: '500' }}>
                    * Seleção obrigatória
                  </p>
                );
              }
              return null;
            })()}

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setSelectedItemForVariations(null)}>
                Cancelar
              </button>
              <button
                className="confirm-btn"
                disabled={(() => {
                  const v = selectedItemForVariations.variations![0];
                  const isMandatory = (selectedItemForVariations.variations!.length > 1 && v.type === 'SINGLE') || v.type === 'MULTIPLE';
                  return isMandatory && selectedVariations.length === 0;
                })()}
                onClick={handleConfirmVariations}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast */}
      {toastMessage && (
        <div className={`global-toast ${toastMessage.type}`}>
          {toastMessage.type === 'success' && <Check size={18} className="toast-icon" />}
          {toastMessage.type === 'error' && <X size={18} className="toast-icon" />}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
