import { TDocumentDefinitions } from 'pdfmake/interfaces';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { convertImageABase64 } from './image-to-base64';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

export class Pdf {
  static async createAccountSheet(user: string, password: string) {
    // const image = await convertImageABase64('../assets/img/logo.jpeg');
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER',
      pageMargins: [40, 40, 40, 40],
      content: [
        {
          alignment: 'center',
          fontSize: 10,
          table: {
            heights: 10,
            widths: [70, 300, '*'],
            body: [
              [
                { rowSpan: 4, text: 'Imagen', fit: [100, 70] },
                {
                  rowSpan: 2,
                  text: 'GOBIERNO ELECTRÓNICO',
                },
                { text: 'SF-000-74-RG26' },
              ],
              ['', '', 'version 1'],
              [
                '',
                {
                  rowSpan: 2,
                  text: 'ASIGNACION DE USUARIO DE SISTEMA DE SEGUIMIENTO DE TRAMITES INTERNOS Y EXTERNOS',
                },
                `Aprobacion 20/02/2020`,
              ],
              ['', '', 'pagina 1 de 1'],
            ],
          },
        },
        {
          text: `Fecha: ${new Date().toLocaleString()}`,
          marginTop: 20,
          style: 'header',
          alignment: 'right',
        },
        {
          marginTop: 50,
          text: [
            'NOMBRE: ',
            {
              text: `${user}`.toUpperCase(),
              bold: false,
            },
          ],
          style: 'header',
          alignment: 'center',
          fontSize: 12,
        },
        {
          marginTop: 25,
          text: '\n\nCUENTA\n\n',
          style: 'header',
          alignment: 'center',
        },
        {
          text: ['Usuario: ', { text: `${user}\n\n`, bold: false }, 'Contraseña: ', { text: password, bold: false }],
          style: 'header',
          alignment: 'center',
          fontSize: 12,
        },
        {
          text: 'La contraseña ingresada en el reporte debe ser cambiada una vez ingresada al sistema para que sea solo de conocimiento del usuario ',
          style: 'header',
          alignment: 'center',
          fontSize: 10,
        },
        {
          text: '\n\nEs responsabilidad del usuario el uso de la cuenta asignada\n\n',
          style: 'header',
          alignment: 'center',
          fontSize: 10,
          marginBottom: 50,
        },
        {
          qr: `${user}`,
          alignment: 'right',
          fit: 100,
        },
        {
          marginTop: 20,
          columns: [
            {
              width: 90,
              text: '',
            },
            {
              width: '*',
              text: 'Sello y firma \n USUARIO',
              alignment: 'center',
            },
            {
              width: '*',
              text: 'Sello y firma \n ADMINISTRADOR',
              alignment: 'center',
            },
            {
              width: 90,
              text: '',
            },
          ],
        },
      ],
    };
    return pdfMake.createPdf(docDefinition);
  }
}
