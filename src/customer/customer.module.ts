import { Module } from '@nestjs/common';
import { CustomerController } from './controllers/customer.controller';
import { ManagementModule } from 'src/management/management.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequest } from './entities';
import { ServiceRequestService } from './services/service-request.service';

@Module({
  imports: [ManagementModule, TypeOrmModule.forFeature([ServiceRequest])],
  controllers: [CustomerController],
  providers: [ServiceRequestService],
})
export class CustomerModule {}
