// Kitchen page — real-time order management
let orders = [];
const socket = io(window.API_URL);

function updateConnectionStatus(connected) {
  const el = document.getElementById('conn-status');
  const label = document.getElementById('conn-label');
  const wifiOn = document.getElementById('conn-icon-wifi');
  const wifiOff = document.getElementById('conn-icon-wifioff');
  el.className = 'connection-status ' + (connected ? 'online' : 'offline');
  label.textContent = connected ? 'Online' : 'Offline';
  wifiOn.style.display = connected ? 'block' : 'none';
  wifiOff.style.display = connected ? 'none' : 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  socket.on('connect', () => { updateConnectionStatus(true); fetchOrders(); });
  socket.on('disconnect', () => updateConnectionStatus(false));
  socket.on('order_created', () => { playNotificationSound(); fetchOrders(); });
  socket.on('order_updated', fetchOrders);

  if (socket.connected) updateConnectionStatus(true);
  fetchOrders();
});

async function fetchOrders() {
  document.getElementById('loading-spinner').style.display = 'block';
  try {
    orders = await api.get('/orders');
    render();
  } catch (e) { console.error(e); }
  finally { document.getElementById('loading-spinner').style.display = 'none'; }
}

function playNotificationSound() {
  try { new Audio('/notification.mp3').play().catch(() => {}); } catch(e) {}
}

function render() {
  const pending = orders.filter(o => o.status === 'PENDING').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const preparing = orders.filter(o => o.status === 'PREPARING').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  document.getElementById('pending-count').textContent = pending.length;
  document.getElementById('preparing-count').textContent = preparing.length;

  const oldestPending = pending[0]?.id;
  const oldestPreparing = preparing[0]?.id;

  renderList('pending-list', pending, oldestPending, 'Nenhum novo pedido');
  renderList('preparing-list', preparing, oldestPreparing, 'Cozinha livre');
}

function renderList(elId, list, oldestId, emptyMsg) {
  const el = document.getElementById(elId);
  if (!list.length) { el.innerHTML = `<div class="empty-text">${emptyMsg}</div>`; return; }
  el.innerHTML = list.map(order => orderCardHTML(order, order.id === oldestId)).join('');
}

function orderCardHTML(order, isOldest) {
  const displayName = order.tableNumber ? order.tableNumber : 'Pedido';
  const flameIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" stroke-width="1"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;

  const actionBtn = (() => {
    const map = { PENDING: ['PREPARING', 'Aceitar Pedido', clockSVG()], PREPARING: ['READY', 'Marcar como Pronto', chefSVG()], READY: ['COMPLETED', 'Entregar ao Cliente', checkSVG()] };
    const [nextStatus, label, icon] = map[order.status] || [];
    if (!nextStatus) return '';
    const confirmMsgs = {
      PENDING: { title: 'Aceitar Pedido', msg: `Iniciar o preparo para ${displayName}?`, type: 'info' },
      PREPARING: { title: 'Marcar como Pronto', msg: `O ${displayName} já está pronto para entrega?`, type: 'success' },
      READY: { title: 'Entregar', msg: `Confirmar entrega do ${displayName} ao cliente?`, type: 'success' },
    };
    const conf = confirmMsgs[order.status];
    return `<button class="action-btn ${order.status}" onclick='confirmUpdateOrder(${order.id}, "${nextStatus}", ${JSON.stringify(conf)})'>
      ${icon}<span>${label}</span>
    </button>`;
  })();

  return `<div class="order-card ${order.status} ${isOldest ? 'is-oldest' : ''}">
    <div class="card-header">
      <div style="display:flex;align-items:center;gap:6px">
        ${isOldest ? flameIcon : ''}
        <span class="order-number">${displayName}</span>
      </div>
      <span class="order-id">#${order.id}</span>
    </div>
    <div class="order-time">${fmtTime(order.createdAt)}</div>
    <div class="items-list-box">
      ${order.items.map(item => {
        const displayName = formatItemNameWithVariations(item.name, item.variations);
        return `
        <div class="order-item-row">
          <span class="item-qty">${item.quantity}x</span>
          <div style="flex:1">
            <span class="item-name">${displayName}</span>
            ${item.specialInstructions ? `<div class="item-notes">Obs: ${item.specialInstructions}</div>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>
    ${order.notes ? `<div class="general-notes"><div class="general-notes-text">Nota: ${order.notes}</div></div>` : ''}
    ${actionBtn}
  </div>`;
}

function confirmUpdateOrder(orderId, nextStatus, conf) {
  showConfirmModal({ title: conf.title, message: conf.msg, type: conf.type, onConfirm: () => updateOrder(orderId, nextStatus) });
}

async function updateOrder(orderId, status) {
  try {
    await api.patch(`/orders/${orderId}`, { status });
    const msgs = { PREPARING: 'Pedido está sendo preparado.', READY: 'Pedido marcado como pronto!', COMPLETED: 'Pedido entregue ao cliente.' };
    showToast(msgs[status] || 'Status atualizado.', 'success');
    fetchOrders();
  } catch (e) { showToast('Erro ao atualizar pedido.', 'error'); }
}

// SVG helpers
function clockSVG() { return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`; }
function chefSVG() { return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>`; }
function checkSVG() { return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`; }

fetchOrders();
