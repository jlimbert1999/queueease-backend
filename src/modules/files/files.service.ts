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

  saveFiles(fileNames: string[], folder: ValidFolder) {
    const tempDir = join(__dirname, '..', '..', '..', 'static', 'temp');
    const finalDir = join(__dirname, '..', '..', '..', 'static', folder);

    fileNames.forEach((name) => {
      const tempFilePath = join(tempDir, name);
      const finalFilePath = join(finalDir, name);
      if (!existsSync(tempFilePath)) return;
      renameSync(tempFilePath, finalFilePath);
    });
  }

  removeFile(fileNames: string[], folder: ValidFolder): void {
    const dir = join(__dirname, '..', '..', '..', 'static', folder);
    for (const file of fileNames) {
      const filePath = join(dir, file);
      console.log(filePath);
      unlinkSync(filePath);
    }
  }
}
