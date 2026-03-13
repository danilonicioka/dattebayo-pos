import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando sincronização do banco de dados (ID Enforcement)...');

  console.log('0. Limpando variações existentes para evitar duplicatas...');
  await prisma.menuItemVariation.deleteMany();

  const menuItems = [
    { id: 1, name: "Tempurá", description: "Tempura de legumes com ou sem camarão", price: 10, category: "Comidas" },
    { id: 2, name: "Takoyaki", description: "Bolinho de com recheio de polvo", price: 23, category: "Comidas" },
    { id: 3, name: "Temaki", description: "Temaki de salmão ou camarão", price: 20, category: "Comidas" },
    { id: 4, name: "Gyoza", description: "Gyoza de carne bovina com legumes", price: 18, category: "Comidas" },
    { id: 5, name: "Hot Ball", description: "Bolinho de sushi (salmão ou camarão) com queijo empanado e frito", price: 12, category: "Comidas" },
    { id: 6, name: "Hot Coreano", description: "Espeto de salmão ou camarão com queijo empanado com massa estilo coreano", price: 20, category: "Comidas" },
    { id: 7, name: "Yakisoba", description: "Yakisoba de carne e frango com ou sem camarão", price: 22, category: "Comidas" },
    { id: 8, name: "Hot Sushi", description: "Hot Sushi de salmão ou camarão", price: 35, category: "Comidas" },
    { id: 9, name: "Pastel", description: "Pastel de vento com diferentes recheios", price: 6, category: "Comidas" },
    { id: 10, name: "Camarão Milanesa", description: "Camarão rosa empanado e frito", price: 0, category: "Comidas" },
    { id: 11, name: "Polvo no Espeto", description: "Polvo no espeto frito na chapa acompanhado de arroz", price: 20, category: "Comidas" },
    { id: 12, name: "Bubble", description: "Suco com bolinhas saborizadas (300 ml)", price: 15, category: "Bebidas" },
  ];

  const variations = [
    { id: 25, menuItemId: 1, name: "De Legumes", type: "SINGLE", additionalPrice: 0 },
    { id: 26, menuItemId: 1, name: "Com Camarão", type: "SINGLE", additionalPrice: 2 },
    { id: 3, menuItemId: 3, name: "De Salmão", type: "SINGLE", additionalPrice: 0 },
    { id: 4, menuItemId: 3, name: "De Camarão", type: "SINGLE", additionalPrice: 0 },
    { id: 5, menuItemId: 5, name: "De Salmão", type: "SINGLE", additionalPrice: 0 },
    { id: 6, menuItemId: 5, name: "De Camarão", type: "SINGLE", additionalPrice: 0 },
    { id: 7, menuItemId: 6, name: "De Salmão", type: "SINGLE", additionalPrice: 0 },
    { id: 8, menuItemId: 6, name: "De Camarão", type: "SINGLE", additionalPrice: 0 },
    { id: 9, menuItemId: 7, name: "Simples", type: "SINGLE", additionalPrice: 0 },
    { id: 10, menuItemId: 7, name: "Com Camarão", type: "SINGLE", additionalPrice: 5 },
    { id: 11, menuItemId: 8, name: "De Salmão", type: "MULTIPLE", additionalPrice: 0 },
    { id: 12, menuItemId: 8, name: "De Camarão", type: "MULTIPLE", additionalPrice: 0 },
    { id: 13, menuItemId: 9, name: "Queijo", type: "MULTIPLE", additionalPrice: 2 },
    { id: 14, menuItemId: 9, name: "Frango", type: "MULTIPLE", additionalPrice: 2 },
    { id: 15, menuItemId: 9, name: "Carne", type: "MULTIPLE", additionalPrice: 2 },
    { id: 16, menuItemId: 9, name: "Calabresa", type: "MULTIPLE", additionalPrice: 2 },
    { id: 17, menuItemId: 9, name: "Catupiry", type: "MULTIPLE", additionalPrice: 2 },
    { id: 18, menuItemId: 9, name: "Paraense (com camarão, jambu, queijo e catupiry)", type: "MULTIPLE", additionalPrice: 9 },
    { id: 19, menuItemId: 10, name: "Unidade", type: "SINGLE", additionalPrice: 6 },
    { id: 20, menuItemId: 10, name: "Porção com 5 unidades", type: "SINGLE", additionalPrice: 25 },
  ];

  console.log('1. Garantindo itens do menu...');
  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }

  console.log('2. Garantindo variações...');
  for (const v of variations) {
    await prisma.menuItemVariation.upsert({
      where: { id: v.id },
      update: v,
      create: v,
    });
  }

  console.log('3. Sincronizando sequências do banco (Postgres)...');
  try {
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"MenuItem"', 'id'), coalesce(max(id), 0) + 1, false) FROM "MenuItem";`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"MenuItemVariation"', 'id'), coalesce(max(id), 0) + 1, false) FROM "MenuItemVariation";`;
  } catch (e: any) {
    console.warn('Aviso: Não foi possível atualizar sequencias (pode ser esperado em SQLite):', e.message);
  }

  console.log('✅ Banco de dados sincronizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
