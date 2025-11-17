import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Product, ProductStatus, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data: {
        title: createProductDto.title,
        description: createProductDto.description,
        price: createProductDto.price,
        imageUrl: createProductDto.imageUrl || [],
        status: createProductDto.status || ProductStatus.ACTIVE,
        sellerId: createProductDto.sellerId,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: ProductStatus;
    sellerId?: string;
  }): Promise<Product[]> {
    const { skip, take, status, sellerId } = params || {};

    const where: Prisma.ProductWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    return this.prisma.product.findMany({
      skip,
      take,
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        auction: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        auction: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    // Check if product exists
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<Product> {
    // Check if product exists
    await this.findOne(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async count(params?: {
    status?: ProductStatus;
    sellerId?: string;
  }): Promise<number> {
    const { status, sellerId } = params || {};

    const where: Prisma.ProductWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    return this.prisma.product.count({ where });
  }
}
