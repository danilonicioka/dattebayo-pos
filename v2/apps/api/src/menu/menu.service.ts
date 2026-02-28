import { Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) { }

  create(createMenuDto: CreateMenuDto) {
    return this.prisma.menuItem.create({
      data: {
        name: createMenuDto.name,
        price: createMenuDto.price,
        category: createMenuDto.category,
        description: createMenuDto.description,
        available: createMenuDto.available ?? true,
        stockQuantity: createMenuDto.stockQuantity,
        manualPrice: createMenuDto.manualPrice,
        manualPriceEnabled: createMenuDto.manualPriceEnabled ?? false,
        applyMarkup: createMenuDto.applyMarkup ?? true,
        variations: createMenuDto.variations?.length ? {
          create: createMenuDto.variations.map((v: any) => ({
            name: v.name,
            type: v.type,
            additionalPrice: v.additionalPrice,
            stockQuantity: v.stockQuantity,
          }))
        } : undefined,
      }
    });
  }

  findAll() {
    return this.prisma.menuItem.findMany({
      include: { variations: true }
    });
  }

  findOne(id: number) {
    return this.prisma.menuItem.findUnique({
      where: { id },
      include: { variations: true }
    });
  }

  async update(id: number, updateMenuDto: UpdateMenuDto) {
    const { variations, id: _id, ...data } = updateMenuDto as any;

    const updateData: any = {
      ...data
    };

    if (variations) {
      await this.prisma.menuItemVariation.deleteMany({
        where: { menuItemId: id }
      });
      updateData.variations = {
        create: variations.map((v: any) => ({
          name: v.name,
          type: v.type,
          additionalPrice: v.additionalPrice,
          stockQuantity: v.stockQuantity,
        })),
      };
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: updateData
    });
  }

  remove(id: number) {
    return this.prisma.menuItem.delete({
      where: { id }
    });
  }
}
