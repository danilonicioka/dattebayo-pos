import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando o Seed do Banco de Dados com os itens Originais V1...');

    const count = await prisma.menuItem.count();
    if (count > 0) {
        console.log('O banco de dados já possui itens. Pulando o seed para evitar perda de dados.');
        return;
    }

    console.log('Banco de dados vazio. Populando itens iniciais...');
    await prisma.menuItemVariation.deleteMany();
    await prisma.menuItem.deleteMany();

    // Helper para criar item com variações
    async function createItemWithVariations(
        name: string,
        description: string,
        price: number,
        category: string,
        variations: { name: string; type: string; additionalPrice: number }[]
    ) {
        const createdItem = await prisma.menuItem.create({
            data: {
                name,
                description,
                price,
                category,
                available: true,
                variations: {
                    create: variations,
                },
            },
        });
        console.log(`Criado: ${createdItem.name} com ${variations.length} variações.`);
        return createdItem;
    }

    // 1. Tempurá
    await createItemWithVariations(
        'Tempurá',
        'Tempura de legumes com ou sem camarão',
        10.0,
        'Comidas',
        [
            { name: 'De Legumes', type: 'SINGLE', additionalPrice: 0.0 },
            { name: 'Com Camarão', type: 'SINGLE', additionalPrice: 2.0 }
        ]
    );

    // 3. Temaki
    await createItemWithVariations(
        'Temaki',
        'Temaki de salmão ou camarão',
        20.0,
        'Comidas',
        [
            { name: 'De Salmão', type: 'SINGLE', additionalPrice: 0.0 },
            { name: 'De Camarão', type: 'SINGLE', additionalPrice: 0.0 },
        ]
    );

    // 5. Hot Ball
    await createItemWithVariations(
        'Hot Ball',
        'Bolinho de sushi (salmão ou camarão) com queijo empanado e frito',
        12.0,
        'Comidas',
        [
            { name: 'De Salmão', type: 'SINGLE', additionalPrice: 0.0 },
            { name: 'De Camarão', type: 'SINGLE', additionalPrice: 0.0 },
        ]
    );

    // 6. Hot Coreano
    await createItemWithVariations(
        'Hot Coreano',
        'Espeto de salmão ou camarão com queijo empanado com massa estilo coreano',
        20.0,
        'Comidas',
        [
            { name: 'De Salmão', type: 'SINGLE', additionalPrice: 0.0 },
            { name: 'De Camarão', type: 'SINGLE', additionalPrice: 0.0 },
        ]
    );

    // 7. Yakisoba
    await createItemWithVariations(
        'Yakisoba',
        'Yakisoba de carne e frango com ou sem camarão',
        22.0,
        'Comidas',
        [
            { name: 'Simples', type: 'SINGLE', additionalPrice: 0.0 },
            { name: 'Com Camarão', type: 'SINGLE', additionalPrice: 5.0 }
        ]
    );

    // 8. Hot Sushi
    await createItemWithVariations(
        'Hot Sushi',
        'Hot Sushi de salmão ou camarão',
        35.0,
        'Comidas',
        [
            { name: 'De Salmão', type: 'MULTIPLE', additionalPrice: 0.0 },
            { name: 'De Camarão', type: 'MULTIPLE', additionalPrice: 0.0 },
        ]
    );

    // 9. Pastel
    await createItemWithVariations(
        'Pastel',
        'Pastel de vento com diferentes recheios',
        6.0,
        'Comidas',
        [
            { name: 'Queijo', type: 'MULTIPLE', additionalPrice: 2.0 },
            { name: 'Frango', type: 'MULTIPLE', additionalPrice: 2.0 },
            { name: 'Carne', type: 'MULTIPLE', additionalPrice: 2.0 },
            { name: 'Calabresa', type: 'MULTIPLE', additionalPrice: 2.0 },
            { name: 'Catupiry', type: 'MULTIPLE', additionalPrice: 2.0 },
        ]
    );

    console.log('Seed do banco de dados concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
