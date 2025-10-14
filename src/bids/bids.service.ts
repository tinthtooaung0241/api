import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Bid } from '@prisma/client';
import { AuctionsService } from '../auctions/auctions.service';
import { AuctionsGateway } from '../auctions/auctions.gateway';

@Injectable()
export class BidsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AuctionsService))
    private auctionsService: AuctionsService,
    @Inject(forwardRef(() => AuctionsGateway))
    private auctionsGateway: AuctionsGateway,
  ) {}

  async create(createBidDto: CreateBidDto, userId: string): Promise<Bid> {
    // Get auction with product and seller info
    const auction = await this.auctionsService.findOne(createBidDto.auctionId);

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    // Prevent seller from bidding on their own auction
    if (auction.product.sellerId === userId) {
      throw new ForbiddenException('You cannot bid on your own auction');
    }

    // Check if auction is active
    if (!this.auctionsService.validateAuctionActive(auction)) {
      throw new BadRequestException('Auction is not active');
    }

    // Validate bid amount
    if (createBidDto.amount <= auction.currentPrice) {
      throw new BadRequestException(
        `Bid must be higher than current price: ${auction.currentPrice}`,
      );
    }

    // Create bid and update auction in a transaction
    const [bid] = await this.prisma.$transaction([
      this.prisma.bid.create({
        data: {
          auctionId: createBidDto.auctionId,
          userId,
          amount: createBidDto.amount,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          auction: {
            include: {
              product: true,
            },
          },
        },
      }),
      this.prisma.auction.update({
        where: { id: createBidDto.auctionId },
        data: {
          currentPrice: createBidDto.amount,
        },
      }),
    ]);

    // Broadcast new bid via WebSocket
    this.auctionsGateway.broadcastNewBid(createBidDto.auctionId, {
      id: bid.id,
      amount: bid.amount,
      createdAt: bid.createdAt,
      user: bid.user,
    });

    // Broadcast price update
    this.auctionsGateway.broadcastPriceUpdate(
      createBidDto.auctionId,
      bid.amount,
    );

    return bid;
  }

  async findByAuction(auctionId: string): Promise<Bid[]> {
    return this.prisma.bid.findMany({
      where: { auctionId },
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
    });
  }

  async findByUser(userId: string): Promise<Bid[]> {
    return this.prisma.bid.findMany({
      where: { userId },
      include: {
        auction: {
          include: {
            product: {
              include: {
                seller: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
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

  async getHighestBid(auctionId: string): Promise<Bid | null> {
    return this.prisma.bid.findFirst({
      where: { auctionId },
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
    });
  }
}
