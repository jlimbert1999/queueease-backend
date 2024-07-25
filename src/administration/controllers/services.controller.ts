import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CategoryService, ServiceService } from '../services';
import { PaginationParamsDto } from 'src/common/dtos';
import { CreateServiceDto, UpdateServiceDto } from '../dtos';
import { Protected } from 'src/auth/decorators';
import { UserRole } from 'src/users/entities/user.entity';

@Controller('services')
@Protected(UserRole.ADMIN)
export class ServicesController {
  constructor(
    private servicesService: ServiceService,
    private categoryService: CategoryService,
  ) {}

  @Get()
  findAll(@Query() params: PaginationParamsDto) {
    return this.servicesService.findAll(params);
  }

  @Post()
  create(@Body() category: CreateServiceDto) {
    return this.servicesService.create(category);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() category: UpdateServiceDto) {
    return this.servicesService.update(id, category);
  }

  @Get('categories')
  getCategories() {
    return this.categoryService.getAvailables();
  }

  @Get('availbles/:term')
  searchServices(@Param('term') term: string) {
    return this.servicesService.searchAvailables(term);
  }
}
