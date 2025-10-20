import { Injectable } from '@nestjs/common';
import { CardsService } from './cards.service';
import { QueryCardsDto } from './dto/query-cards.dto';

@Injectable()
export class UserCardsService {
  constructor(private readonly cardsService: CardsService) {}

  getAll(dto: QueryCardsDto) {
    return this.cardsService.queryBrands(dto, true);
  }

  getById(id: string) {
    return this.cardsService.findById(id, true);
  }
}
