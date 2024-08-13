import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { existsSync, renameSync, unlinkSync } from 'fs';
import { join } from 'path';

type ValidFolder = 'branches';
@Injectable()
export class FilesService {
  constructor(private configService: ConfigService) {}

  getStaticBranchVideo(imageName: string) {
    const path = join(__dirname, '../../../static/branches', imageName);
    if (!existsSync(path)) throw new BadRequestException(`No branch found with image ${imageName}`);
    return path;
  }

  saveFiles(files: string[], folder: ValidFolder): void {
    const tempDir = join(__dirname, '..', '..', '..', 'static', 'temp');
    const finalDir = join(__dirname, '..', '..', '..', 'static', folder);

    for (const file of files) {
      const tempFilePath = join(tempDir, file);
      const finalFilePath = join(finalDir, file);
      if (existsSync(tempFilePath)) {
        console.log('file dont exist', tempFilePath);
        renameSync(tempFilePath, finalFilePath);
      }
    }
  }

  deleteFiles(files: string[], folder: ValidFolder): void {
    const tempDir = join(__dirname, '..', '..', '..', 'static', folder);

    for (const file of files) {
      const filePath = join(tempDir, file);
      if (!existsSync(filePath)) return;
      unlinkSync(filePath);
    }
  }

  buildFileUrl(filename: string, folder: ValidFolder): string {
    const host = this.configService.getOrThrow('host');
    return `${host}/files/${folder}/${filename}`;
  }
}
