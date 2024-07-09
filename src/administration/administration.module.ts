import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Branch,
  Category,
  Service,
  Counter,
  BranchVideo,
  Preference,
} from './entities';
import {
  ServiceService,
  CategoryService,
  BranchesService,
  CounterService,
  PreferenceService,
} from './services';
import {
  BranchController,
  CategoriesController,
  CounterController,
  PreferenceController,
  ServicesController,
} from './controllers';
import { UserModule } from 'src/users/user.module';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      Category,
      Branch,
      Counter,
      Service,
      BranchVideo,
      Preference,
    ]),
  ],
  controllers: [
    CategoriesController,
    ServicesController,
    BranchController,
    CounterController,
    PreferenceController
  ],
  providers: [
    ServiceService,
    CategoryService,
    BranchesService,
    CounterService,
    PreferenceService,
  ],
  exports: [TypeOrmModule, BranchesService],
})
export class AdministrationModule {}
