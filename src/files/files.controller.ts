import { Controller, Get, Param, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { Public } from 'src/auth/decorators';
import { fileNamer } from './helpers/file_namer.helper';
import { fileFilter } from './helpers/file_filter.helper';
import { FilesService } from './files.service';

@Public()
@Controller('files')
export class FilesController {
  constructor(
    private configService: ConfigService,
    private fileService: FilesService,
  ) {}
  @Post('branch')
  @UseInterceptors(
    FilesInterceptor('files', null, {
      fileFilter: fileFilter,
      limits: {
        fileSize: 2 * 1024 * 1024 * 1024,
      },
      storage: diskStorage({
        destination: './static/branches',
        filename: fileNamer,
      }),
    }),
  )
  uploadBranchVideo(@UploadedFiles() files: Express.Multer.File[]) {
    return { files: files.map(({ filename }) => filename) };
  }

  @Get('branch/:imageName')
  findBranchVideo(@Res() res: Response, @Param('imageName') imageName: string) {
    const path = this.fileService.getStaticBranchVideo(imageName);
    res.sendFile(path);
  }
}
