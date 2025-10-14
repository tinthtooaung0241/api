import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  ParseBoolPipe,
  Request,
} from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto, UpdateAuctionDto } from './dto';
import { AllowAnonymous, UserSession } from '@thallesp/nestjs-better-auth';
import { Session } from '@thallesp/nestjs-better-auth';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Post()
  create(
    @Body(ValidationPipe) createAuctionDto: CreateAuctionDto,
    @Session() session: UserSession,
  ) {
    const userId = session.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.auctionsService.create(createAuctionDto, userId);
  }

  @Get()
  @AllowAnonymous()
  findAll(
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('search') search?: string,
    @Query('isLive', new ParseBoolPipe({ optional: true })) isLive?: boolean,
  ) {
    return this.auctionsService.findAll({
      skip,
      take,
      search,
      isLive,
    });
  }

  @Get('count')
  @AllowAnonymous()
  count(
    @Query('isLive', new ParseBoolPipe({ optional: true })) isLive?: boolean,
  ) {
    return this.auctionsService.count({ isLive });
  }

  @Get(':id')
  @AllowAnonymous()
  findOne(@Param('id') id: string) {
    return this.auctionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateAuctionDto: UpdateAuctionDto,
    @Session() session: UserSession,
  ) {
    const userId = session.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.auctionsService.update(id, updateAuctionDto, userId);
  }

  @Post(':id/end')
  end(@Param('id') id: string, @Session() session: UserSession) {
    const userId = session.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.auctionsService.end(id, userId);
  }
}
