import { Controller, Get } from '@nestjs/common';
import { UserRequest } from 'src/auth/decorators';
import { User } from 'src/users/entities/user.entity';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { onlyAssignedCounter } from '../decorators/only-assigned-counter.decorator';
import { RequestService } from '../services';
import { BranchGateway } from 'src/groupware/branch.gateway';

@onlyAssignedCounter()
@Controller('service-desk')
export class ServiceDeskController {
  constructor(
    private counterService: RequestService,
    private groupwareGateway: GroupwareGateway,
    private branchGateway: BranchGateway,
  ) {}

  @Get()
  getRequests(@UserRequest() user: User) {
    return this.counterService.getRequests(user);
  }

  @Get('current')
  getCurrentRequest(@UserRequest() user: User) {
    return this.counterService.getCurrentRequest(user);
  }

  @Get('next')
  async getNextRequest(@UserRequest() user: User) {
    const request = await this.counterService.getNextRequest(user);
    console.log(request);
    this.branchGateway.announceRequest(request);
  }
}
