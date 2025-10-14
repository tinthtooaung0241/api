import { ProductStatus } from '@prisma/client';
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsPositive,
  IsArray,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  price!: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrl?: string[];

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus = ProductStatus.ACTIVE;

  @IsString()
  @IsNotEmpty()
  sellerId!: string;
}
