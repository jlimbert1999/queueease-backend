import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupwareModule } from 'src/modules/groupware/groupware.module';

import { AttentionController, CustomerController } from './controllers';
import { AttentionService, CustomerService } from './services';
import { Attention, ServiceRequest } from './entities';
import { AdministrationModule } from 'src/modules/administration/administration.module';

@Module({
  imports: [AdministrationModule, GroupwareModule, TypeOrmModule.forFeature([ServiceRequest, Attention])],
  controllers: [AttentionController, CustomerController],
  providers: [AttentionService, CustomerService],
  exports: [TypeOrmModule],
})
export class TicketingModule {}
