import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Database...');

    // 1
    await prisma.menuItem.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Temaki de Salmão Completo',
            description: 'Arroz, salmão fresco em cubos, cream cheese e cebolinha, envolto em alga nori crocante.',
            price: 35.90,
            category: 'Temakis',
            available: true,
            applyMarkup: true,
            manualPriceEnabled: false,
            variations: {
                create: [
                    { id: 1, name: 'Sem Cebolinha', type: 'SINGLE', additionalPrice: 0 }
                ]
            }
        }
    });

    // 2
    await prisma.menuItem.upsert({
        where: { id: 2 },
        update: {},
        create: {
            id: 2,
            name: 'Combinado Osaka (20 peças)',
            description: '5 Sashimi Salmão, 5 Uramaki Filadélfia, 5 Niguiri Salmão, 5 Hossomaki.',
            price: 89.90,
            category: 'Combinados',
            available: true,
            applyMarkup: true,
            manualPriceEnabled: false,
        }
    });

    // 3
    await prisma.menuItem.upsert({
        where: { id: 3 },
        update: {},
        create: {
            id: 3,
            name: 'Yakisoba Misto',
            description: 'Macarrão tradicional com carne, frango, legumes selecionados e molho especial da casa.',
            price: 45.00,
            category: 'Pratos Quentes',
            available: true,
            applyMarkup: true,
            manualPriceEnabled: false,
        }
    });

    // 4
    await prisma.menuItem.upsert({
        where: { id: 4 },
        update: {},
        create: {
            id: 4,
            name: 'Refrigerante Lata 350ml',
            price: 6.50,
            category: 'Bebidas',
            available: true,
            applyMarkup: false,
            manualPriceEnabled: false,
            variations: {
                create: [
                    { id: 2, name: 'Coca-Cola Zero', type: 'SINGLE', additionalPrice: 0 },
                    { id: 3, name: 'Guaraná Antarctica', type: 'SINGLE', additionalPrice: 0 }
                ]
            }
        }
    });

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
