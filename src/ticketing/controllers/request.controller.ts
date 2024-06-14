import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UserRequest } from 'src/auth/decorators';
import { User } from 'src/users/entities/user.entity';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { onlyAssignedCounter } from '../decorators/only-assigned-counter.decorator';
import { RequestService } from '../services';
import { BranchGateway } from 'src/groupware/branch.gateway';
import { UpdateRequestServiceDto } from '../dtos';

@onlyAssignedCounter()
@Controller('service-desk')
export class RequestController {
  constructor(
    private requestService: RequestService,
    private groupwareGateway: GroupwareGateway,
    private branchGateway: BranchGateway,
  ) {}

  @Get()
  getPendingsByCounter(@UserRequest() user: User) {
    return this.requestService.getPendingsByCounter(user);
  }

  @Get('current')
  getCurrentRequestByCounter(@UserRequest() user: User) {
    return this.requestService.getCurrentRequestByCounter(user);
  }

  @Get('next')
  async getNextRequest(@UserRequest() user: User) {
    const request = await this.requestService.getNextRequest(user);
    this.groupwareGateway.notifyRequestHandled(request.branchId, request.serviceId, request.id);
    return request;
  }

  @Patch(':id')
  async updateRequest(@Param('id') id: string, @Body() data: UpdateRequestServiceDto) {
    return this.requestService.updateRequest(id, data);
  }
}
