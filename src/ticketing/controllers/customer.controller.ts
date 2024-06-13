import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { BranchesService } from 'src/administration/services';
import { Public } from 'src/auth/decorators';

import { CreateRequestServiceDto } from '../dtos';
import { CustomerService } from '../services';

@Public()
@Controller('customers')
export class CustomerController {
  constructor(
    private branchService: BranchesService,
    private customerService: CustomerService,
    private groupwareGateway: GroupwareGateway,
  ) {}

  @Get('menu/:id_branch')
  getMenu(@Param('id_branch') id_branch: string) {
    return this.branchService.getMenu(id_branch);
  }

  @Get('advertisement/:id_branch')
  getBranchAdvertisements(@Param('id_branch') id_branch: string) {
    return this.branchService.getBranchAdvertisement(id_branch);
  }

  @Get('branches/:term')
  getBranches(@Param('term') term: string) {
    return this.branchService.searchAvailables(term);
  }

  @Post('request')
  async createRequest(@Body() data: CreateRequestServiceDto) {
    const request = await this.customerService.createRequest(data);
    this.groupwareGateway.notifyNewRequest(request);
    return { code: request.code };
  }
}
