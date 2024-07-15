import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { onlyAssignedCounter } from '../decorators/only-assigned-counter.decorator';
import { AttentionService } from '../services';
import { BranchGateway } from 'src/groupware/branch.gateway';
import { UpdateRequestServiceDto } from '../dtos';
import { CounterRequest } from '../decorators/counter-request.decorator';
import { Counter } from 'src/administration/entities';
import { UserRequest } from 'src/auth/decorators';
import { User } from 'src/users/entities/user.entity';

@onlyAssignedCounter()
@Controller('attention')
export class AttentionController {
  constructor(
    private attentionService: AttentionService,
    private groupwareGateway: GroupwareGateway,
    private branchGateway: BranchGateway,
  ) {}

  @Get()
  getPendingsByCounter(@CounterRequest() counter: Counter) {
    return this.attentionService.getPendingsByCounter(counter);
  }

  @Get('current')
  getCurrentRequestByCounter(@CounterRequest() counter: Counter) {
    return this.attentionService.getCurrentRequestByCounter(counter);
  }

  @Get('next')
  async getNextRequest(@CounterRequest() counter: Counter, @UserRequest() user: User) {
    const request = await this.attentionService.getNextRequest(counter, user);
    this.groupwareGateway.notifyRequestHandled(request.serviceRequest.branchId, request.serviceRequest.serviceId, request.serviceRequest.id);
    this.branchGateway.announceRequest(counter.branchId, {
      id: request.serviceRequest.id,
      code: request.serviceRequest.code,
      counterNumber: counter.number,
    });
    return request;
  }

  @Patch('handle/:id')
  async updateRequest(@Param('id') id: string, @Body() data: UpdateRequestServiceDto) {
    return this.attentionService.handleRequest(id, data);
  }

  @Get('check')
  checkCounter(@CounterRequest() counter: Counter) {
    return counter;
  }
}
