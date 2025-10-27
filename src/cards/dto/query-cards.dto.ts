import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';

export class QueryCardsDto {
  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty()
  @IsOptional()
  @IsString()
  search?: string; // search by name

  @ApiProperty()
  @IsOptional()
  @IsString()
  category?: string; // filter by category name

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minPrice?: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxPrice?: number;

  @ApiProperty({ required: false, enum: ['USD', 'NGN'], default: 'USD' })
  @IsOptional()
  @IsString()
  priceCurrency?: 'USD' | 'NGN' = 'USD';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currencyCode?: string; // brand currencyCode

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  countryCode?: string; // brand countryCode

  @ApiProperty({ required: false, enum: ['name', 'price', 'modifiedDate'], default: 'name' })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'price' | 'modifiedDate' = 'name';

  @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsString()
  sortDir?: 'asc' | 'desc' = 'asc';

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean; // products.count > 0
}
