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
import { AdminJwtStrategy } from '../auth/jwt-admin.strategy';
import { Roles } from '../common/roles.decorator';

@Controller('admin/cards')
@UseGuards(AdminJwtStrategy, Roles)
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

  @Post('sync')
  async sync() {
    return this.adminCardsService.syncFromProviderAndConvert();
  }
}
