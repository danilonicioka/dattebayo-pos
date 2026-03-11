// nav.js – Mobile navigation replicating the mobile app exactly:
//   • Caixa + Pedidos → 2-tab bottom bar
//   • Admin pages      → 2-tab bottom bar (Gerenciamento + Caixa) + back button in header
//   • Kitchen page     → no tab bar, back button in header only

(function () {
  const path = window.location.pathname;

  // ── Shared helpers ─────────────────────────────────────────────────────────
  const HAMBURGER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;

  function buildBar(tabs) {
    const nav = document.createElement('nav');
    nav.id = 'mobile-tab-bar';
    nav.setAttribute('aria-label', 'Navegação');
    tabs.forEach(tab => {
      const isActive = tab.activePattern.test(path);
      const a = document.createElement('a');
      a.href = tab.href;
      a.className = 'mobile-tab' + (isActive ? ' mobile-tab--active' : '');
      a.setAttribute('aria-current', isActive ? 'page' : 'false');
      a.innerHTML = `<span class="mobile-tab__icon">${tab.icon}</span><span class="mobile-tab__label">${tab.label}</span>`;
      nav.appendChild(a);
    });
    document.body.appendChild(nav);
  }

  // Injects a back button + optional title before the sidebar (or header)
  function buildMobileHeader(backHref, title) {
    const headerRow = document.createElement('div');
    headerRow.id = 'mobile-page-header';
    headerRow.innerHTML = `
      <a href="${backHref}" class="mobile-back-btn" aria-label="Voltar">${HAMBURGER_SVG}</a>
      ${title ? `<span class="mobile-page-title">${title}</span>` : ''}
    `;
    // Place before the app-container's first child
    const container = document.querySelector('.app-container') || document.body;
    container.insertBefore(headerRow, container.firstChild);
  }

  // Quick-access icon buttons for Caixa header (⚙ Admin, 🍳 Cozinha)
  function buildCaixaHeaderButtons() {
    const headerLeft = document.querySelector('.header-left .title-stack');
    if (!headerLeft) return;
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:center;gap:10px;';
    [
      {
        href: '/admin/products.html',
        title: 'Gerenciamento',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
      },
      {
        href: '/kitchen.html',
        title: 'Cozinha',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>`,
      },
    ].forEach(btn => {
      const a = document.createElement('a');
      a.href = btn.href;
      a.title = btn.title;
      a.className = 'caixa-quick-btn';
      a.innerHTML = btn.icon;
      wrapper.appendChild(a);
    });
    headerLeft.parentElement.insertBefore(wrapper, headerLeft);
  }

  // ── Tab definitions ────────────────────────────────────────────────────────
  const MAIN_TABS = [
    {
      label: 'Caixa',
      href: '/index.html',
      activePattern: /^\/(index\.html)?$/,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    },
    {
      label: 'Pedidos',
      href: '/orders.html',
      activePattern: /\/orders\.html/,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    },
  ];

  const ADMIN_TABS = [
    {
      label: 'Gerenciamento',
      href: '/admin/products.html',
      activePattern: /\/admin\/products\.html/,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
    },
    {
      label: 'Caixa',
      href: '/admin/summary.html',
      activePattern: /\/admin\/summary\.html/,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    },
  ];

  // ── Route logic ────────────────────────────────────────────────────────────
  function run() {
    const isCaixa   = /^\/(index\.html)?$/.test(path);
    const isOrders  = /\/orders\.html/.test(path);
    const isKitchen = /\/kitchen\.html/.test(path);
    const isEditItem = /\/admin\/edit-item\.html/.test(path);
    const isAdmin   = /\/admin\//.test(path) && !isEditItem;

    if (isCaixa || isOrders) {
      buildBar(MAIN_TABS);
      if (isCaixa) buildCaixaHeaderButtons();
    }

    if (isKitchen) {
      buildMobileHeader('/index.html', 'Cozinha');
    }

    if (isEditItem) {
      buildMobileHeader('/admin/products.html', null); // back to products list
    }

    if (isAdmin) {
      buildMobileHeader('/index.html', null); // back to main
      buildBar(ADMIN_TABS);
    }
  }

  // Only inject on mobile viewports
  if (!window.matchMedia('(max-width: 1024px)').matches) return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
