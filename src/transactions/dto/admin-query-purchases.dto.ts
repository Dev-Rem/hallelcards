import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsMongoId, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionStatus } from '../schemas/transaction.schema';

export class AdminQueryPurchasesDto {
  @ApiProperty({ required: false, enum: TransactionStatus })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  cardId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ required: false, description: 'ISO date' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiProperty({ required: false, description: 'ISO date' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}


