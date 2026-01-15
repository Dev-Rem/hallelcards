import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { GlobalMarkupDto } from './dto/settings-responses.dto';
import { SettingsService } from './settings.service';
import { Roles } from '../common/roles.decorator';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { IsNumber, Max, Min } from 'class-validator';

class UpdateMarkupDto {
  @ApiProperty({
    description: 'Global markup percentage (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @Min(0)
  @Max(100)
  @IsNumber()
  percentage!: number;
}

@ApiTags('admin-settings')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('markup')
  @ApiOperation({ summary: 'Get global markup percentage' })
  @ApiOkResponse({ description: 'Get global markup', type: GlobalMarkupDto })
  async getMarkup() {
    const value = await this.settings.getGlobalMarkup();
    return { globalMarkupPercentage: value };
  }

  @Put('markup')
  @ApiOperation({ summary: 'Update global markup percentage' })
  @ApiOkResponse({ description: 'Update global markup', type: GlobalMarkupDto })
  async updateMarkup(@Body() dto: UpdateMarkupDto) {
    const updated = await this.settings.updateGlobalMarkup(
      Number(dto.percentage),
    );
    return { globalMarkupPercentage: updated.globalMarkupPercentage };
  }
}
