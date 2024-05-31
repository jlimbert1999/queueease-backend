import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CategoryService } from '../services';
import { PaginationParamsDto } from 'src/common/dtos';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoryService) {}

  @Get()
  findAll(@Query() params: PaginationParamsDto) {
    return this.categoriesService.findAll(params);
  }

  @Post()
  create(@Body() category: CreateCategoryDto) {
    return this.categoriesService.create(category);
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() category: UpdateCategoryDto) {
    return this.categoriesService.update(id, category);
  }
}
