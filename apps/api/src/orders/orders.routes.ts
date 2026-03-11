import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { io } from '../main';

export function ordersRoutes(prisma: PrismaClient) {
  const app = new Hono();

  // POST /orders — create order with inventory deduction
  app.post('/', async (c) => {
    const body = await c.req.json();
    console.log('PAYLOAD RECEBIDO NO BACKEND:', JSON.stringify(body, null, 2));

    const mapped = body.items.map((item: any) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      specialInstructions: item.specialInstructions,
      variations: {
        create:
          item.variations?.map((v: any) => ({
            menuItemVariationId: v.menuItemVariationId,
            name: v.name,
            additionalPrice: v.additionalPrice,
          })) || [],
      },
    }));

    try {
      const order = await prisma.$transaction(async (tx) => {
        const orderData = await tx.order.create({
          data: {
            tableNumber: body.tableNumber,
            notes: body.notes,
            status: 'PENDING',
            items: { create: mapped },
          },
          include: {
            items: {
              include: { variations: true, menuItem: true },
            },
          },
        });

        for (const item of body.items) {
          const menuItem = await tx.menuItem.findUnique({
            where: { id: item.menuItemId },
            include: { variations: true },
          });
          if (!menuItem) continue;

          const hasVariationsInDb = menuItem.variations.length > 0;
          const hasVariationsInOrder = item.variations && item.variations.length > 0;

          if (hasVariationsInDb && !hasVariationsInOrder) {
            throw new Error(`O item ${menuItem.name} requer pelo menos uma variação.`);
          }

          const deductBaseStock = !hasVariationsInDb;

          if (item.variations && item.variations.length > 0) {
            for (const vSelected of item.variations) {
              const menuVariation = await tx.menuItemVariation.findUnique({
                where: { id: vSelected.menuItemVariationId },
              });
              if (menuVariation && menuVariation.stockQuantity !== null) {
                const newVStock = Math.max(0, menuVariation.stockQuantity - item.quantity);
                await tx.menuItemVariation.update({
                  where: { id: menuVariation.id },
                  data: { stockQuantity: newVStock },
                });
              }
            }
          }

          if (deductBaseStock && menuItem.stockQuantity !== null) {
            const newStock = Math.max(0, menuItem.stockQuantity - item.quantity);
            await tx.menuItem.update({
              where: { id: menuItem.id },
              data: { stockQuantity: newStock },
            });
          }
        }

        return orderData;
      });

      io.emit('order_created', order);
      return c.json(order, 201);
    } catch (err: any) {
      return c.json({ message: err.message }, 400);
    }
  });

  // GET /orders
  app.get('/', async (c) => {
    const orders = await prisma.order.findMany({
      include: { items: { include: { variations: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return c.json(orders);
  });

  // GET /orders/summary  — must be before :id
  app.get('/summary', async (c) => {
    const deliveredOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      include: { items: { include: { menuItem: true, variations: true } } },
    });

    const openOrdersCount = await prisma.order.count({
      where: { status: { in: ['PENDING', 'PREPARING', 'READY'] } },
    });

    let totalRevenue = 0;
    const productStatsMap = new Map<string, { itemsSold: number; revenue: number }>();

    for (const order of deliveredOrders) {
      for (const item of order.items) {
        let itemUnitPrice = item.price;
        for (const v of item.variations) {
          itemUnitPrice += v.additionalPrice;
        }
        const lineTotal = itemUnitPrice * item.quantity;
        totalRevenue += lineTotal;

        const cur = productStatsMap.get(item.name) || { itemsSold: 0, revenue: 0 };
        cur.itemsSold += item.quantity;
        cur.revenue += lineTotal;
        productStatsMap.set(item.name, cur);
      }
    }

    const completedOrdersCount = deliveredOrders.length;
    const averageOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;

    return c.json({
      totalRevenue,
      openOrdersCount,
      completedOrdersCount,
      totalOrders: completedOrdersCount,
      averageOrderValue,
      productStats: Array.from(productStatsMap.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenue - a.revenue),
    });
  });

  // POST /orders/clear
  app.post('/clear', async (c) => {
    const result = await prisma.order.deleteMany({ where: { status: 'COMPLETED' } });
    return c.json(result);
  });

  // GET /orders/:id
  app.get('/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { variations: true, menuItem: true } } },
    });
    if (!order) return c.json({ message: 'Order not found' }, 404);
    return c.json(order);
  });

  // PATCH /orders/:id
  app.patch('/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const updateData = await c.req.json();

    try {
      const updatedOrder =
        updateData.status === 'CANCELLED'
          ? await prisma.$transaction(async (tx) => {
              const order = await tx.order.findUnique({
                where: { id },
                include: { items: { include: { variations: true } } },
              });
              if (!order) throw new Error('Order not found');

              if (order.status !== 'CANCELLED') {
                for (const item of order.items) {
                  if (!item.menuItemId) continue;
                  const menuItem = await tx.menuItem.findUnique({
                    where: { id: item.menuItemId },
                    include: { variations: true },
                  });
                  if (!menuItem) continue;

                  const hasVariationsInDb = menuItem.variations.length > 0;
                  const deductBaseStock = !hasVariationsInDb;

                  if (item.variations && item.variations.length > 0) {
                    for (const vSelected of item.variations) {
                      const menuVariation = await tx.menuItemVariation.findUnique({
                        where: { id: vSelected.menuItemVariationId },
                      });
                      if (menuVariation && menuVariation.stockQuantity !== null) {
                        await tx.menuItemVariation.update({
                          where: { id: menuVariation.id },
                          data: { stockQuantity: menuVariation.stockQuantity + item.quantity },
                        });
                      }
                    }
                  }

                  if (deductBaseStock && menuItem.stockQuantity !== null) {
                    await tx.menuItem.update({
                      where: { id: menuItem.id },
                      data: { stockQuantity: menuItem.stockQuantity + item.quantity },
                    });
                  }
                }
              }

              return tx.order.update({ where: { id }, data: updateData });
            })
          : await prisma.order.update({ where: { id }, data: updateData });

      io.emit('order_updated', updatedOrder);
      return c.json(updatedOrder);
    } catch (err: any) {
      return c.json({ message: err.message }, 400);
    }
  });

  // DELETE /orders/:id
  app.delete('/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const deleted = await prisma.order.delete({ where: { id } });
    return c.json(deleted);
  });

  return app;
}
