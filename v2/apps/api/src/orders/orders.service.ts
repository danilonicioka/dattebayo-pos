import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

  async create(createOrderDto: CreateOrderDto) {
    // 1. Mapear itens para o formato do Prisma
    const mapped = createOrderDto.items.map(item => ({
      menuItemId: item.menuItemId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      specialInstructions: item.specialInstructions,
      variations: {
        create: item.variations?.map(variation => ({
          menuItemVariationId: variation.menuItemVariationId,
          name: variation.name,
          additionalPrice: variation.additionalPrice
        })) || []
      }
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
            create: mapped
          }
        },
        include: {
          items: {
            include: {
              variations: true,
              menuItem: true
            }
          }
        }
      });

      // Baixar estoque dos itens e variações
      for (const item of createOrderDto.items) {
        const menuItem = await tx.menuItem.findUnique({
          where: { id: item.menuItemId },
          include: { variations: true }
        });

        if (!menuItem) continue;

        const isMandatoryRadio = menuItem.variations.length > 1 && menuItem.variations[0].type === 'SINGLE';
        const isMandatoryMulti = menuItem.variations.length > 0 && menuItem.variations[0].type === 'MULTIPLE';
        const hasMandatoryVariations = isMandatoryRadio || isMandatoryMulti;

        let deductBaseStock = true;

        // Baixar estoque das variações se houver
        if (item.variations && item.variations.length > 0) {
          for (const vSelected of item.variations) {
            const menuVariation = await tx.menuItemVariation.findUnique({
              where: { id: vSelected.menuItemVariationId }
            });

            if (menuVariation && menuVariation.stockQuantity !== null) {
              const newVStock = Math.max(0, menuVariation.stockQuantity - item.quantity);
              await tx.menuItemVariation.update({
                where: { id: menuVariation.id },
                data: { stockQuantity: newVStock }
              });

              // Se a variação tem controle próprio e é obrigatória, 
              // consideramos que ela "é" o produto físico principal neste contexto.
              if (hasMandatoryVariations) {
                deductBaseStock = false;
              }
            }
          }
        }

        // Baixar estoque do item principal, a menos que ele tenha delegado 
        // o controle para a variação obrigatória.
        if (deductBaseStock && menuItem.stockQuantity !== null) {
          const newStock = Math.max(0, menuItem.stockQuantity - item.quantity);
          await tx.menuItem.update({
            where: { id: menuItem.id },
            data: { stockQuantity: newStock }
          });
        }
      }

      return order;
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { items: { include: { variations: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getSummary() {
    // Calculando inicio e fim do dia atual local
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        items: {
          include: {
            variations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let totalRevenue = 0;

    for (const order of orders) {
      let orderTotal = 0;
      for (const item of order.items) {
        let itemTotal = item.price;
        for (const v of item.variations) {
          itemTotal += v.additionalPrice;
        }
        orderTotal += (itemTotal * item.quantity);
      }
      totalRevenue += orderTotal;
    }

    const recentOrders = orders.slice(0, 10).map(order => {
      let total = 0;
      for (const item of order.items) {
        let itemTotal = item.price;
        for (const v of item.variations) {
          itemTotal += v.additionalPrice;
        }
        total += (itemTotal * item.quantity);
      }
      return {
        id: order.id,
        tableNumber: order.tableNumber,
        total,
        createdAt: order.createdAt,
        itemsCount: order.items.reduce((acc, curr) => acc + curr.quantity, 0)
      }
    });

    return {
      totalRevenue,
      totalOrders: orders.length,
      recentOrders
    };
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { variations: true, menuItem: true } } }
    });
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto as any
    });
  }

  remove(id: number) {
    return this.prisma.order.delete({
      where: { id }
    });
  }
}
