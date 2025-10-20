import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { QueryCardsDto } from './dto/query-cards.dto';

@ApiTags('cards')
@Controller('cards')
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  @Get()
  async list(@Query() query: QueryCardsDto) {
    return this.cards.queryBrands(query);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.cards.findById(id);
  }

  @Get('categories')
  async categories() {
    return this.cards.getAllCategories();
  }
}
