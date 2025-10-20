import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserCardsService } from './user-cards.service';
import { QueryCardsDto } from './dto/query-cards.dto';

@Controller('cards')
export class UserCardsController {
  constructor(private readonly userCardsService: UserCardsService) {}

  @Get()
  getAll(@Query() query: QueryCardsDto) {
    return this.userCardsService.getAll(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.userCardsService.getById(id);
  }
}
