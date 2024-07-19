import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { Pdf } from 'src/helpers';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async notifyUser(user: string, password: string) {
    const buffer = await this.createAccountSheet(user, password);
    const htmlContent = await this.loadHtmlTemplate('assign.html', {
      userName: user,
    });
    await this.mailerService.sendMail({
      to: 'jose.flores@sacaba.gob.bo',
      from: 'gob.elect@gmail.com',
      subject: 'Asignacion Usuario para Sistema de Colas',
      text: 'Documento generado automaticamente',
      html: htmlContent,
      attachments: [
        {
          filename: 'Asignacion.pdf',
          content: buffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  async createAccountSheet(user: string, password: string) {
    const document = await Pdf.createAccountSheet(user, password);
    return this._generatePdfBuffer(document);
  }

  private _generatePdfBuffer(document: pdfMake.TCreatedPdf): Promise<Buffer> {
    return new Promise((resolve) => {
      document.getBuffer((buffer) => {
        resolve(buffer);
      });
    });
  }

  async loadHtmlTemplate(templatePath: string, replacements: { [key: string]: string }): Promise<string> {
    const filePath = path.resolve(process.cwd(), 'src', 'assets', 'html', 'assign.html');
    let html = fs.readFileSync(filePath, 'utf8');

    for (const key in replacements) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
    }

    return html;
  }
}
