import { Module } from '@nestjs/common';
import { CustomerController } from './controllers/customer.controller';
import { ManagementModule } from 'src/management/management.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequest } from './entities';
import { ServiceRequestService } from './services/service-request.service';
import { GroupwareModule } from 'src/groupware/groupware.module';

@Module({
  imports: [ManagementModule, TypeOrmModule.forFeature([ServiceRequest]), GroupwareModule],
  controllers: [CustomerController],
  providers: [ServiceRequestService],
  exports: [TypeOrmModule],
})
export class CustomerModule {}
