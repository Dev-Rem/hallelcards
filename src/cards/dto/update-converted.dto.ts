import { IsNumber } from 'class-validator';

export class UpdateConvertedDto {
  @IsNumber()
  minUsd: number;

  @IsNumber()
  maxUsd: number;

  @IsNumber()
  minNgn: number;

  @IsNumber()
  maxNgn: number;
}
