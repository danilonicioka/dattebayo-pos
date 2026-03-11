// Admin Products page
let items = [];
let selectedItem = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-back')?.addEventListener('click', () => window.location.href = '/');
  document.getElementById('btn-new-product')?.addEventListener('click', () => window.location.href = '/admin/edit-item.html');

  const successMsg = sessionStorage.getItem('product_action_success');
  if (successMsg) {
      showToast(successMsg, 'success');
      sessionStorage.removeItem('product_action_success');
  }

  fetchItems();
});

async function fetchItems() {
  try {
    items = await api.get('/menu');
    renderProducts();
  } catch (e) { document.getElementById('products-area').innerHTML = '<p style="padding:24px;color:red">Erro ao carregar produtos.</p>'; }
}

function renderProducts() {
  const area = document.getElementById('products-area');
  if (!items.length) {
    area.innerHTML = `<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3" style="margin-bottom:16px"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg><p>Nenhum produto cadastrado no sistema.</p></div>`;
    return;
  }
  const categories = [...new Set(items.map(i => i.category))];
  area.innerHTML = categories.map(cat => `
    <div class="category-section">
      <h2 class="category-title">${cat}</h2>
      ${items.filter(i => i.category === cat).map(item => `
        <div class="item-card ${!item.available ? 'disabled' : ''}">
          <div class="item-info">
            <h3 class="item-name">${item.name}</h3>
            <p class="item-price ${item.manualPriceEnabled ? 'manual' : ''}">R$ ${Number(item.price).toFixed(2).replace('.', ',')}${item.manualPriceEnabled ? ' (Flexível)' : ''}</p>
          </div>
          <div class="item-controls">
            <div class="switch-group">
              <span class="switch-label">${item.available ? 'Ativo' : 'Esgotado'}</span>
              <label class="switch">
                <input type="checkbox" ${item.available ? 'checked' : ''} onchange="toggleAvailability(${item.id}, this.checked)" />
                <span class="slider"></span>
              </label>
            </div>
            <button class="edit-button" onclick="window.location.href = '/admin/edit-item.html?id=${item.id}'">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        </div>`).join('')}
    </div>`).join('');
}

async function toggleAvailability(id, newValue) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  // Optimistic
  items = items.map(i => i.id === id ? { ...i, available: newValue } : i);
  renderProducts();
  try {
    await api.patch(`/menu/${id}`, { available: newValue });
    showToast('Produto atualizado com sucesso!', 'success');
  } catch (e) {
    items = items.map(i => i.id === id ? { ...i, available: !newValue } : i);
    renderProducts();
    console.error('Failed to update product availability:', e);
    showToast('Não foi possível atualizar o status do produto.', 'error');
  }
}
