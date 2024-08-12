import { Controller, Get, Param, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { Response } from 'express';

import { UserRole } from 'src/modules/users/entities/user.entity';
import { Protected, Public } from 'src/modules/auth/decorators';
import { fileFilter, fileNamer } from './helpers';
import { FilesService } from './files.service';

const MAX_FILE_SIZE: number = 2 * 1024 * 1024 * 1024;
@Controller('files')
export class FilesController {
  constructor(
    private configService: ConfigService,
    private fileService: FilesService,
  ) {}

  @Protected(UserRole.ADMIN)
  @Post('branch')
  @UseInterceptors(
    FilesInterceptor('files', null, {
      fileFilter: fileFilter,
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      storage: diskStorage({
        destination: './static/temp',
        filename: fileNamer,
      }),
    }),
  )
  uploadBranchVideo(@UploadedFiles() files: Express.Multer.File[]) {
    return { files: files.map(({ filename }) => filename) };
  }

  @Public()
  @Get('branch/:imageName')
  findBranchVideo(@Res() res: Response, @Param('imageName') imageName: string) {
    const path = this.fileService.getStaticBranchVideo(imageName);
    res.sendFile(path);
  }
}
