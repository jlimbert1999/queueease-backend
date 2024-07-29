import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';

import { PaginationParamsDto } from 'src/common/dtos';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos';
import { CategoryService } from '../services';
import { Protected } from 'src/modules/auth/decorators';
import { UserRole } from 'src/modules/users/entities/user.entity';

@Controller('categories')
@Protected(UserRole.ADMIN)
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
