import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupwareModule } from 'src/groupware/groupware.module';
import { ManagementModule } from 'src/management/management.module';
import { CounterService, ServiceRequestService } from './services';
import { ServiceDeskController, CustomerController } from './controllers';
import { ServiceRequest } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRequest]), ManagementModule, GroupwareModule],
  controllers: [ServiceDeskController, CustomerController],
  providers: [CounterService, ServiceRequestService],
})
export class TicketingModule {
  constructor() {}
}