import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Auction, Prisma, ProductStatus } from '@prisma/client';

@Injectable()
export class AuctionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createAuctionDto: CreateAuctionDto,
    userId: string,
  ): Promise<Auction> {
    // Validate product exists and belongs to user
    const product = await this.prisma.product.findUnique({
      where: { id: createAuctionDto.productId },
      include: { auction: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.sellerId !== userId) {
      throw new ForbiddenException(
        'You can only create auctions for your own products',
      );
    }

    // Only block if product has an active auction
    if (product.auction && product.auction.isLive) {
      throw new BadRequestException('Product already has an active auction');
    }

    // Validate dates
    const now = new Date();
    const startTime = new Date(createAuctionDto.startTime);
    const endTime = new Date(createAuctionDto.endTime);

    if (startTime < now) {
      throw new BadRequestException('Start time must be in the future');
    }

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // If product has an ended auction, delete bids first, then the auction
    // (due to unique constraint on productId and foreign key constraints from bids)
    if (product.auction && !product.auction.isLive) {
      await this.prisma.$transaction([
        // Delete all bids associated with the ended auction
        this.prisma.bid.deleteMany({
          where: { auctionId: product.auction.id },
        }),
        // Then delete the ended auction
        this.prisma.auction.delete({
          where: { id: product.auction.id },
        }),
      ]);
    }

    // Create auction
    return this.prisma.auction.create({
      data: {
        productId: createAuctionDto.productId,
        startPrice: createAuctionDto.startPrice,
        currentPrice: createAuctionDto.startPrice,
        startTime,
        endTime,
        isLive: true,
      },
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
        bids: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            amount: 'desc',
          },
        },
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    search?: string;
    isLive?: boolean;
  }) {
    const { skip, take, search, isLive } = params || {};

    const where: Prisma.AuctionWhereInput = {};

    if (isLive !== undefined) {
      where.isLive = isLive;
      // Only show live auctions that haven't ended
      if (isLive) {
        where.endTime = {
          gt: new Date(),
        };
      }
    }

    if (search) {
      where.product = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    return this.prisma.auction.findMany({
      skip,
      take,
      where,
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
        bids: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            amount: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        endTime: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        bids: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            amount: 'desc',
          },
        },
      },
    });

    if (!auction) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }

    return auction;
  }

  async update(
    id: string,
    updateAuctionDto: UpdateAuctionDto,
    userId: string,
  ): Promise<Auction> {
    const auction = await this.findOne(id);

    // Check ownership
    if (auction.product.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own auctions');
    }

    // Check if auction has started
    const now = new Date();
    if (auction.startTime <= now) {
      throw new BadRequestException(
        'Cannot update auction that has already started',
      );
    }

    // Validate dates if provided
    if (updateAuctionDto.startTime || updateAuctionDto.endTime) {
      const startTime = updateAuctionDto.startTime
        ? new Date(updateAuctionDto.startTime)
        : auction.startTime;
      const endTime = updateAuctionDto.endTime
        ? new Date(updateAuctionDto.endTime)
        : auction.endTime;

      if (startTime < now) {
        throw new BadRequestException('Start time must be in the future');
      }

      if (endTime <= startTime) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    return this.prisma.auction.update({
      where: { id },
      data: {
        ...updateAuctionDto,
        startTime: updateAuctionDto.startTime
          ? new Date(updateAuctionDto.startTime)
          : undefined,
        endTime: updateAuctionDto.endTime
          ? new Date(updateAuctionDto.endTime)
          : undefined,
      },
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
        bids: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            amount: 'desc',
          },
        },
      },
    });
  }

  async end(id: string, userId?: string): Promise<Auction> {
    const auction = await this.findOne(id);

    // Check ownership if userId provided (manual end)
    if (userId && auction.product.sellerId !== userId) {
      throw new ForbiddenException('You can only end your own auctions');
    }

    if (!auction.isLive) {
      throw new BadRequestException('Auction has already ended');
    }

    // Get highest bid
    const highestBid = auction.bids[0];

    // End auction
    const updatedAuction = await this.prisma.auction.update({
      where: { id },
      data: {
        isLive: false,
      },
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
        bids: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            amount: 'desc',
          },
        },
      },
    });

    // Create order if there was a highest bidder
    if (highestBid) {
      await this.prisma.order.create({
        data: {
          buyerId: highestBid.userId,
          productId: auction.productId,
          totalPrice: highestBid.amount,
        },
      });

      // Mark product as sold
      await this.prisma.product.update({
        where: { id: auction.productId },
        data: {
          status: ProductStatus.SOLD,
        },
      });
    }

    return updatedAuction;
  }

  validateAuctionActive(auction: Auction): boolean {
    const now = new Date();
    return auction.isLive && auction.startTime <= now && auction.endTime > now;
  }

  async count(params?: { isLive?: boolean }): Promise<number> {
    const { isLive } = params || {};

    const where: Prisma.AuctionWhereInput = {};

    if (isLive !== undefined) {
      where.isLive = isLive;
      if (isLive) {
        where.endTime = {
          gt: new Date(),
        };
      }
    }

    return this.prisma.auction.count({ where });
  }
}
