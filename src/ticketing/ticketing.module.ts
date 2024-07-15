import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdministrationModule } from 'src/administration/administration.module';
import { GroupwareModule } from 'src/groupware/groupware.module';

import { AttentionController, CustomerController } from './controllers';
import { AttentionService, CustomerService } from './services';
import { Attention, ServiceRequest } from './entities';

@Module({
  imports: [AdministrationModule, GroupwareModule, TypeOrmModule.forFeature([ServiceRequest, Attention])],
  controllers: [AttentionController, CustomerController],
  providers: [AttentionService, CustomerService],
})
export class TicketingModule {}
