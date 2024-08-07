import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { existsSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class CleanupService {
  private readonly tempDir = join(__dirname, '..', '..', '..', 'static', 'temp');

  @Cron('0 2 * * *')
  async cleanupTempFolder() {
    if (!existsSync(this.tempDir)) {
      return Logger.error(`Error clean uploaded temp files, ${this.tempDir} don't exist`);
    }
    const files = readdirSync(this.tempDir);
    files.forEach((file) => {
      const filePath = join(this.tempDir, file);
      unlinkSync(filePath);
    });
  }
}
