import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MenuItem, CreateMenuItemDTO, UpdateMenuItemDTO, MenuItemVariation } from '@dattebayo/core';
import { api } from '@/services/api';
import { Trash2, Plus } from 'lucide-react-native';
import { scale, fontScale, verticalScale } from '@/utils/responsive';

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

    const hasVariations = variations.length > 0;

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
                <View style={[styles.formGroup, { flex: 1, marginRight: scale(12) }]}>
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


                {!hasVariations && (
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Estoque Principal</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ilimitado"
                            keyboardType="number-pad"
                            value={stockQuantity}
                            onChangeText={setStockQuantity}
                        />
                    </View>
                )}
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
                        trackColor={{ false: "#767577", true: "#ee8b1b" }}
                        thumbColor={manualPriceEnabled ? "#fff" : "#f4f3f4"}
                    />
                </View>

                {manualPriceEnabled && (
                    <View style={{ marginTop: verticalScale(12) }}>
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
                        trackColor={{ false: "#767577", true: "#223c0e" }}
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
                    <Plus size={scale(16)} color="#ee8b1b" />
                    <Text style={styles.addVariationText}>Adicionar</Text>
                </TouchableOpacity>
            </View>

            {variations.length > 0 && (
                <View style={styles.variationList}>
                    {variations.map((v, index) => (
                        <View key={index} style={styles.variationCard}>
                            <View style={{ flex: 1, gap: scale(10) }}>
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

                                <View style={{ flexDirection: 'row', gap: scale(10) }}>
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
                                <Trash2 size={scale(18)} color="#EF4444" />
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
            <View style={{ height: verticalScale(60) }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        padding: scale(20),
        paddingTop: verticalScale(40),
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: fontScale(28),
        fontWeight: '900',
        color: '#111827',
        marginBottom: verticalScale(4),
    },
    hint: {
        fontSize: fontScale(14),
        color: '#6B7280',
        marginBottom: verticalScale(24),
    },
    formGroup: {
        marginBottom: verticalScale(16),
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: fontScale(14),
        fontWeight: '600',
        color: '#374151',
        marginBottom: verticalScale(8),
    },
    asterisk: {
        color: '#E11D48',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: scale(8),
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        fontSize: fontScale(16),
        color: '#111827',
    },
    textArea: {
        height: verticalScale(100),
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
        padding: scale(16),
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: verticalScale(32),
    },
    switchTextContainer: {
        flex: 1,
        paddingRight: scale(16),
    },
    hintText: {
        fontSize: fontScale(12),
        color: '#6B7280',
        marginTop: verticalScale(2),
    },
    saveButton: {
        backgroundColor: '#ee8b1b', // Laranja do botão V1
        padding: scale(16),
        borderRadius: scale(8),
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: fontScale(16),
    },
    deleteButton: {
        padding: scale(16),
        borderRadius: scale(8),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FCA5A5',
        backgroundColor: '#FEF2F2',
    },
    deleteText: {
        color: '#DC2626',
        fontWeight: 'bold',
        fontSize: fontScale(16),
    },
    // Variações Styles
    variationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
        marginTop: verticalScale(8),
    },
    addVariationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
        padding: scale(6),
        backgroundColor: '#EEF2FF',
        borderRadius: scale(6),
    },
    addVariationText: {
        color: '#ee8b1b',
        fontSize: fontScale(12),
        fontWeight: 'bold',
    },
    variationList: {
        gap: scale(12),
        marginBottom: verticalScale(24),
    },
    variationCard: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: scale(10),
        padding: scale(12),
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
    },
    variationInput: {
        backgroundColor: '#FEFCE8', // Amarelo bem claro para destacar campos de item
        borderWidth: 1,
        borderColor: '#FEF08A',
        borderRadius: scale(6),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(8),
        fontSize: fontScale(14),
        color: '#111827',
    },
    miniLabel: {
        fontSize: fontScale(10),
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: verticalScale(4),
    },
    removeVarBtn: {
        padding: scale(8),
    }
});
