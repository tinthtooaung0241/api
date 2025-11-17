import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { AuctionsGateway } from './auctions.gateway';
import { AuctionsScheduler } from './auctions.scheduler';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionsGateway, AuctionsScheduler],
  exports: [AuctionsService, AuctionsGateway],
})
export class AuctionsModule {}
