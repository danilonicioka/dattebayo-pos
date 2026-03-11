// Orders page
let orders = [];
let activeTab = 'ACTIVE';

const socket = io(window.API_URL);

function updateConnectionStatus(connected) {
  const el = document.getElementById('conn-status');
  document.getElementById('conn-label').textContent = connected ? 'Online' : 'Offline';
  document.getElementById('conn-icon-wifi').style.display = connected ? 'block' : 'none';
  document.getElementById('conn-icon-wifioff').style.display = connected ? 'none' : 'block';
  el.className = 'connection-status ' + (connected ? 'online' : 'offline');
}

document.addEventListener('DOMContentLoaded', () => {
  socket.on('connect', () => { updateConnectionStatus(true); fetchOrders(); });
  socket.on('disconnect', () => updateConnectionStatus(false));
  socket.on('order_created', fetchOrders);
  socket.on('order_updated', fetchOrders);
  if (socket.connected) updateConnectionStatus(true);

  document.getElementById('tab-active')?.addEventListener('click', () => switchTab('ACTIVE'));
  document.getElementById('tab-history')?.addEventListener('click', () => switchTab('HISTORY'));

  fetchOrders();
});

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  render();
}

async function fetchOrders() {
  try {
    orders = await api.get('/orders');
    render();
  } catch (e) { console.error(e); }
}

function calcOrderTotal(items) {
  return items.reduce((t, i) => t + ((i.price + (i.variations || []).reduce((a, v) => a + v.additionalPrice, 0)) * i.quantity), 0);
}

const statusLabels = { PENDING: 'Pendente', PREPARING: 'Preparando', READY: 'Pronto', COMPLETED: 'Entregue', CANCELLED: 'Cancelado' };

function render() {
  const filtered = orders.filter(o =>
    activeTab === 'ACTIVE' ? ['PENDING', 'PREPARING', 'READY'].includes(o.status) : ['COMPLETED', 'CANCELLED'].includes(o.status)
  ).sort((a, b) => {
    const ta = new Date(a.createdAt), tb = new Date(b.createdAt);
    return activeTab === 'ACTIVE' ? ta - tb : tb - ta;
  });

  const el = document.getElementById('orders-list');
  if (!filtered.length) {
    el.innerHTML = `<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><p>Nenhum pedido encontrado.</p></div>`;
    return;
  }

  el.innerHTML = filtered.map(order => {
    const name = order.tableNumber ? `${order.tableNumber} #${order.id}` : `Pedido #${order.id}`;
    const actions = activeTab === 'ACTIVE' ? `
      <div class="order-actions">
        <button class="action-btn btn-cancel" onclick='confirmAction(${order.id}, "CANCELLED")'>Cancelar</button>
        <button class="action-btn btn-deliver" onclick='confirmAction(${order.id}, "COMPLETED")'>Entregar</button>
      </div>` : '';
    return `<div class="order-row-card">
      <div class="card-header">
        <div>
          <span class="order-number">${name}</span>
          <div class="time-text">${fmtTime(order.createdAt)}</div>
        </div>
        <span class="status-badge ${order.status}">${statusLabels[order.status] || order.status}</span>
      </div>
      <div class="divider"></div>
      <div class="order-items">
        ${order.items.map(i => `<div class="item-row"><span class="item-qty">${i.quantity}x</span><span class="item-name">${i.name}</span></div>`).join('')}
      </div>
      <div class="divider"></div>
      <div class="total-row">
        <span class="total-label">Total</span>
        <span class="total-value">${fmtPrice(calcOrderTotal(order.items))}</span>
      </div>
      ${actions}
    </div>`;
  }).join('');
}

function confirmAction(orderId, status) {
  const titles = { CANCELLED: 'Cancelar Pedido', COMPLETED: 'Entregar ao Cliente' };
  const msgs = { CANCELLED: `Deseja realmente cancelar o pedido #${orderId}?`, COMPLETED: `Confirmar a entrega do pedido #${orderId} ao cliente?` };
  const types = { CANCELLED: 'danger', COMPLETED: 'success' };
  showConfirmModal({ title: titles[status], message: msgs[status], type: types[status], onConfirm: () => updateStatus(orderId, status) });
}

async function updateStatus(orderId, status) {
  try {
    await api.patch(`/orders/${orderId}`, { status });
    showToast(status === 'COMPLETED' ? 'Pedido entregue com sucesso!' : 'Pedido cancelado.', 'success');
    fetchOrders();
  } catch (e) { showToast('Erro ao atualizar pedido.', 'error'); }
}

fetchOrders();
