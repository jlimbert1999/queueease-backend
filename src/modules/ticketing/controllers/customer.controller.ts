import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { GroupwareGateway } from 'src/modules/groupware/gateways/groupware.gateway';
import { Public } from 'src/modules/auth/decorators';

import { CreateRequestServiceDto } from '../dtos';
import { CustomerService } from '../services';
import { BranchesService } from 'src/modules/administration/services';

@Public()
@Controller('customers')
export class CustomerController {
  constructor(
    private branchService: BranchesService,
    private customerService: CustomerService,
    private groupwareGateway: GroupwareGateway,
  ) {}

  @Get('branches/:term')
  getBranches(@Param('term') term: string) {
    return this.branchService.searchAvailables(term);
  }

  @Post('request')
  async createRequest(@Body() data: CreateRequestServiceDto) {
    const request = await this.customerService.createRequest(data);
    this.groupwareGateway.notifyNewRequest(request);
    const { code, createdAt, service } = request;
    return { code: code, description: service.name, date: createdAt };
  }

  @Get('branch/:id')
  getConfig(@Param('id') id: string) {
    return this.branchService.getBranchConfig(id);
  }
}
