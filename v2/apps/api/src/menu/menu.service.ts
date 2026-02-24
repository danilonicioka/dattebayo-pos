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
        available: createMenuDto.available,
        stockQuantity: createMenuDto.stockQuantity,
      }
    });
  }

  findAll() {
    return this.prisma.menuItem.findMany();
  }

  findOne(id: number) {
    return this.prisma.menuItem.findUnique({
      where: { id },
      include: { variations: true }
    });
  }

  update(id: number, updateMenuDto: UpdateMenuDto) {
    return this.prisma.menuItem.update({
      where: { id },
      data: updateMenuDto as any
    });
  }

  remove(id: number) {
    return this.prisma.menuItem.delete({
      where: { id }
    });
  }
}
