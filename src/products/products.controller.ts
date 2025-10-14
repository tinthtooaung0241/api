import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductStatus } from '@prisma/client';
import {
  AllowAnonymous,
  UserSession,
  Session,
} from '@thallesp/nestjs-better-auth';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @Body(ValidationPipe) createProductDto: CreateProductDto,
    @Session() session: UserSession,
  ) {
    const userId = session.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    // Override sellerId with authenticated user's ID
    createProductDto.sellerId = userId;
    return this.productsService.create(createProductDto);
  }

  //allow anonymous get all products
  @Get()
  @AllowAnonymous()
  findAll(
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('status') status?: ProductStatus,
    @Query('sellerId') sellerId?: string,
  ) {
    return this.productsService.findAll({
      skip,
      take,
      status,
      sellerId,
    });
  }

  @AllowAnonymous()
  @Get('count')
  count(
    @Query('status') status?: ProductStatus,
    @Query('sellerId') sellerId?: string,
  ) {
    return this.productsService.count({ status, sellerId });
  }

  @AllowAnonymous()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
