import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch, Category, Service, Counter } from './entities';
import { ServiceService, CategoryService, BranchesService, ServiceCounterService } from './services';
import { BranchController, CategoriesController, ServiceCounterController, ServicesController } from './controllers';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Branch, Counter, Service])],
  controllers: [CategoriesController, ServicesController, BranchController, ServiceCounterController],
  providers: [ServiceService, CategoryService, BranchesService, ServiceCounterService],
  exports: [TypeOrmModule, BranchesService],
})
export class ManagementModule {}
