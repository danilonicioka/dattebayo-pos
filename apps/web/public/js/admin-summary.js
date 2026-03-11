// Admin Summary page
let metrics = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-back')?.addEventListener('click', () => window.location.href = '/');
  document.getElementById('btn-clear')?.addEventListener('click', handleClear);

  fetchMetrics();
});

async function fetchMetrics() {
  try {
    metrics = await api.get('/orders/summary');
    render();
  } catch (e) { document.getElementById('metrics-section').innerHTML = '<p style="color:red;padding:24px">Erro ao carregar relatórios.</p>'; }
}

function render() {
  const el = document.getElementById('metrics-section');
  if (!metrics) return;
  const tagIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`;

  el.innerHTML = `
    <div class="metrics-grid">
      <div class="metric-card revenue">
        <div class="metric-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          <span class="metric-title">Faturamento</span>
        </div>
        <span class="metric-value green">R$ ${Number(metrics.totalRevenue).toFixed(2).replace('.', ',')}</span>
        <span class="metric-subtitle">Total acumulado em caixa</span>
      </div>
      <div class="metric-card volume">
        <div class="metric-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          <span class="metric-title">Volume</span>
        </div>
        <span class="metric-value blue">${metrics.completedOrdersCount || 0}</span>
        <span class="metric-subtitle">Pedidos entregues</span>
      </div>
    </div>

    <h3 class="section-title">Vendas por Produto</h3>

    ${metrics.productStats && metrics.productStats.length > 0
      ? `<div class="category-list">
          ${metrics.productStats.map(stat => `
            <div class="category-row">
              <div class="category-info">
                <div class="category-icon-box">${tagIcon}</div>
                <div>
                  <div class="category-name">${stat.name}</div>
                  <div class="category-volume">${stat.itemsSold} ${stat.itemsSold === 1 ? 'item vendido' : 'itens vendidos'}</div>
                </div>
              </div>
              <div class="category-revenue">R$ ${Number(stat.revenue).toFixed(2).replace('.', ',')}</div>
            </div>`).join('')}
        </div>`
      : `<div class="empty-state"><p>Nenhuma venda registrada até o momento.</p></div>`}`;
}

function handleClear() {
  showConfirmModal({
    title: 'Zerar Caixa',
    message: 'Tem certeza que deseja zerar o histórico de pedidos entregues? Isso não pode ser desfeito.',
    type: 'danger',
    onConfirm: async () => {
      try {
        await api.post('/orders/clear', {});
        showToast('Caixa limpo com sucesso.', 'success');
        fetchMetrics();
      } catch (e) { showToast('Erro ao tentar limpar o caixa.', 'error'); }
    }
  });
}
