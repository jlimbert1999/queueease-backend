import {
  BadRequestException,
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/file_namer';
import { ConfigService } from '@nestjs/config';
import { Public } from 'src/auth/decorators';

@Public()
@Controller('files')
export class FilesController {
  constructor(private readonly configService: ConfigService) {}
  @Post('branch')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './static/branches',
        filename: fileNamer,
      }),
    }),
  )
  uploadBranchVideo(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'mp4' })
        .addMaxSizeValidator({ maxSize: 2 * 1024 * 1024 * 1024 })
        .build(),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an video');
    }
    const secureUrl = `${this.configService.getOrThrow('host')}/files/branch/${file.filename}`;
    return { secureUrl };
  }
}
