import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

  create(createOrderDto: CreateOrderDto) {
    console.log('--- DENTRO DO SERVICE ---');
    console.log('Primeiro item name:', createOrderDto.items[0]?.name);

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
    console.log('Mapeado para Prisma:', JSON.stringify(mapped, null, 2));

    return this.prisma.order.create({
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
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { items: { include: { variations: true } } },
      orderBy: { createdAt: 'desc' }
    });
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
