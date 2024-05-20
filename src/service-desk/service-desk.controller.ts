import { Controller, Get } from '@nestjs/common';
import { UserRequest } from 'src/auth/decorators';
import { User } from 'src/users/entities/user.entity';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { CounterService } from './counter.service';

@Controller('service-desk')
export class ServiceDeskController {
  constructor(
    private counterService: CounterService,
    private groupwareGateway: GroupwareGateway,
  ) {}

  @Get()
  getServiceRequests(@UserRequest() user: User) {
    return this.counterService.getServiceRequests(user);
  }

  @Get('next')
  async getNextRequest(@UserRequest() user: User) {
    const request = await this.counterService.getNextRequest(user);
    this.groupwareGateway.sendNextRequest(request);
  }
}
