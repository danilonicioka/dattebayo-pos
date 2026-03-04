'use client';

import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Box, ChevronLeft, Edit2 } from 'lucide-react';
import { api } from '@/services/api';
import './EditProduct.css';

interface MenuItem {
    id?: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    stockQuantity: number | null;
    manualPriceEnabled: boolean;
    available?: boolean;
}

const emptyItem: MenuItem = {
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: 'Lanches',
    stockQuantity: null,
    manualPriceEnabled: false,
    available: true
};

export default function EditProductPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<MenuItem>(emptyItem);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await api.get('/menu/public');
            setItems(response.data);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleToggleAvailability = async (item: MenuItem, newValue: boolean) => {
        // Optimistic Update
        setItems(current => current.map(i => i.id === item.id ? { ...i, available: newValue } : i));

        try {
            await api.patch(`/menu/${item.id}`, { available: newValue });
        } catch (error) {
            console.error('Erro ao atualizar disponibilidade:', error);
            // Revert on failure
            setItems(current => current.map(i => i.id === item.id ? { ...i, available: !newValue } : i));
            alert('Não foi possível atualizar o status do produto.');
        }
    };

    const handleEdit = (item: MenuItem) => {
        setSelectedItem(item);
        setIsEditing(true);
    };

    const handleCreateNew = () => {
        setSelectedItem(emptyItem);
        setIsEditing(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedItem.id) {
                await api.put(`/menu/${selectedItem.id}`, selectedItem);
                alert('Produto atualizado com sucesso!');
            } else {
                await api.post('/menu', selectedItem);
                alert('Produto criado com sucesso!');
            }
            fetchItems();
            setIsEditing(false);
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            alert('Erro ao salvar o produto.');
        }
    };

    const handleDelete = async () => {
        if (!selectedItem.id) return;

        if (window.confirm('Tem certeza que deseja excluir este produto?')) {
            try {
                await api.delete(`/menu/${selectedItem.id}`);
                fetchItems();
                setIsEditing(false);
                setSelectedItem(emptyItem);
            } catch (error) {
                console.error('Erro ao deletar produto:', error);
                alert('Erro ao deletar o produto.');
            }
        }
    };

    const categories = Array.from(new Set(items.map(item => item.category)));

    return (
        <div className="edit-container animate-fade-in">
            <header className="edit-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => window.location.href = '/'}>
                        <ChevronLeft size={28} />
                    </button>
                    <div>
                        <p className="greeting-text">Administração</p>
                        <h1 className="title-1">Gerenciamento</h1>
                    </div>
                </div>
                <button className="new-item-btn" onClick={handleCreateNew}>
                    <Plus size={24} />
                </button>
            </header>

            <div className="scroll-area">
                {loading && items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                        Carregando produtos...
                    </div>
                ) : categories.map(category => (
                    <div key={category} className="category-section">
                        <h2 className="category-title">{category}</h2>
                        {items
                            .filter(i => i.category === category)
                            .map(item => (
                                <div key={item.id} className={`item-card ${!item.available ? 'disabled' : ''}`}>
                                    <div className="item-info">
                                        <h3 className="item-name">{item.name}</h3>
                                        <p className={`item-price ${item.manualPriceEnabled ? 'manual' : ''}`}>
                                            R$ {item.price.toFixed(2).replace('.', ',')}
                                            {item.manualPriceEnabled && ' (Flexível)'}
                                        </p>
                                    </div>

                                    <div className="item-controls">
                                        <div className="switch-group">
                                            <span className="switch-label">{item.available ? 'Ativo' : 'Esgotado'}</span>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={item.available}
                                                    onChange={(e) => handleToggleAvailability(item, e.target.checked)}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>

                                        <button className="edit-button" onClick={() => handleEdit(item)}>
                                            <Edit2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                ))}

                {items.length === 0 && !loading && (
                    <div className="empty-state">
                        <Box size={48} opacity={0.3} style={{ marginBottom: '16px' }} />
                        <p>Nenhum produto cadastrado no sistema.</p>
                    </div>
                )}
            </div>

            {/* Form Overlay */}
            {isEditing && (
                <div className="form-overlay animate-fade-in">
                    <div className="form-panel">
                        <h3 className="form-title">
                            {selectedItem.id ? 'Editar Produto' : 'Novo Produto'}
                        </h3>

                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label className="form-label">Nome do Produto</label>
                                <input
                                    required
                                    type="text"
                                    className="form-input"
                                    value={selectedItem.name}
                                    onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Descrição</label>
                                <textarea
                                    className="form-textarea"
                                    value={selectedItem.description}
                                    onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">Preço (R$)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        className="form-input"
                                        value={selectedItem.price || ''}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, price: parseFloat(e.target.value) || 0 })}
                                    />
                                    <div className="checkbox-row">
                                        <input
                                            type="checkbox"
                                            id="manualPrice"
                                            checked={selectedItem.manualPriceEnabled}
                                            onChange={(e) => setSelectedItem({ ...selectedItem, manualPriceEnabled: e.target.checked })}
                                        />
                                        <label htmlFor="manualPrice" style={{ fontSize: '12px' }}>Preço flexível</label>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Categoria</label>
                                    <input
                                        required
                                        type="text"
                                        className="form-input"
                                        value={selectedItem.category}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save">
                                    Salvar
                                </button>
                            </div>

                            {selectedItem.id && (
                                <button type="button" className="btn-delete" onClick={handleDelete}>
                                    Excluir Produto
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
