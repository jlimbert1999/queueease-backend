import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BranchesService } from 'src/management/services';
import { CreateRequestServiceDto } from '../dtos/create-request.dto';
import { ServiceRequestService } from '../services/service-request.service';
import { Public } from 'src/auth/decorators';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';

@Public()
@Controller('customers')
export class CustomerController {
  constructor(
    private brancService: BranchesService,
    private requestService: ServiceRequestService,
    private groupwareGateway: GroupwareGateway,
  ) {}

  @Get('menu/:id_branch')
  getMenu(@Param('id_branch') id_branch: string) {
    return this.brancService.getMenu(+id_branch);
  }

  @Post('request')
  async createRequest(@Body() request: CreateRequestServiceDto) {
    const { name, createdRequest } = await this.requestService.create(request);
    this.groupwareGateway.sendServiceRequests(createdRequest);
    return { code: createdRequest.code, date: createdRequest.date, name: name };
  }
}
