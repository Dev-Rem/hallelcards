import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FxRateDto, RefreshedDto } from './dto/fx-responses.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsdConversion, UsdConversionDocument } from '../cards/schemas/usd-conversion.schema';
import { Roles } from '../common/roles.decorator';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { FxUpdaterService } from './fx-updater.service';

import { IsNumber } from 'class-validator';

class UpdateRateDto {
  @IsNumber()
  value!: number;
}

@ApiTags('admin-fx')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/fx')
export class AdminFxController {
  constructor(
    @InjectModel(UsdConversion.name)
    private readonly usdModel: Model<UsdConversionDocument>,
    private readonly fxUpdater: FxUpdaterService,
  ) {}

  @Get('rates')
  @ApiOkResponse({ description: 'List FX rates', type: [FxRateDto] })
  async list() {
    return this.usdModel.find().sort({ currencyCode: 1 }).lean();
  }

  @Get('rates/:code')
  @ApiOkResponse({ description: 'Get one FX rate', type: FxRateDto })
  async get(@Param('code') code: string) {
    return this.usdModel.findOne({ currencyCode: String(code).toUpperCase() }).lean();
  }

  @Put('rates/:code')
  @ApiOkResponse({ description: 'Updated FX rate', type: FxRateDto })
  async update(@Param('code') code: string, @Body() dto: UpdateRateDto) {
    const updated = await this.usdModel.findOneAndUpdate(
      { currencyCode: String(code).toUpperCase() },
      { $set: { value: Number(dto.value), dateModified: new Date() } },
      { new: true, upsert: true },
    );
    return updated;
  }

  @Post('refresh')
  @ApiOkResponse({ description: 'FX refresh started', type: RefreshedDto })
  async refresh() {
    await this.fxUpdater.updateRates();
    return { refreshed: true };
  }
}


