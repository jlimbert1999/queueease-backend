import { Module } from '@nestjs/common';
import { CustomerModule } from 'src/customer/customer.module';
import { CounterService } from './counter.service';
import { ServiceDeskController } from './service-desk.controller';
import { GroupwareModule } from 'src/groupware/groupware.module';

@Module({
  imports: [CustomerModule, GroupwareModule],
  controllers: [ServiceDeskController],
  providers: [CounterService],
})
export class ServiceDeskModule {
  constructor() {}
}
