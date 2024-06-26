import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BranchesService } from '../services';
import { PaginationParamsDto } from 'src/common/dtos';
import { CreateBranchDto } from '../dtos';
import { Protected } from 'src/auth/decorators';
import { UserRole } from 'src/users/entities/user.entity';

@Controller('branches')
@Protected(UserRole.ADMIN)
export class BranchController {
  constructor(private branchService: BranchesService) {}

  @Get()
  findAll(@Query() params: PaginationParamsDto) {
    return this.branchService.findAll(params);
  }

  @Get('search/:term')
  search(@Param('term') term: string, @Query() params: PaginationParamsDto) {
    return this.branchService.search(term, params);
  }

  @Post()
  create(@Body() category: CreateBranchDto) {
    return this.branchService.create(category);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() category: CreateBranchDto) {
    return this.branchService.update(id, category);
  }

  @Get('availables/:term')
  searchAvaibles(@Param('term') term: string) {
    return this.branchService.searchAvailables(term);
  }

  @Get('services/:id')
  getServicesByBranch(@Param('id') id: string) {
    return this.branchService.getBranchServices(id);
  }

  @Get('menu/:id')
  getMenu(@Param('id') id: string) {
    return this.branchService.getMenu(id);
  }
}
