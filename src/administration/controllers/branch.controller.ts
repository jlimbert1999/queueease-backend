import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BranchesService } from '../services';
import { PaginationParamsDto } from 'src/common/dtos';
import { AnnounceDto, CreateBranchDto } from '../dtos';
import { Protected } from 'src/auth/decorators';
import { UserRole } from 'src/users/entities/user.entity';
import { BranchGateway } from 'src/groupware/branch.gateway';

@Controller('branches')
@Protected(UserRole.ADMIN)
export class BranchController {
  constructor(
    private branchService: BranchesService,
    private branchGateway: BranchGateway,
  ) {}

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

  @Get('availables')
  searchAvaibles(@Query('term') term: string | undefined) {
    return this.branchService.searchAvailables(term);
  }

  @Get('services/:id')
  getServicesByBranch(@Param('id') id: string) {
    return this.branchService.getBranchServices(id);
  }

  @Post('announce')
  announce(@Body() body: AnnounceDto) {
    return this.branchService.announce(body);
  }
}
