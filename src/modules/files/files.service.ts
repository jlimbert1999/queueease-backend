import { BadRequestException, Injectable } from '@nestjs/common';

import { existsSync, renameSync, unlinkSync } from 'fs';
import { join } from 'path';

type ValidFolder = 'branches';
@Injectable()
export class FilesService {
  
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
      if (!existsSync(tempFilePath)) return;
      renameSync(tempFilePath, finalFilePath);
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
}
