import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { BranchesService } from 'src/administration/services';
import { BranchGateway } from 'src/groupware/branch.gateway';
import { Public } from 'src/auth/decorators';

import { CustomerService } from '../services';
import { CreateRequestServiceDto } from '../dtos';

@Public()
@Controller('customers')
export class CustomerController {
  constructor(
    private branchService: BranchesService,
    private customerService: CustomerService,
    private groupwareGateway: GroupwareGateway,
    private branchGateway: BranchGateway,
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
    const { serviceRequest, name } = await this.customerService.createRequest(data);
    this.groupwareGateway.notifyNewRequest(serviceRequest);
    this.branchGateway.announceRequest(serviceRequest);
    return { code: serviceRequest.code, date: serviceRequest.createdAt, name: name };
  }
}
