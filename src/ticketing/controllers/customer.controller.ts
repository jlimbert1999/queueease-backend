import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { BranchesService } from 'src/management/services';
import { Public } from 'src/auth/decorators';
import { ServiceRequestService } from '../services';
import { CreateRequestServiceDto } from '../dtos';

@Public()
@Controller('customers')
export class CustomerController {
  constructor(
    private branchService: BranchesService,
    private requestService: ServiceRequestService,
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
    const { serviceRequest, name } = await this.requestService.create(data);
    this.groupwareGateway.sendServiceRequests(serviceRequest);
    return { code: serviceRequest.code, date: serviceRequest.createdAt, name: name };
  }
}
