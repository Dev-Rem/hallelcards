import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DeletedResponseDto, DiscountViewDto } from './dto/discount-responses.dto';
import { DiscountsService } from './discounts.service';
import { Roles } from '../common/roles.decorator';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DiscountType } from './schemas/discount.schema';

class CreateDiscountDto {
  @IsString() code!: string;
  @IsEnum(DiscountType) type!: DiscountType;
  @IsNumber() value!: number;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsString() startsAt?: string;
  @IsOptional() @IsString() endsAt?: string;
  @IsOptional() @IsNumber() minOrderAmount?: number;
  @IsOptional() @IsInt() @Min(0) maxUses?: number;
}

class UpdateDiscountDto extends CreateDiscountDto {}

@ApiTags('admin-discounts')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/discounts')
export class AdminDiscountsController {
  constructor(private readonly discounts: DiscountsService) {}

  @Get()
  @ApiOkResponse({ description: 'List discounts', type: [DiscountViewDto] })
  list() {
    return this.discounts.list();
  }

  @Post()
  @ApiOkResponse({ description: 'Created discount', type: DiscountViewDto })
  create(@Body() dto: CreateDiscountDto) {
    return this.discounts.create(dto);
  }

  @Put(':id')
  @ApiOkResponse({ description: 'Updated discount', type: DiscountViewDto })
  update(@Param('id') id: string, @Body() dto: UpdateDiscountDto) {
    return this.discounts.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Deleted', type: DeletedResponseDto })
  remove(@Param('id') id: string) {
    return this.discounts.delete(id);
  }
}


