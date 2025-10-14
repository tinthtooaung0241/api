import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AuctionsService } from './auctions.service';
import { AuctionsGateway } from './auctions.gateway';

@Injectable()
export class AuctionsScheduler {
  private readonly logger = new Logger(AuctionsScheduler.name);

  constructor(
    private prisma: PrismaService,
    private auctionsService: AuctionsService,
    private auctionsGateway: AuctionsGateway,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkExpiredAuctions() {
    this.logger.log('Checking for expired auctions...');

    try {
      const now = new Date();

      // Find auctions that have ended but are still marked as live
      const expiredAuctions = await this.prisma.auction.findMany({
        where: {
          isLive: true,
          endTime: {
            lte: now,
          },
        },
        include: {
          product: true,
          bids: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              amount: 'desc',
            },
            take: 1,
          },
        },
      });

      if (expiredAuctions.length === 0) {
        this.logger.log('No expired auctions found');
        return;
      }

      this.logger.log(`Found ${expiredAuctions.length} expired auction(s)`);

      // End each expired auction
      for (const auction of expiredAuctions) {
        try {
          await this.auctionsService.end(auction.id);

          // Broadcast auction end via WebSocket
          const winner = auction.bids[0];
          this.auctionsGateway.broadcastAuctionEnd(auction.id, winner);

          this.logger.log(
            `Ended auction ${auction.id} for product ${auction.product.title}`,
          );
        } catch (error) {
          this.logger.error(`Failed to end auction ${auction.id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Error checking expired auctions:', error);
    }
  }
}
