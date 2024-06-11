import { Controller, Get } from '@nestjs/common';
import { UserRequest } from 'src/auth/decorators';
import { User } from 'src/users/entities/user.entity';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { onlyAssignedCounter } from '../decorators/only-assigned-counter.decorator';
import { CounterService } from '../services';
import { BranchGateway } from 'src/groupware/branch.gateway';

@onlyAssignedCounter()
@Controller('service-desk')
export class ServiceDeskController {
  constructor(
    private counterService: CounterService,
    private groupwareGateway: GroupwareGateway,
    private branchGateway: BranchGateway,
  ) {}

  @Get()
  getServiceRequests(@UserRequest() user: User) {
    return this.counterService.getServiceRequests(user);
  }

  @Get('next')
  async getNextRequest(@UserRequest() user: User) {
    const request = await this.counterService.handleRequest(user);
    // this.branchGateway.notifyRequest(request);
    this.branchGateway.notifyRequest(request);
  }
}
