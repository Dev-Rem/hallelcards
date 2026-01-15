import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminCardsService } from './admin-cards.service';
import { QueryCardsDto } from './dto/query-cards.dto';
import { Roles } from '../common/roles.decorator';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  BrandDto,
  BrandListResponseDto,
  SyncResponseDto,
} from './dto/cards-responses.dto';

@ApiTags('admin-cards')
@ApiBearerAuth('access-token')
@Controller('admin/cards')
@UseGuards(AdminAuthGuard, RolesGuard)
@Roles('admin')
export class AdminCardsController {
  constructor(private readonly adminCardsService: AdminCardsService) {}

  @Get()
  @ApiOperation({ summary: 'Admin list brands with controls' })
  @ApiOkResponse({
    description: 'Paginated brand list',
    type: BrandListResponseDto,
  })
  getAll(@Query() query: QueryCardsDto) {
    return this.adminCardsService.getAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Admin get brand by id' })
  @ApiParam({ name: 'id', description: 'Brand MongoDB id' })
  @ApiOkResponse({ description: 'Brand detail', type: BrandDto })
  getById(@Param('id') id: string) {
    return this.adminCardsService.getById(id);
  }

  @Patch(':id/converted')
  @ApiOperation({ summary: 'Bulk update product converted values for a brand' })
  @ApiParam({ name: 'id', description: 'Brand MongoDB id' })
  @ApiOkResponse({ description: 'Updated brand', type: BrandDto })
  updateConverted(@Param('id') id: string, @Body('converted') converted: any) {
    return this.adminCardsService.updateConverted(id, converted);
  }

  @Patch(':id/markup')
  @ApiOperation({ summary: 'Update brand-level markup override (percent)' })
  @ApiParam({ name: 'id', description: 'Brand MongoDB id' })
  @ApiOkResponse({ description: 'Updated brand', type: BrandDto })
  updateBrandMarkup(
    @Param('id') id: string,
    @Body('markupPercentage') markupPercentage: number,
  ) {
    return this.adminCardsService.updateBrandMarkup(
      id,
      Number(markupPercentage),
    );
  }

  @Patch(':id/products/:productId/markup')
  @ApiOperation({ summary: 'Update product-level markup override (percent)' })
  @ApiParam({ name: 'id', description: 'Brand MongoDB id' })
  @ApiParam({ name: 'productId', description: 'Product id within brand' })
  @ApiOkResponse({ description: 'Updated brand', type: BrandDto })
  updateProductMarkup(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Body('markupPercentage') markupPercentage: number,
  ) {
    return this.adminCardsService.updateProductMarkup(
      id,
      productId,
      Number(markupPercentage),
    );
  }

  @Post('sync')
  @ApiOperation({
    summary: 'Trigger catalog sync from provider and convert prices',
  })
  @ApiOkResponse({ description: 'Sync result', type: SyncResponseDto })
  async sync() {
    return this.adminCardsService.syncFromProviderAndConvert();
  }
}
