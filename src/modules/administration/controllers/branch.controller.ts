import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BranchesService } from '../services';
import { PaginationParamsDto } from 'src/common/dtos';
import { AnnounceDto, CreateBranchDto } from '../dtos';
import { Protected } from 'src/modules/auth/decorators';
import { UserRole } from 'src/modules/users/entities/user.entity';
import { BranchGateway } from 'src/modules/groupware/gateways/branch.gateway';

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

  @Post()
  create(@Body() category: CreateBranchDto) {
    return this.branchService.create(category);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() category: CreateBranchDto) {
    const branch = await this.branchService.update(id, category);
    // this.branchGateway.setBranchConfig(branch.id, { videos: branch.videos.map(()), message: branch.alertVideoUrl });
    return branch;
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
  async announce(@Body() body: AnnounceDto) {
    const branchIds = await this.branchService.announceVideo(body);
    this.branchGateway.announceVideo(branchIds, body.url);
    return { message: 'Sucursales actualizadas' };
  }
}
