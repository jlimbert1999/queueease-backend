import { Controller, Get } from '@nestjs/common';
import { ServiceDeskService } from './service_desk.service';
import { UserRequest } from 'src/auth/decorators';
import { User } from 'src/users/entities/user.entity';
import { GroupwareService } from 'src/groupware/groupware.service';

@Controller('service-desk')
export class ServiceDeskController {
  constructor(
    private serviceDeskService: ServiceDeskService,
    private groupwareService: GroupwareService,
  ) {}

  @Get()
  getServiceRequests(@UserRequest() user: User) {
    return this.serviceDeskService.getServiceRequests(user);
  }

}
