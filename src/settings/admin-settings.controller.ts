import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { Roles } from '../common/roles.decorator';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('admin-settings')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('markup')
  async getMarkup() {
    const value = await this.settings.getGlobalMarkup();
    return { globalMarkupPercentage: value };
  }

  @Put('markup')
  async updateMarkup(@Body('percentage') percentage: number) {
    const updated = await this.settings.updateGlobalMarkup(Number(percentage));
    return { globalMarkupPercentage: updated.globalMarkupPercentage };
  }
}


