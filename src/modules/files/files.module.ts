import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { CleanupService } from './cleanup.service';

@Module({
  controllers: [FilesController],
  providers: [FilesService, CleanupService],
  exports: [FilesService],
})
export class FilesModule {}
