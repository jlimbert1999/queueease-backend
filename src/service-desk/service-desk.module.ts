import { Module } from '@nestjs/common';
import { CustomerModule } from 'src/customer/customer.module';
import { ServiceDeskService } from './service_desk.service';
import { ServiceDeskController } from './service-desk.controller';
import { GroupwareModule } from 'src/groupware/groupware.module';

@Module({
  imports: [CustomerModule, GroupwareModule],
  controllers: [ServiceDeskController],
  providers: [ServiceDeskService],
})
export class ServiceDeskModule {
  constructor() {}
}
