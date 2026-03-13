// ---- State ----
let menuItems = [];
let cart = [];
let selectedCategory = 'Todos';
let selectedItemForVariations = null;
let selectedVariations = [];
let selectedQuantity = 1;

const CART_STORAGE_KEY = 'dattebayo-cart';

function saveCart() {
  console.log('Saving cart to localStorage:', cart);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function loadCart() {
  const saved = localStorage.getItem(CART_STORAGE_KEY);
  console.log('Loaded cart from localStorage string:', saved);
  if (saved) {
    try {
      cart = JSON.parse(saved);
      console.log('Parsed cart after loading:', cart);
    } catch (e) {
      console.error('Error loading cart:', e);
      cart = [];
    }
  }
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-open-cart')?.addEventListener('click', () => openCart());
  document.getElementById('btn-close-cart')?.addEventListener('click', () => closeCart());
  document.getElementById('btn-clear-cart')?.addEventListener('click', () => { cart = []; saveCart(); renderCart(); });
  document.getElementById('btn-checkout')?.addEventListener('click', handleCheckout);
  document.getElementById('btn-continue-shopping')?.addEventListener('click', closeCart);
  document.getElementById('amount-received')?.addEventListener('input', updateChange);
  document.getElementById('btn-variation-cancel')?.addEventListener('click', closeVariationModal);
  document.getElementById('btn-variation-confirm')?.addEventListener('click', handleConfirmVariations);

  fetchMenu();
  loadCart();
  renderCart();
});

// ---- Fetch ----
async function fetchMenu() {
  try {
    menuItems = await api.get('/menu/public');
    renderCategories();
    renderProducts();
  } catch (e) {
    document.getElementById('products-grid').innerHTML = '<p style="padding:24px;color:red">Erro ao carregar cardápio.</p>';
  }
}

// ---- Categories ----
function renderCategories() {
  const cats = ['Todos', ...new Set(menuItems.map(i => i.category))];
  const list = document.getElementById('categories-list');
  list.innerHTML = cats.map(cat => `
    <button class="category-chip ${cat === selectedCategory ? 'active' : ''}" onclick="selectCategory('${cat}')">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      <span>${cat}</span>
    </button>`).join('');
}

function selectCategory(cat) {
  selectedCategory = cat;
  renderCategories();
  renderProducts();
}

// ---- Products ----
function renderProducts() {
  const filtered = selectedCategory === 'Todos' ? menuItems : menuItems.filter(i => i.category === selectedCategory);
  const grid = document.getElementById('products-grid');
  if (!filtered.length) { grid.innerHTML = '<p style="padding:24px;color:#9ca3af">Nenhum produto encontrado.</p>'; return; }
  grid.innerHTML = filtered.map((item, idx) => `
    <div class="product-card animate-in stagger-${(idx % 4) + 1}">
      <div class="product-info">
        <h3 class="product-title">${item.name}</h3>
        ${item.description ? `<p class="product-desc">${item.description}</p>` : ''}
        <div class="product-footer">
          <p class="product-price">${Number(item.price).toFixed(2).replace('.', ',')}</p>
          <button class="add-quick-btn" onclick="handleAddItem(${item.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
    </div>`).join('');
}

// ---- Add to cart ----
function handleAddItem(id) {
  const item = menuItems.find(i => i.id == id);
  if (!item) return;
  const basePrice = (item.manualPriceEnabled && item.manualPrice != null) ? item.manualPrice : item.price;
  const finalItem = { ...item, price: basePrice };

  selectedItemForVariations = finalItem;
  if (item.variations && item.variations.length > 0) {
    const isRadio = item.variations.length > 1 && item.variations[0].type === 'SINGLE';
    if (isRadio) {
      const firstAvailable = item.variations.find(v => !(v.stockQuantity !== null && v.stockQuantity <= 0));
      selectedVariations = firstAvailable ? [firstAvailable.id] : [];
    } else {
      selectedVariations = [];
    }
  } else {
    selectedVariations = [];
  }
  openVariationModal();
}

function addToCart(product, quantity, vars) {
  const varIdString = vars.map(v => v.menuItemVariationId).sort().join(',');
  const existingIdx = cart.findIndex(i => i.productId == product.id && i.variations.map(v => v.menuItemVariationId).sort().join(',') === varIdString);
  if (existingIdx > -1) {
    cart[existingIdx].quantity += quantity;
  } else {
    cart.push({
      id: Math.random().toString(36).substr(2, 9),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      variations: vars,
    });
  }
  saveCart();
  renderCart();
}

// ---- Cart Rendering ----
function calcItemPrice(item) {
  return item.price + (item.variations || []).reduce((a, v) => a + v.additionalPrice, 0);
}

function renderCart() {
  const cartEl = document.getElementById('cart-items');
  const total = cart.reduce((a, i) => a + calcItemPrice(i) * i.quantity, 0);
  document.getElementById('cart-total').textContent = fmtPrice(total);
  document.getElementById('btn-checkout').disabled = cart.length === 0;

  const count = cart.reduce((a, i) => a + i.quantity, 0);
  const badge = document.getElementById('cart-badge');
  badge.style.display = count > 0 ? 'flex' : 'none';
  document.getElementById('cart-count').textContent = count;

  updateChange();

  if (!cart.length) {
    cartEl.innerHTML = `<div class="cart-empty">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cart-empty-icon"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      <p class="title-3" style="margin-bottom:8px">Carrinho Vazio</p>
      <p class="cart-empty-sub">Adicione itens para começar</p>
    </div>`;
    return;
  }

  cartEl.innerHTML = `<div style="padding:12px;display:flex;flex-direction:column;gap:12px">` +
    cart.map(item => {
      const displayName = formatItemNameWithVariations(item.name, item.variations);
      return `<div class="cart-item-card" style="background:#fff;border-radius:12px;padding:12px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 1px 4px rgba(0,0,0,0.06);border:1px solid #F3F4F6">
        <div class="cart-item-info" style="flex:1">
          <div class="cart-item-name">${displayName}</div>
          <div class="cart-item-price">${fmtPrice(calcItemPrice(item) * item.quantity)}</div>
        </div>
        <div class="cart-item-actions">
          <button class="remove-item-btn" onclick="removeFromCart('${item.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
          <div class="qty-controls">
            <button onclick="updateQty('${item.id}', -1)"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EE8B1B" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
            <span>${item.quantity}</span>
            <button onclick="updateQty('${item.id}', 1)"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EE8B1B" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
          </div>
        </div>
      </div>`;
    }).join('') + '</div>';
}

function removeFromCart(id) { cart = cart.filter(i => i.id !== id); saveCart(); renderCart(); }
function updateQty(id, delta) {
  cart = cart.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0);
  saveCart();
  renderCart();
}

function updateChange() {
  const raw = document.getElementById('amount-received').value.replace(',', '.');
  const total = cart.reduce((a, i) => a + calcItemPrice(i) * i.quantity, 0);
  const changeRow = document.getElementById('change-row');
  if (raw && !isNaN(parseFloat(raw))) {
    const change = parseFloat(raw) - total;
    const el = document.getElementById('change-value');
    el.textContent = fmtPrice(change);
    el.className = 'change-value' + (change < 0 ? ' negative' : '');
    changeRow.style.display = 'flex';
  } else {
    changeRow.style.display = 'none';
  }
}

function openCart() { document.getElementById('cart-sidebar').classList.add('open'); }
function closeCart() { document.getElementById('cart-sidebar').classList.remove('open'); }

// ---- Checkout ----
async function handleCheckout() {
  if (!cart.length) return;
  const customerName = document.getElementById('customer-name').value;
  try {
    const orderData = {
      tableNumber: customerName || null,
      items: cart.map(i => ({
        menuItemId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        variations: i.variations.map(v => ({ menuItemVariationId: parseInt(v.menuItemVariationId), name: v.name, additionalPrice: v.additionalPrice })),
      })),
    };
    await api.post('/orders', orderData);
    cart = [];
    saveCart();
    document.getElementById('customer-name').value = '';
    document.getElementById('amount-received').value = '';
    closeCart();
    renderCart();
    fetchMenu(); // Atualiza estoque na tela
    showToast('Pedido realizado com sucesso! 🎉', 'success');
  } catch (e) {
    showToast('Erro ao finalizar pedido.', 'error');
  }
}

// Helper para cálculo de estoque unificado
function getEffectiveStock(v, item, currentCart) {
  const itemId = Number(item.id);
  const vId = Number(v.id);
  const itemName = (item.name || '').toLowerCase();
  const isCamarao = itemId === 10 || itemName.includes('camarão milanesa');

  if (isCamarao) {
    const camaraoCartConsumption = currentCart.reduce((acc, cartItem) => {
      const cItemName = (cartItem.name || '').toLowerCase();
      if (Number(cartItem.productId) === 10 || cItemName.includes('camarão milanesa')) {
        const units = cartItem.variations.reduce((u, cv) => {
          const cvId = Number(cv.menuItemVariationId || cv.id);
          const cvName = (cv.name || '').toLowerCase();
          if (cvId === 19 || cvName === 'unidade') return u + 1; // Unidade
          if (cvId === 20 || cvName.includes('porção')) return u + 5; // Porção
          return u;
        }, 0);
        return acc + (units * cartItem.quantity);
      }
      return acc;
    }, 0);

    if (item.stockQuantity !== null && item.stockQuantity !== undefined) {
      const vName = (v.name || '').toLowerCase();
      if (vId === 19 || vName === 'unidade') return item.stockQuantity - camaraoCartConsumption;
      if (vId === 20 || vName.includes('porção')) return Math.floor((item.stockQuantity - camaraoCartConsumption) / 5);
    }
    return null;
  } else {
    const variationCartCount = currentCart.reduce((acc, cartItem) => 
      acc + (cartItem.variations.some(cv => Number(cv.menuItemVariationId || cv.id) === vId) ? cartItem.quantity : 0), 0);
    return (v.stockQuantity !== null && v.stockQuantity !== undefined) ? v.stockQuantity - variationCartCount : null;
  }
}

// ---- Variation Modal ----
function openVariationModal() {
  if (!selectedItemForVariations) return;
  const vars = selectedItemForVariations.variations || [];
  
  document.getElementById('variation-modal-title').textContent = vars.length ? `Opções para ${selectedItemForVariations.name}` : `Adicionar ${selectedItemForVariations.name}`;
  selectedQuantity = 1;
  selectedVariations = [];

  // Pre-seleção para tipo SINGLE (Radio)
  if (vars.length > 0) {
    const isRadio = vars.some(v => v.type === 'SINGLE');
    if (isRadio) {
      const firstAvailable = vars.find(v => {
        const effectiveStock = getEffectiveStock(v, selectedItemForVariations, cart);
        return !(effectiveStock !== null && effectiveStock <= 0);
      });
      if (firstAvailable) {
        selectedVariations = [String(firstAvailable.id)];
      }
    }
  }

  updateModalQtyDisplay();
  renderVariations();
  document.getElementById('variation-modal').style.display = 'flex';
}
function closeVariationModal() {
  document.getElementById('variation-modal').style.display = 'none';
  selectedItemForVariations = null;
  selectedVariations = [];
  selectedQuantity = 1;
}

function updateModalQty(delta) {
  selectedQuantity = Math.max(1, selectedQuantity + delta);
  updateModalQtyDisplay();
}

function updateModalQtyDisplay() {
  document.getElementById('modal-qty-value').textContent = selectedQuantity;
  document.getElementById('btn-modal-qty-minus').disabled = selectedQuantity <= 1;
}

function renderVariations() {
  if (!selectedItemForVariations) return;
  const vars = selectedItemForVariations.variations || [];
  
  if (vars.length === 0) {
    document.getElementById('btn-variation-confirm').disabled = false;
    document.getElementById('variation-mandatory-msg').style.display = 'none';
    document.getElementById('variations-list').innerHTML = '';
    return;
  }

  const isRadio = vars.some(v => v.type === 'SINGLE');
  const isMandatory = vars.length > 0 && selectedVariations.length === 0;
  
  document.getElementById('btn-variation-confirm').disabled = isMandatory;
  document.getElementById('variation-mandatory-msg').style.display = isMandatory ? 'block' : 'none';

  document.getElementById('variations-list').innerHTML = vars.map(v => {
    const effectiveStock = getEffectiveStock(v, selectedItemForVariations, cart);
    const isSelected = selectedVariations.includes(String(v.id));
    const outOfStock = effectiveStock !== null && effectiveStock <= 0;
    const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
    const stockTextHtml = effectiveStock !== null ? `<span style="font-size:12px;color:#F59E0B;font-weight:600;margin-left:6px">(${effectiveStock} unid.)</span>` : '';

    return `<div class="variation-option ${outOfStock ? 'disabled' : ''}" onclick="toggleVariation('${v.id}', ${isRadio}, ${outOfStock})">
      <div>
        <div class="variation-name ${outOfStock ? 'disabled' : ''}">${v.name} ${outOfStock ? '<span style="font-size:12px;color:#EF4444;font-weight:600;margin-left:6px">(Esgotado)</span>' : stockTextHtml}</div>
        ${v.additionalPrice > 0 ? `<div class="variation-price">+ R$ ${Number(v.additionalPrice).toFixed(2).replace('.', ',')}</div>` : ''}
      </div>
      <div class="checkbox ${isSelected ? 'selected' : ''} ${outOfStock ? 'disabled' : ''}">${isSelected ? checkIcon : ''}</div>
    </div>`;
  }).join('');
}

function toggleVariation(id, isRadio, outOfStock) {
  if (outOfStock) return;
  const sid = String(id);
  if (isRadio) {
    selectedVariations = [sid];
  } else {
    if (selectedVariations.includes(sid)) {
      selectedVariations = selectedVariations.filter(x => x !== sid);
    } else {
      selectedVariations = [...selectedVariations, sid];
    }
  }
  renderVariations();
}

function handleConfirmVariations() {
  if (!selectedItemForVariations) return;
  const vars = selectedItemForVariations.variations || [];
  
  if (vars.length > 0) {
    const isMandatory = selectedVariations.length === 0;
    if (isMandatory) return;
  }

  const varsToApply = vars.filter(v => selectedVariations.includes(String(v.id))).map(v => ({
    menuItemVariationId: String(v.id), name: v.name, additionalPrice: v.additionalPrice,
  }));
  addToCart(selectedItemForVariations, selectedQuantity, varsToApply);
  closeVariationModal();
}
