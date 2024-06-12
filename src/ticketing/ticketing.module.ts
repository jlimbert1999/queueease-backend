import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupwareModule } from 'src/groupware/groupware.module';
import { AdministrationModule } from 'src/administration/administration.module';
import { ServiceDeskController, CustomerController } from './controllers';
import { RequestService, CustomerService } from './services';
import { ServiceRequest } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRequest]), AdministrationModule, GroupwareModule],
  controllers: [ServiceDeskController, CustomerController],
  providers: [RequestService, CustomerService],
})
export class TicketingModule {
  constructor() {}
}
