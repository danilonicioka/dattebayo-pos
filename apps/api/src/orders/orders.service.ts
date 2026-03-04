import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

  async create(createOrderDto: CreateOrderDto) {
    // 1. Mapear itens para o formato do Prisma
    const mapped = createOrderDto.items.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      specialInstructions: item.specialInstructions,
      variations: {
        create:
          item.variations?.map((variation) => ({
            menuItemVariationId: variation.menuItemVariationId,
            name: variation.name,
            additionalPrice: variation.additionalPrice,
          })) || [],
      },
    }));

    // 2. Executar criação e baixa de estoque em uma transação
    return this.prisma.$transaction(async (tx) => {
      // Criar o pedido
      const order = await tx.order.create({
        data: {
          tableNumber: createOrderDto.tableNumber,
          notes: createOrderDto.notes,
          status: 'PENDING',
          items: {
            create: mapped,
          },
        },
        include: {
          items: {
            include: {
              variations: true,
              menuItem: true,
            },
          },
        },
      });

      // Baixar estoque dos itens e variações
      for (const item of createOrderDto.items) {
        const menuItem = await tx.menuItem.findUnique({
          where: { id: item.menuItemId },
          include: { variations: true },
        });

        if (!menuItem) continue;

        const hasVariationsInDb = menuItem.variations.length > 0;
        const hasVariationsInOrder = item.variations && item.variations.length > 0;

        if (hasVariationsInDb && !hasVariationsInOrder) {
          throw new BadRequestException(
            `O item ${menuItem.name} requer pelo menos uma variação.`,
          );
        }

        // Se tem variações no DB, o estoque do produto pai NÃO é gerenciado/deduzido
        let deductBaseStock = !hasVariationsInDb;

        // Baixar estoque das variações se houver no pedido
        if (item.variations && item.variations.length > 0) {
          for (const vSelected of item.variations) {
            const menuVariation = await tx.menuItemVariation.findUnique({
              where: { id: vSelected.menuItemVariationId },
            });

            if (menuVariation && menuVariation.stockQuantity !== null) {
              const newVStock = Math.max(
                0,
                menuVariation.stockQuantity - item.quantity,
              );
              await tx.menuItemVariation.update({
                where: { id: menuVariation.id },
                data: { stockQuantity: newVStock },
              });
            }
          }
        }

        // Baixar estoque do item principal, a menos que ele tenha delegado
        // o controle para a variação obrigatória.
        if (deductBaseStock && menuItem.stockQuantity !== null) {
          const newStock = Math.max(0, menuItem.stockQuantity - item.quantity);
          await tx.menuItem.update({
            where: { id: menuItem.id },
            data: { stockQuantity: newStock },
          });
        }
      }

      return order;
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { items: { include: { variations: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSummary() {
    // Buscar TODOS os pedidos entregues para faturamento e ticket médio (Sem filtro de data)
    const deliveredOrders = await this.prisma.order.findMany({
      where: {
        status: 'DELIVERED',
      },
      include: {
        items: {
          include: {
            menuItem: true,
            variations: true,
          },
        },
      },
    });

    // Buscar contagem de pedidos em aberto (PENDING, PREPARING, READY)
    const openOrdersCount = await this.prisma.order.count({
      where: {
        status: {
          in: ['PENDING', 'PREPARING', 'READY'],
        },
      },
    });

    let totalRevenue = 0;
    const productStatsMap = new Map<string, { itemsSold: number; revenue: number }>();

    for (const order of deliveredOrders) {
      let orderTotal = 0;
      for (const item of order.items) {
        let itemUnitPrice = item.price;
        for (const v of item.variations) {
          itemUnitPrice += v.additionalPrice;
        }

        const itemLineTotal = itemUnitPrice * item.quantity;
        orderTotal += itemLineTotal;

        // Stats por Produto (Agrupando pelo nome para pegar variações se houver)
        const productName = item.name;
        const currentStats = productStatsMap.get(productName) || { itemsSold: 0, revenue: 0 };
        currentStats.itemsSold += item.quantity;
        currentStats.revenue += itemLineTotal;
        productStatsMap.set(productName, currentStats);
      }
      totalRevenue += orderTotal;
    }

    const completedOrdersCount = deliveredOrders.length;
    const averageOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;

    return {
      totalRevenue,
      openOrdersCount,
      completedOrdersCount,
      totalOrders: completedOrdersCount, // Alias para compatibilidade com App Mobile
      averageOrderValue,
      productStats: Array.from(productStatsMap.entries()).map(([name, stats]) => ({
        name,
        itemsSold: stats.itemsSold,
        revenue: stats.revenue,
      })).sort((a, b) => b.revenue - a.revenue),
    };
  }

  async clearCashier() {
    return this.prisma.order.deleteMany({
      where: { status: 'DELIVERED' },
    });
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { variations: true, menuItem: true } } },
    });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    if (updateOrderDto.status === 'CANCELLED') {
      return this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id },
          include: {
            items: {
              include: { variations: true },
            },
          },
        });

        if (!order) throw new Error('Order not found');

        if (order.status !== 'CANCELLED') {
          // Devolver estoque
          for (const item of order.items) {
            if (!item.menuItemId) continue;

            const menuItem = await tx.menuItem.findUnique({
              where: { id: item.menuItemId },
              include: { variations: true },
            });

            if (!menuItem) continue;

            const hasVariationsInDb = menuItem.variations.length > 0;
            const hasVariationsInOrder = item.variations && item.variations.length > 0;

            // Se tem variações no DB, o estoque do produto pai NÃO é estornado
            let deductBaseStock = !hasVariationsInDb;

            // Retornar estoque das variações se houver no pedido
            if (item.variations && item.variations.length > 0) {
              for (const vSelected of item.variations) {
                const menuVariation = await tx.menuItemVariation.findUnique({
                  where: { id: vSelected.menuItemVariationId },
                });

                if (menuVariation && menuVariation.stockQuantity !== null) {
                  const newVStock = menuVariation.stockQuantity + item.quantity;
                  await tx.menuItemVariation.update({
                    where: { id: menuVariation.id },
                    data: { stockQuantity: newVStock },
                  });
                }
              }
            }

            // Retornar estoque do item principal, a menos que controle seja da variação
            if (deductBaseStock && menuItem.stockQuantity !== null) {
              const newStock = menuItem.stockQuantity + item.quantity;
              await tx.menuItem.update({
                where: { id: menuItem.id },
                data: { stockQuantity: newStock },
              });
            }
          }
        }

        return tx.order.update({
          where: { id },
          data: updateOrderDto as any,
        });
      });
    }

    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto as any,
    });
  }

  remove(id: number) {
    return this.prisma.order.delete({
      where: { id },
    });
  }
}
