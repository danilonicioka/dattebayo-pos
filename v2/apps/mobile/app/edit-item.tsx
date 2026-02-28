import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MenuItem, CreateMenuItemDTO, UpdateMenuItemDTO, MenuItemVariation } from '@dattebayo/core';
import { api } from '@/services/api';
import { Trash2, Plus } from 'lucide-react-native';

export default function EditItemScreen() {
    const { id } = useLocalSearchParams();
    const isEditing = !!id;

    const [isLoading, setIsLoading] = useState(isEditing);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [available, setAvailable] = useState(true);

    const [manualPriceEnabled, setManualPriceEnabled] = useState(false);
    const [manualPrice, setManualPrice] = useState('');
    const [stockQuantity, setStockQuantity] = useState('');
    const [variations, setVariations] = useState<MenuItemVariation[]>([]);

    useEffect(() => {
        if (isEditing) {
            loadItemContext(Number(id));
        }
    }, [id]);

    const loadItemContext = async (itemId: number) => {
        try {
            const response = await api.get<MenuItem>(`/menu/${itemId}`);
            const item = response.data;

            setName(item.name);
            setDescription(item.description || '');
            setPrice(item.price.toString());
            setCategory(item.category);
            setAvailable(item.available);

            setManualPriceEnabled(item.manualPriceEnabled);
            if (item.manualPrice != null) {
                setManualPrice(item.manualPrice.toString());
            }
            if (item.stockQuantity != null) {
                setStockQuantity(item.stockQuantity.toString());
            }
            setVariations(item.variations || []);

        } catch (error) {
            Alert.alert('Erro', 'Produto não encontrado na base.');
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        if (!name.trim()) return 'O Produto precisa de um nome.';
        if (!category.trim()) return 'Passe uma categoria (Ex: Bebida).';
        if (!price || isNaN(Number(price.replace(',', '.')))) return 'Preço Fixo Real Inválido.';

        if (manualPriceEnabled) {
            if (!manualPrice || isNaN(Number(manualPrice.replace(',', '.')))) return 'Preço Promocional Inválido.';
        }

        return null;
    };

    const handleSave = async () => {
        console.log('[DEBUG] handleSave iniciado');
        const errorMsg = validateForm();
        if (errorMsg) {
            console.log('[DEBUG] Erro de validação:', errorMsg);
            Alert.alert('Faltam Dados', errorMsg);
            return;
        }

        const payload = {
            name: name.trim(),
            description: description.trim() || null,
            category: category.trim(),
            price: Number(price.replace(',', '.')),
            available,
            manualPriceEnabled: manualPriceEnabled,
            manualPrice: manualPriceEnabled ? Number(manualPrice.replace(',', '.')) : null,
            stockQuantity: stockQuantity.trim() !== '' ? Number(stockQuantity) : null,
            variations: variations.map(v => ({
                ...v,
                additionalPrice: Number(v.additionalPrice.toString().replace(',', '.')),
                stockQuantity: v.stockQuantity != null ? Number(v.stockQuantity) : null
            })),
            applyMarkup: true
        } as any;

        console.log('[DEBUG] Payload montado:', payload);

        try {
            setIsSaving(true);
            console.log(`[DEBUG] Enviando requisição (${isEditing ? 'PATCH' : 'POST'})...`);
            if (isEditing) {
                const updatePayload: UpdateMenuItemDTO = { ...payload, id: Number(id) };
                await api.patch(`/menu/${id}`, updatePayload);
            } else {
                const createPayload: CreateMenuItemDTO = { ...payload };
                await api.post('/menu', createPayload);
            }
            console.log('[DEBUG] Requisição bem-sucedida!');

            Alert.alert('Sucesso', `Item ${isEditing ? 'Atualizado' : 'Criado'} com Sucesso!`);
            router.back();

        } catch (err: any) {
            console.log('[DEBUG] Erro na requisição:', err?.response?.data || err.message);
            Alert.alert('Falha Gráfica', 'Ocorreu um erro ao comitar no Banco de Dados Prisma.');
        } finally {
            setIsSaving(false);
        }
    };


    const handleDelete = () => {
        Alert.alert(
            "Remover Produto",
            `Você tem certeza que quer excluir permanentemente o item "${name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sim, Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsSaving(true);
                            await api.delete(`/menu/${id}`);
                            router.back();
                        } catch (e) {
                            Alert.alert("Erro", "Falha ao excluir item.");
                            setIsSaving(false);
                        }
                    }
                }
            ]
        );
    };


    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#E11D48" />
                <Text>Lendo Dados do Produto...</Text>
            </View>
        )
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.pageTitle}>{isEditing ? 'Editar Item' : 'Novo Produto'}</Text>
            <Text style={styles.hint}>Preencha as informações do cardápio logo abaixo:</Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Nome do Item <Text style={styles.asterisk}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: X-Salada com Bacon"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                    <Text style={[styles.label, manualPriceEnabled && { color: '#9CA3AF' }]}>Preço Fixo (R$) <Text style={styles.asterisk}>*</Text></Text>
                    <TextInput
                        style={[styles.input, manualPriceEnabled && { backgroundColor: '#F3F4F6' }]}
                        placeholder="25.00"
                        keyboardType="decimal-pad"
                        value={price}
                        onChangeText={setPrice}
                    />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Categoria <Text style={styles.asterisk}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Lanche"
                        value={category}
                        onChangeText={setCategory}
                    />
                </View>


                <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Estoque (Qtd)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ilimitado"
                        keyboardType="number-pad"
                        value={stockQuantity}
                        onChangeText={setStockQuantity}
                    />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Descrição (Opcional)</Text>
                <TextInput
                    style={StyleSheet.flatten([styles.input, styles.textArea])}
                    placeholder="Hambúrguer de 180g, maionese defumada..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                />
            </View>

            <View style={styles.formGroup}>
                <View style={styles.switchWrapper}>
                    <View style={styles.switchTextContainer}>
                        <Text style={styles.label}>Habilitar Preço Manual</Text>
                        <Text style={styles.hintText}>Definir outro preço para este item</Text>
                    </View>
                    <Switch
                        value={manualPriceEnabled}
                        onValueChange={setManualPriceEnabled}
                        trackColor={{ false: "#767577", true: "#6366F1" }}
                        thumbColor={manualPriceEnabled ? "#fff" : "#f4f3f4"}
                    />
                </View>

                {manualPriceEnabled && (
                    <View style={{ marginTop: 12 }}>
                        <Text style={styles.label}>Preço com Desconto/Manual (R$)</Text>
                        <TextInput
                            style={styles.input}
                            value={manualPrice}
                            onChangeText={setManualPrice}
                            keyboardType="numeric"
                            placeholder="0,00"
                        />
                    </View>
                )}
            </View>

            <View style={styles.formGroup}>
                <View style={styles.switchWrapper}>
                    <View style={styles.switchTextContainer}>
                        <Text style={styles.label}>Disponível para Venda</Text>
                        <Text style={styles.hintText}>Ocultar item se estiver em falta</Text>
                    </View>
                    <Switch
                        value={available}
                        onValueChange={setAvailable}
                        trackColor={{ false: "#767577", true: "#10B981" }}
                        thumbColor={available ? "#fff" : "#f4f3f4"}
                    />
                </View>
            </View>

            {/* Gestão de Variações */}
            <View style={styles.variationHeader}>
                <Text style={styles.label}>Variações (Ex: Tamanhos, Sabores)</Text>
                <TouchableOpacity
                    style={styles.addVariationBtn}
                    onPress={() => setVariations([...variations, { name: '', additionalPrice: 0, type: 'SINGLE', stockQuantity: null }])}
                >
                    <Plus size={16} color="#4F46E5" />
                    <Text style={styles.addVariationText}>Adicionar</Text>
                </TouchableOpacity>
            </View>

            {variations.length > 0 && (
                <View style={styles.variationList}>
                    {variations.map((v, index) => (
                        <View key={index} style={styles.variationCard}>
                            <View style={{ flex: 1, gap: 10 }}>
                                <TextInput
                                    style={styles.variationInput}
                                    placeholder="Nome da Variação (ex: Lata 350ml)"
                                    value={v.name}
                                    onChangeText={(text) => {
                                        const newVars = [...variations];
                                        newVars[index].name = text;
                                        setVariations(newVars);
                                    }}
                                />
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.miniLabel}>Preço Adicional (R$)</Text>
                                        <TextInput
                                            style={styles.variationInput}
                                            placeholder="0,00"
                                            keyboardType="numeric"
                                            value={v.additionalPrice.toString()}
                                            onChangeText={(text) => {
                                                const newVars = [...variations];
                                                newVars[index].additionalPrice = text as any;
                                                setVariations(newVars);
                                            }}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.miniLabel}>Estoque Variação</Text>
                                        <TextInput
                                            style={styles.variationInput}
                                            placeholder="Ilimitado"
                                            keyboardType="numeric"
                                            value={v.stockQuantity?.toString() || ''}
                                            onChangeText={(text) => {
                                                const newVars = [...variations];
                                                newVars[index].stockQuantity = text === '' ? null : Number(text);
                                                setVariations(newVars);
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.removeVarBtn}
                                onPress={() => setVariations(variations.filter((_, i) => i !== index))}
                            >
                                <Trash2 size={18} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            <TouchableOpacity
                style={StyleSheet.flatten([styles.saveButton, isSaving && styles.saveButtonDisabled])}
                onPress={handleSave}
                disabled={isSaving}
            >
                {isSaving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveText}>
                        {isEditing ? 'Salvar Alterações' : 'Criar Item'}
                    </Text>
                )}
            </TouchableOpacity>

            {isEditing && (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.deleteText}>Excluir Produto</Text>
                </TouchableOpacity>
            )}

            {/* Spacer para não grudar no teclado no iOS */}
            <View style={{ height: 60 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        padding: 20,
        paddingTop: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 4,
    },
    hint: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
    },
    formGroup: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    asterisk: {
        color: '#E11D48',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111827',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    inputDisabled: {
        backgroundColor: '#F3F4F6',
        color: '#9CA3AF',
    },
    switchWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 32,
    },
    switchTextContainer: {
        flex: 1,
        paddingRight: 16,
    },
    hintText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    saveButton: {
        backgroundColor: '#059669',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    deleteButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FCA5A5',
        backgroundColor: '#FEF2F2',
    },
    deleteText: {
        color: '#DC2626',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Variações Styles
    variationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 8,
    },
    addVariationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 6,
        backgroundColor: '#EEF2FF',
        borderRadius: 6,
    },
    addVariationText: {
        color: '#4F46E5',
        fontSize: 12,
        fontWeight: 'bold',
    },
    variationList: {
        gap: 12,
        marginBottom: 24,
    },
    variationCard: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    variationInput: {
        backgroundColor: '#FEFCE8', // Amarelo bem claro para destacar campos de item
        borderWidth: 1,
        borderColor: '#FEF08A',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#111827',
    },
    miniLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 4,
    },
    removeVarBtn: {
        padding: 8,
    }
});
