import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { QueryCardsDto } from './dto/query-cards.dto';
import {
  BrandDto,
  BrandListResponseDto,
  CategoryViewDto,
} from './dto/cards-responses.dto';

@ApiTags('cards')
@Controller('cards')
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  @Get()
  @ApiOperation({ summary: 'List brands with filters and pagination' })
  @ApiOkResponse({
    description: 'Paginated brand list',
    type: BrandListResponseDto,
  })
  async list(@Query() query: QueryCardsDto) {
    return this.cards.queryBrands(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand by id' })
  @ApiParam({ name: 'id', description: 'Brand MongoDB id' })
  @ApiOkResponse({ description: 'Brand detail', type: BrandDto })
  async get(@Param('id') id: string) {
    return this.cards.findById(id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all categories' })
  @ApiOkResponse({
    description: 'Distinct categories list',
    type: [CategoryViewDto],
  })
  async categories() {
    return this.cards.getAllCategories();
  }
}
