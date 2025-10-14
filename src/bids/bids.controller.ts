import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  create(
    @Body(ValidationPipe) createBidDto: CreateBidDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
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
  findMyBids(@Request() req: any) {
    const userId = req.user?.id;
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
