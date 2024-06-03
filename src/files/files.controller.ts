import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { Public } from 'src/auth/decorators';
import { fileNamer } from './helpers/file_namer.helper';
import { fileFilter } from './helpers/file_filter.helper';
import { FilesService } from './files.service';
import { Response } from 'express';

@Public()
@Controller('files')
export class FilesController {
  constructor(
    private configService: ConfigService,
    private fileService: FilesService,
  ) {}
  @Post('branch')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      limits: {
        fileSize: 1 * 1024 * 1024 * 1024,
      },
      storage: diskStorage({
        destination: './static/branches',
        filename: fileNamer,
      }),
    }),
  )
  uploadBranchVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Make sure that the file is an video');
    return { file: file.filename };
  }

  @Get('branch/:imageName')
  findBranchVideo(@Res() res: Response, @Param('imageName') imageName: string) {
    const path = this.fileService.getStaticBranchVideo(imageName);
    res.sendFile(path);
  }
}
