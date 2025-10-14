import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Order, ProductStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(
    createOrderDto: CreateOrderDto,
    buyerId: string,
  ): Promise<Order> {
    // Validate product exists and is available
    const product = await this.prisma.product.findUnique({
      where: { id: createOrderDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status === ProductStatus.SOLD) {
      throw new BadRequestException('Product is already sold');
    }

    // Create order and mark product as sold in transaction
    const order = await this.prisma.order.create({
      data: {
        buyerId,
        productId: createOrderDto.productId,
        totalPrice: createOrderDto.totalPrice,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Mark product as sold
    await this.prisma.product.update({
      where: { id: createOrderDto.productId },
      data: { status: ProductStatus.SOLD },
    });

    return order;
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { buyerId: userId },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findBySeller(sellerId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        product: {
          sellerId,
        },
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Only buyer or seller can view order
    if (order.buyerId !== userId && order.product.sellerId !== userId) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }
}
