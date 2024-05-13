/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { CustomerController } from './controllers/customer.controller';
import { ManagementModule } from 'src/management/management.module';

@Module({
  imports: [ManagementModule],
  controllers: [CustomerController],
  providers: [],
})
export class CustomerModule {}
