import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { existsSync } from 'fs';

import { readdir, unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class CleanupService {
  private readonly tempDir = join(__dirname, '..', '..', '..', 'static', 'temp');

  // @Cron('*/10 * * * * *') // Ejecuta cada 10 segundos
  @Cron('0 2 * * *')
  async _cleanTempFolder(): Promise<void> {
    if (!existsSync(this.tempDir)) {
      return Logger.error(`Error clean uploaded temp files, ${this.tempDir} don't exist`);
    }
    const files = await readdir(this.tempDir);
    for (const file of files) {
      const filePath = join(this.tempDir, file);
      await unlink(filePath);
    }
  }
}
