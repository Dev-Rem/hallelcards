import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';
import { Roles } from '../common/roles.decorator';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('admin-discounts')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/discounts')
export class AdminDiscountsController {
  constructor(private readonly discounts: DiscountsService) {}

  @Get()
  list() {
    return this.discounts.list();
  }

  @Post()
  create(@Body() dto: any) {
    return this.discounts.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.discounts.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discounts.delete(id);
  }
}


