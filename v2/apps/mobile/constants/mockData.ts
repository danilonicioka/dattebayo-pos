import { MenuItem } from '@dattebayo/core';

export const MOCK_MENU_ITEMS: MenuItem[] = [
    {
        id: 1,
        name: 'Temaki de Salmão Completo',
        description: 'Arroz, salmão fresco em cubos, cream cheese e cebolinha, envolto em alga nori crocante.',
        price: 35.90,
        category: 'Temakis',
        available: true,
        applyMarkup: true,
        manualPriceEnabled: false,
        variations: [
            {
                id: 1,
                name: 'Sem Cebolinha',
                type: 'SINGLE',
                additionalPrice: 0,
            }
        ]
    },
    {
        id: 2,
        name: 'Combinado Osaka (20 peças)',
        description: '5 Sashimi Salmão, 5 Uramaki Filadélfia, 5 Niguiri Salmão, 5 Hossomaki.',
        price: 89.90,
        category: 'Combinados',
        available: true,
        applyMarkup: true,
        manualPriceEnabled: false,
        variations: []
    },
    {
        id: 3,
        name: 'Yakisoba Misto',
        description: 'Macarrão tradicional com carne, frango, legumes selecionados e molho especial da casa.',
        price: 45.00,
        category: 'Pratos Quentes',
        available: true,
        applyMarkup: true,
        manualPriceEnabled: false,
        variations: []
    },
    {
        id: 4,
        name: 'Refrigerante Lata 350ml',
        price: 6.50,
        category: 'Bebidas',
        available: true,
        applyMarkup: false,
        manualPriceEnabled: false,
        variations: [
            {
                id: 2,
                name: 'Coca-Cola Zero',
                type: 'SINGLE',
                additionalPrice: 0,
            },
            {
                id: 3,
                name: 'Guaraná Antarctica',
                type: 'SINGLE',
                additionalPrice: 0,
            }
        ]
    }
];
