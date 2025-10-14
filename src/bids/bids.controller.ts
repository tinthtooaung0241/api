import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ValidationPipe,
} from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto';
import {
  AllowAnonymous,
  UserSession,
  Session,
} from '@thallesp/nestjs-better-auth';

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  create(
    @Body(ValidationPipe) createBidDto: CreateBidDto,
    @Session() session: UserSession,
  ) {
    const userId = session.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.bidsService.create(createBidDto, userId);
  }

  @Get('auction/:auctionId')
  @AllowAnonymous()
  findByAuction(@Param('auctionId') auctionId: string) {
    return this.bidsService.findByAuction(auctionId);
  }

  @Get('my-bids')
  findMyBids(@Session() session: UserSession) {
    const userId = session.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.bidsService.findByUser(userId);
  }

  @Get('highest/:auctionId')
  @AllowAnonymous()
  getHighestBid(@Param('auctionId') auctionId: string) {
    return this.bidsService.getHighestBid(auctionId);
  }
}
