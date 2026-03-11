// Admin Edit Item page (standalone)
const params = new URLSearchParams(window.location.search);
const itemId = params.get('id');
const isEditing = !!itemId;

let selectedItem = null;
let isSaving = false;
let variations = [];

document.addEventListener('DOMContentLoaded', () => {
    // Header setup done by nav.js for mobile, but let's hook back button just in case
    // The native mobile app uses `router.back()` so we simply go to products list
    
    document.getElementById('product-form')?.addEventListener('submit', handleSave);
    document.getElementById('btn-delete')?.addEventListener('click', handleDelete);
    document.getElementById('btn-add-variation')?.addEventListener('click', addVariation);
    
    // Toggle manual price fields visibility
    const manualPriceSwitch = document.getElementById('field-manual-price-enabled');
    manualPriceSwitch?.addEventListener('change', (e) => {
        document.getElementById('manual-price-group').style.display = e.target.checked ? 'block' : 'none';
    });

    if (isEditing) {
        document.getElementById('page-title').textContent = 'Editar Item';
        document.getElementById('save-text').textContent = 'Salvar Alterações';
        document.getElementById('btn-delete').style.display = 'flex';
        loadItemContext(itemId);
    } else {
        document.getElementById('page-title').textContent = 'Novo Produto';
        document.getElementById('save-text').textContent = 'Criar Item';
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('form-container').style.display = 'block';
    }
});

async function loadItemContext(id) {
    try {
        const item = await api.get(`/menu/${id}`);
        selectedItem = item;

        document.getElementById('field-name').value = item.name;
        document.getElementById('field-price').value = item.price;
        document.getElementById('field-category').value = item.category;
        
        if (item.stockQuantity !== null && item.stockQuantity !== undefined) {
             document.getElementById('field-stock').value = item.stockQuantity;
        }

        document.getElementById('field-desc').value = item.description || '';
        document.getElementById('field-available').checked = item.available;

        const manualEnabled = item.manualPriceEnabled;
        document.getElementById('field-manual-price-enabled').checked = manualEnabled;
        if (manualEnabled) {
            document.getElementById('manual-price-group').style.display = 'block';
            document.getElementById('field-manual-price').value = item.manualPrice !== null ? item.manualPrice : '';
        }

        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('form-container').style.display = 'block';

        console.log("Variations fetched from API: ", item.variations);
        if (Array.isArray(item.variations)) {
            variations = [...item.variations];
        } else {
            variations = item.variations ? [...item.variations] : [];
        }
        renderVariations();

    } catch (e) {
        showToast('Produto não encontrado na base.', 'error');
        setTimeout(() => { window.location.href = '/admin/products.html'; }, 1500);
    }
}

async function handleSave(e) {
    e.preventDefault();
    if (isSaving) return;

    const name = document.getElementById('field-name').value.trim();
    const priceStr = document.getElementById('field-price').value.replace(',', '.');
    const category = document.getElementById('field-category').value.trim();
    const price = parseFloat(priceStr);

    if (!name) return showToast('O Produto precisa de um nome.', 'error');
    if (!category) return showToast('Passe uma categoria.', 'error');
    if (isNaN(price)) return showToast('Preço Fixo Inválido.', 'error');

    const manualPriceEnabled = document.getElementById('field-manual-price-enabled').checked;
    let manualPrice = null;
    if (manualPriceEnabled) {
        const mpStr = document.getElementById('field-manual-price').value.replace(',', '.');
        manualPrice = parseFloat(mpStr);
        if (isNaN(manualPrice)) return showToast('Preço Promocional Inválido.', 'error');
    }

    const stockRaw = document.getElementById('field-stock').value.trim();
    const stockQuantity = stockRaw !== '' ? parseInt(stockRaw, 10) : null;

    // Gather variations from DOM
    const varItems = Array.from(document.querySelectorAll('.variation-card'));
    variations = varItems.map(card => {
        const stockRaw = card.querySelector('.var-stock-input').value.trim();
        return {
            name: card.querySelector('.var-name-input').value.trim(),
            additionalPrice: parseFloat(card.querySelector('.var-price-input').value.replace(',', '.')) || 0,
            stockQuantity: stockRaw !== '' ? parseInt(stockRaw, 10) : null,
            type: 'SINGLE'
        };
    }).filter(v => v.name); // only keep if name is filled

    const payload = {
        name,
        description: document.getElementById('field-desc').value.trim() || null,
        category,
        price,
        available: document.getElementById('field-available').checked,
        manualPriceEnabled,
        manualPrice,
        stockQuantity,
        applyMarkup: true,
        variations: variations
    };

    const btn = document.getElementById('btn-save');
    const btnText = document.getElementById('save-text');

    try {
        isSaving = true;
        btn.disabled = true;
        btnText.textContent = 'Salvando...';

        if (isEditing) {
            await api.patch(`/menu/${itemId}`, payload);
            showToast('Item Atualizado com Sucesso!', 'success');
        } else {
            await api.post('/menu', payload);
            showToast('Item Criado com Sucesso!', 'success');
        }
        
        sessionStorage.setItem('product_action_success', isEditing ? 'Produto atualizado!' : 'Produto criado!');
        window.location.href = '/admin/products.html';
    } catch (e) {
        console.error(e);
        showToast('Falha ao salvar. Verifique se há itens com erro.', 'error');
    } finally {
        isSaving = false;
        btn.disabled = false;
        btnText.textContent = isEditing ? 'Salvar Alterações' : 'Criar Item';
    }
}

async function handleDelete() {
    if (!isEditing) return;
    
    showConfirmModal({
        title: 'Excluir Item',
        message: 'Tem certeza que deseja excluir este item? Essa ação não pode ser desfeita.',
        type: 'danger',
        onConfirm: async () => {
            isSaving = true;
            document.getElementById('btn-delete').disabled = true;
            document.getElementById('btn-delete').style.opacity = '0.5';
            
            try {
                const itemId = selectedItem.id;
                await api.delete(`/menu/${itemId}`);
                sessionStorage.setItem('product_action_success', 'Produto excluído com sucesso!');
                window.location.href = '/admin/products.html';
            } catch (e) {
                showToast('Erro: Falha ao excluir item.', 'error');
                isSaving = false;
                document.getElementById('btn-delete').disabled = false;
                document.getElementById('btn-delete').style.opacity = '1';
            }
        }
    });
}

// ── Variations Utilities ───────────────────────────────────────────────────

function renderVariations() {
    const container = document.getElementById('variations-list');
    container.innerHTML = '';
    
    variations.forEach((v, index) => {
        const div = document.createElement('div');
        div.className = 'variation-card';
        div.innerHTML = `
            <div class="variation-content">
                <div>
                    <label class="mini-label">Nome da Variação</label>
                    <input type="text" class="variation-input var-name-input" placeholder="Ex: Tamanho M" value="${v.name || ''}" />
                </div>
                <div style="display: flex; gap: 8px;">
                    <div style="flex: 1;">
                        <label class="mini-label">Preço (+)</label>
                        <input type="number" step="0.01" class="variation-input var-price-input" placeholder="0.00" value="${(v.additionalPrice !== undefined && v.additionalPrice !== null) ? v.additionalPrice.toString().replace(',', '.') : ''}" />
                    </div>
                    <div style="flex: 1;">
                        <label class="mini-label">Estoque</label>
                        <input type="number" class="variation-input var-stock-input" placeholder="∞" value="${v.stockQuantity !== null && v.stockQuantity !== undefined ? v.stockQuantity : ''}" />
                    </div>
                </div>
            </div>
            <button type="button" class="remove-var-btn" onclick="removeVariation(${index})">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
        `;
        container.appendChild(div);
    });
}

function addVariation() {
    // Save current input states back to array before modifying array
    const varItems = Array.from(document.querySelectorAll('.variation-card'));
    variations = varItems.map(card => {
        const stockRaw = card.querySelector('.var-stock-input').value.trim();
        return {
            name: card.querySelector('.var-name-input').value,
            additionalPrice: parseFloat(card.querySelector('.var-price-input').value) || 0,
            stockQuantity: stockRaw !== '' ? parseInt(stockRaw, 10) : null,
            type: 'SINGLE'
        };
    });
    
    variations.push({ name: '', additionalPrice: 0, stockQuantity: null, type: 'SINGLE' });
    renderVariations();
}

window.removeVariation = function(index) {
    // Gather current inputs before removing
    const varItems = Array.from(document.querySelectorAll('.variation-card'));
    variations = varItems.map(card => {
        const stockRaw = card.querySelector('.var-stock-input').value.trim();
        return {
            name: card.querySelector('.var-name-input').value,
            additionalPrice: parseFloat(card.querySelector('.var-price-input').value) || 0,
            stockQuantity: stockRaw !== '' ? parseInt(stockRaw, 10) : null,
            type: 'SINGLE'
        };
    });
    
    variations.splice(index, 1);
    renderVariations();
}
