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
    private groupwareGatewat: GroupwareGateway,
  ) {}

  @Get('menu/:id_branch')
  getMenu(@Param('id_branch') id_branch: string) {
    // say.speak('FICHA, ACH22, PASE A LA VENTANILLA, 4?', null, 0.8, (err) => {
    //   if (err) {
    //     return console.error(err);
    //   }
    // });
    return this.branchService.getMenu(+id_branch);
  }

  @Post('request')
  async createRequest(@Body() data: CreateRequestServiceDto) {
    const { serviceRequest, name } = await this.requestService.create(data);
    this.groupwareGatewat.sendServiceRequests(serviceRequest);
    return { code: serviceRequest.code, date: serviceRequest.date, name: name };
  }
}
