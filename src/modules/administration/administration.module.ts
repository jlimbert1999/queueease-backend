import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch, Category, Service, Counter, BranchVideo, Preference } from './entities';
import { ServiceService, CategoryService, BranchesService, CounterService, PreferenceService } from './services';
import {
  BranchController,
  CategoriesController,
  CounterController,
  PreferenceController,
  ServicesController,
} from './controllers';
import { UserModule } from 'src/modules/users/user.module';
import { GroupwareModule } from 'src/modules/groupware/groupware.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    UserModule,
    GroupwareModule,
    TypeOrmModule.forFeature([Category, Branch, Counter, Service, BranchVideo, Preference]),
    FilesModule,
  ],
  controllers: [CategoriesController, ServicesController, BranchController, CounterController, PreferenceController],
  providers: [ServiceService, CategoryService, BranchesService, CounterService, PreferenceService],
  exports: [TypeOrmModule, BranchesService, ServiceService],
})
export class AdministrationModule {}
