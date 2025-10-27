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

@Controller('admin/cards')
@UseGuards(AdminAuthGuard, RolesGuard)
@Roles('admin')
export class AdminCardsController {
  constructor(private readonly adminCardsService: AdminCardsService) {}

  @Get()
  getAll(@Query() query: QueryCardsDto) {
    return this.adminCardsService.getAll(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.adminCardsService.getById(id);
  }

  @Patch(':id/converted')
  updateConverted(@Param('id') id: string, @Body('converted') converted: any) {
    return this.adminCardsService.updateConverted(id, converted);
  }

  @Patch(':id/markup')
  updateBrandMarkup(
    @Param('id') id: string,
    @Body('markupPercentage') markupPercentage: number,
  ) {
    return this.adminCardsService.updateBrandMarkup(id, Number(markupPercentage));
  }

  @Patch(':id/products/:productId/markup')
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
  async sync() {
    return this.adminCardsService.syncFromProviderAndConvert();
  }
}
