import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(
    id: string,
    data: { name?: string; image?: string },
  ): Promise<Partial<User>> {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });
  }

  async getStats(id: string) {
    await this.findOne(id);

    const [productsListed, productsSold, totalBids, totalOrders] =
      await Promise.all([
        // Total products listed
        this.prisma.product.count({
          where: { sellerId: id },
        }),
        // Total products sold
        this.prisma.product.count({
          where: {
            sellerId: id,
            status: 'SOLD',
          },
        }),
        // Total bids made
        this.prisma.bid.count({
          where: { userId: id },
        }),
        // Total orders (purchases)
        this.prisma.order.count({
          where: { buyerId: id },
        }),
      ]);

    return {
      productsListed,
      productsSold,
      totalBids,
      totalOrders,
    };
  }
}
