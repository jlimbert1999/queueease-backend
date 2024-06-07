import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch, Category, Service, Counter, BranchVideo } from './entities';
import { ServiceService, CategoryService, BranchesService, CounterService } from './services';
import { BranchController, CategoriesController, CounterController, ServicesController } from './controllers';
import { UserModule } from 'src/users/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Branch, Counter, Service, BranchVideo]), UserModule],
  controllers: [CategoriesController, ServicesController, BranchController, CounterController],
  providers: [ServiceService, CategoryService, BranchesService, CounterService],
  exports: [TypeOrmModule, BranchesService],
})
export class ManagementModule {}
