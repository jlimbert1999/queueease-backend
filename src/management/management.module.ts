import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch, Category, Officer, Service, ServiceDesk } from './entities';
import { ServiceService, CategoryService, BranchesService, ServiceDeskService } from './services';
import { BranchController, CategoriesController, ServiceDeskController, ServicesController } from './controllers';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Branch, Officer, ServiceDesk, Service])],
  controllers: [CategoriesController, ServicesController, BranchController, ServiceDeskController],
  providers: [ServiceService, CategoryService, BranchesService, ServiceDeskService],
  exports: [TypeOrmModule, BranchesService],
})
export class ManagementModule {}
