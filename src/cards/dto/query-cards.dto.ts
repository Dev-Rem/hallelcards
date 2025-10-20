import { IsInt, IsOptional, IsString, Min } from 'class-validator';
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
}
