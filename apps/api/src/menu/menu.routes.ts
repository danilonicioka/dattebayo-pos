import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

export function menuRoutes(prisma: PrismaClient) {
  const app = new Hono();

  // POST /menu
  app.post('/', async (c) => {
    const dto = await c.req.json();
    const item = await prisma.menuItem.create({
      data: {
        name: dto.name,
        price: dto.price,
        category: dto.category,
        description: dto.description,
        available: dto.available ?? true,
        stockQuantity: dto.stockQuantity,
        manualPrice: dto.manualPrice,
        manualPriceEnabled: dto.manualPriceEnabled ?? false,
        applyMarkup: dto.applyMarkup ?? true,
        variations: dto.variations?.length
          ? {
              create: dto.variations.map((v: any) => ({
                name: v.name,
                type: v.type,
                additionalPrice: v.additionalPrice,
                stockQuantity: v.stockQuantity,
              })),
            }
          : undefined,
      },
    });
    return c.json(item, 201);
  });

  // GET /menu
  app.get('/', async (c) => {
    const items = await prisma.menuItem.findMany({
      include: { variations: true },
      orderBy: { id: 'asc' }
    });
    return c.json(items);
  });

  // GET /menu/public — must be before :id
  app.get('/public', async (c) => {
    const items = await prisma.menuItem.findMany({
      where: {
        available: true,
        OR: [{ stockQuantity: null }, { stockQuantity: { gt: 0 } }],
      },
      include: { variations: true },
      orderBy: { id: 'asc' }
    });
    return c.json(items);
  });

  // GET /menu/:id
  app.get('/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: { variations: true },
    });
    if (!item) return c.json({ message: 'Not found' }, 404);
    return c.json(item);
  });

  // PATCH /menu/:id
  app.patch('/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const dto = await c.req.json() as any;
    const { variations, id: _id, ...data } = dto;
    const updateData: any = { ...data };

    if (variations) {
      await prisma.menuItemVariation.deleteMany({ where: { menuItemId: id } });
      updateData.variations = {
        create: variations.map((v: any) => ({
          name: v.name,
          type: v.type,
          additionalPrice: v.additionalPrice,
          stockQuantity: v.stockQuantity,
        })),
      };
    }

    console.log(`[UPDATE MENU] ID: ${id} Payload:`, dto);
    const item = await prisma.menuItem.update({ where: { id }, data: updateData });
    return c.json(item);
  });

  // PUT /menu/:id (alias for PATCH — used by admin edit form)
  app.put('/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const dto = await c.req.json() as any;
    const { variations, id: _id, ...data } = dto;
    const updateData: any = { ...data };

    if (variations) {
      await prisma.menuItemVariation.deleteMany({ where: { menuItemId: id } });
      updateData.variations = {
        create: variations.map((v: any) => ({
          name: v.name,
          type: v.type,
          additionalPrice: v.additionalPrice,
          stockQuantity: v.stockQuantity,
        })),
      };
    }

    const item = await prisma.menuItem.update({ where: { id }, data: updateData });
    return c.json(item);
  });

  // DELETE /menu/:id
  app.delete('/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const item = await prisma.menuItem.delete({ where: { id } });
    return c.json(item);
  });

  return app;
}
