import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { QueryCategoriesDto } from './dto/query-categories.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list(@Query() dto: QueryCategoriesDto) {
    return this.categories.query(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.categories.getById(id);
  }
}

