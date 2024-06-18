import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { onlyAssignedCounter } from '../decorators/only-assigned-counter.decorator';
import { RequestService } from '../services';
import { BranchGateway } from 'src/groupware/branch.gateway';
import { UpdateRequestServiceDto } from '../dtos';
import { CounterRequest } from '../decorators/counter-request.decorator';
import { Counter } from 'src/administration/entities';

@onlyAssignedCounter()
@Controller('service-desk')
export class RequestController {
  constructor(
    private requestService: RequestService,
    private groupwareGateway: GroupwareGateway,
    private branchGateway: BranchGateway,
  ) {}

  @Get()
  getPendingsByCounter(@CounterRequest() counter: Counter) {
    return this.requestService.getPendingsByCounter(counter);
  }

  @Get('current')
  getCurrentRequestByCounter(@CounterRequest() counter: Counter) {
    return this.requestService.getCurrentRequestByCounter(counter);
  }

  @Get('next')
  async getNextRequest(@CounterRequest() counter: Counter) {
    const request = await this.requestService.getNextRequest(counter);
    this.groupwareGateway.notifyRequestHandled(request.branchId, request.serviceId, request.id);
    this.branchGateway.announceRequest(counter.branchId, {
      code: request.code,
      counterNumber: counter.number,
      id: request.id,
    });
    return request;
  }

  @Patch(':id')
  async updateRequest(@Param('id') id: string, @Body() data: UpdateRequestServiceDto) {
    return this.requestService.updateRequest(id, data);
  }

  @Get('detail')
  getCounterDetail(@CounterRequest() counter: Counter) {
    return counter;
  }
}
