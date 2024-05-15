import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch, Category, Service, ServiceCounter } from './entities';
import { ServiceService, CategoryService, BranchesService, ServiceDeskService } from './services';
import { BranchController, CategoriesController, ServiceDeskController, ServicesController } from './controllers';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Branch, ServiceCounter, Service])],
  controllers: [CategoriesController, ServicesController, BranchController, ServiceDeskController],
  providers: [ServiceService, CategoryService, BranchesService, ServiceDeskService],
  exports: [TypeOrmModule, BranchesService],
})
export class ManagementModule {}
