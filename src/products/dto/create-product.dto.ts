import { ProductStatus } from '@prisma/client';
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsPositive,
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

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsString()
  @IsNotEmpty()
  sellerId!: string;
}
