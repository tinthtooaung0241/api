import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateBidDto {
  @IsString()
  @IsNotEmpty()
  auctionId!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;
}
