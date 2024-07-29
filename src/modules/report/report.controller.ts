import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { FilterByServiceAndUserDto } from './dtos';
import { ReportService } from './report.service';
import { BranchesService } from '../administration/services';
import { UserRequest } from '../auth/decorators';
import { User } from '../users/entities/user.entity';

@Controller('reports')
export class ReportController {
  constructor(
    private reportService: ReportService,
    private branchService: BranchesService,
  ) {}

  @Get('search/branches')
  searchBranches(@Query('term') term?: string) {
    return this.branchService.searchAvailables(term);
  }

  @Post('service-user')
  filterByServiceAndUser(@Body() params: FilterByServiceAndUserDto) {
    return this.reportService.getTotalByServiceAndUser(params);
  }

  @Get('work')
  getWorkDetails(@UserRequest() user: User) {
    return this.reportService.getWorkDetails(user);
  }
}
