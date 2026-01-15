import { ApiProperty } from '@nestjs/swagger';

export class PriceDto {
  @ApiProperty() min!: number;
  @ApiProperty() currencyCode!: string;
}

export class ConvertedDto {
  @ApiProperty({ required: false }) minUsd?: number;
  @ApiProperty({ required: false }) maxUsd?: number;
  @ApiProperty({ required: false }) minNgn?: number;
  @ApiProperty({ required: false }) maxNgn?: number;
}

export class ProductDto {
  @ApiProperty({ type: PriceDto }) price!: PriceDto;
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
  @ApiProperty() minFaceValue!: number;
  @ApiProperty() maxFaceValue!: number;
  @ApiProperty({ required: false }) count?: number;
  @ApiProperty() modifiedDate!: Date;
  @ApiProperty({ required: false, type: ConvertedDto })
  converted?: ConvertedDto;
  @ApiProperty({ required: false, description: 'Percent override' })
  markupOverride?: number;
}

export class CategoryDto {
  @ApiProperty() name!: string;
  @ApiProperty({ required: false }) description?: string;
}

export class BrandDto {
  @ApiProperty({ required: false, description: 'MongoDB _id' })
  _id?: string;
  @ApiProperty() internalId!: string;
  @ApiProperty() name!: string;
  @ApiProperty() countryCode!: string;
  @ApiProperty() currencyCode!: string;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty({ required: false }) disclaimer?: string;
  @ApiProperty({ required: false }) redemptionInstructions?: string;
  @ApiProperty({ required: false }) terms?: string;
  @ApiProperty({ required: false }) logoUrl?: string;
  @ApiProperty() modifiedDate!: Date;
  @ApiProperty({ type: [ProductDto] }) products!: ProductDto[];
  @ApiProperty({ type: [CategoryDto] }) categories!: CategoryDto[];
  @ApiProperty({ required: false, description: 'Percent override' })
  markupOverride?: number;
}

export class BrandListResponseDto {
  @ApiProperty({ type: [BrandDto] }) items!: BrandDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
}

export class CategoryViewDto {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
  @ApiProperty({ required: false }) description?: string | null;
}

export class SyncResponseDto {
  @ApiProperty() processed!: number;
  @ApiProperty() errors!: number;
  @ApiProperty({ description: 'Duration in ms' }) duration!: number;
}
