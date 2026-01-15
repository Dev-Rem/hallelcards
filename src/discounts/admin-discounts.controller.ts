import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  DeletedResponseDto,
  DiscountViewDto,
} from './dto/discount-responses.dto';
import { DiscountsService } from './discounts.service';
import { Roles } from '../common/roles.decorator';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  CreateDiscountRequestDto,
  UpdateDiscountRequestDto,
} from './dto/discount-requests.dto';

@ApiTags('admin-discounts')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/discounts')
export class AdminDiscountsController {
  constructor(private readonly discounts: DiscountsService) {}

  @Get()
  @ApiOperation({ summary: 'List all discounts' })
  @ApiOkResponse({ description: 'List discounts', type: [DiscountViewDto] })
  list() {
    return this.discounts.list();
  }

  @Post()
  @ApiOperation({ summary: 'Create a discount' })
  @ApiOkResponse({ description: 'Created discount', type: DiscountViewDto })
  create(@Body() dto: CreateDiscountRequestDto) {
    return this.discounts.create({
      ...dto,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a discount' })
  @ApiParam({ name: 'id', description: 'Discount id' })
  @ApiOkResponse({ description: 'Updated discount', type: DiscountViewDto })
  update(@Param('id') id: string, @Body() dto: UpdateDiscountRequestDto) {
    return this.discounts.update(id, {
      ...dto,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a discount' })
  @ApiParam({ name: 'id', description: 'Discount id' })
  @ApiOkResponse({ description: 'Deleted', type: DeletedResponseDto })
  remove(@Param('id') id: string) {
    return this.discounts.delete(id);
  }
}
