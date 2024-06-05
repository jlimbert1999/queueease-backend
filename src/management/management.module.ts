import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch, Category, Service, Counter, BranchVideo } from './entities';
import { ServiceService, CategoryService, BranchesService, CounterService } from './services';
import { BranchController, CategoriesController, ServiceCounterController, ServicesController } from './controllers';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Branch, Counter, Service, BranchVideo])],
  controllers: [CategoriesController, ServicesController, BranchController, ServiceCounterController],
  providers: [ServiceService, CategoryService, BranchesService, CounterService],
  exports: [TypeOrmModule, BranchesService],
})
export class ManagementModule {}
