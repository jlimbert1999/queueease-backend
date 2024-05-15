import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BranchesService } from 'src/management/services';
import { CreateRequestServiceDto } from '../dtos/create-request.dto';
import { ServiceRequestService } from '../services/service-request.service';

@Controller('customers')
export class CustomerController {
  constructor(
    private brancService: BranchesService,
    private requestService: ServiceRequestService,
  ) {}

  @Get('menu/:id_branch')
  getMenu(@Param('id_branch') id_branch: string) {
    return this.brancService.getMenu(+id_branch);
  }

  @Post('request')
  createRequest(@Body() request: CreateRequestServiceDto) {
   return this.requestService.create(request);
  }
}
