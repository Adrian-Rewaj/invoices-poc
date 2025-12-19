import { parentPort, workerData } from 'worker_threads';
import * as fs from 'fs';
import * as path from 'path';

const PdfPrinter = require('pdfmake/src/printer');

function generatePdfFileName(invoice: any) {
  const safeNumber = (invoice.invoiceNumber || invoice.id || Date.now())
    .toString()
    .replace(/[\\/]/g, '_');
  return `faktura-${safeNumber}.pdf`;
}

function generateInvoicePDF(
  invoice: any,
  pdfPath: string,
  cb: (fileName: string) => void,
) {
  const fileName = generatePdfFileName(invoice);
  const filePath = path.join(pdfPath, fileName);

  const fonts = {
    DejaVu: {
      normal: path.resolve(__dirname, '../../../assets/DejaVuSans.ttf'),
      bold: path.resolve(__dirname, '../../../assets/DejaVuSans.ttf'),
      italics: path.resolve(__dirname, '../../../assets/DejaVuSans.ttf'),
      bolditalics: path.resolve(__dirname, '../../../assets/DejaVuSans.ttf'),
    },
  };

  const printer = new PdfPrinter(fonts);

  const items = invoice.data?.items || [];

  const docDefinition = {
    pageMargins: [40, 40, 40, 40],
    defaultStyle: {
      font: 'DejaVu',
      fontSize: 11,
    },
    content: [
      { text: 'VAT INVOICE', style: 'header', alignment: 'center' },
      {
        text: `No: ${invoice.invoiceNumber || ''}`,
        alignment: 'center',
        margin: [0, 5, 0, 20],
      },

      // Seller / Buyer
      {
        columns: [
          {
            width: '50%',
            text: [
              { text: 'Seller:\n', bold: true },
              'Your Company Ltd.\n',
              '123 Example Street, 00-000 Warsaw\n',
              'VAT ID: 123-456-78-90\n',
              'Email: invoices@yourcompany.com\n',
            ],
          },
          {
            width: '50%',
            text: [
              { text: 'Buyer:\n', bold: true },
              `${invoice.client?.name || ''}\n`,
              `Email: ${invoice.client?.email || ''}\n`,
              `NIP: ${invoice.client?.nip || ''}\n`,
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // Items table
      {
        table: {
          headerRows: 1,
          widths: [30, '*', 50, 60, 70],
          body: [
            [
              { text: 'No.', bold: true, alignment: 'center' },
              { text: 'Name', bold: true },
              { text: 'Quantity', bold: true, alignment: 'right' },
              { text: 'Price', bold: true, alignment: 'right' },
              { text: 'Value', bold: true, alignment: 'right' },
            ],
            ...items.map((item: any, idx: number) => [
              { text: idx + 1, alignment: 'center' },
              item.name,
              { text: item.quantity, alignment: 'right' },
              { text: item.unitPrice.toFixed(2), alignment: 'right' },
              { text: (item.total || 0).toFixed(2), alignment: 'right' },
            ]),
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20],
      },

      // Summary (right-aligned)
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 200,
            text: [
              `Net value: ${(invoice.data?.subtotal || 0).toFixed(2)} zł\n`,
              `VAT (${invoice.data?.vatRate || 23}%): ${(invoice.data?.vatAmount || 0).toFixed(2)} zł\n`,
              {
                text: `Total: ${(invoice.data?.total || 0).toFixed(2)} zł\n`,
                bold: true,
                fontSize: 14,
              },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // Notes (optional)
      ...(invoice.data?.notes
        ? [
            {
              text: `Notes: ${invoice.data.notes}`,
              fontSize: 11,
              margin: [0, 0, 0, 18],
            },
          ]
        : []),

      // Bank transfer details
      {
        text: 'Bank transfer details:',
        fontSize: 12,
        bold: true,
        decoration: 'underline',
        margin: [0, 10, 0, 5],
      },
      {
        text: [
          'Bank: Example Bank S.A.\n',
          'Account number: 12 1234 5678 9012 3456 7890 1234\n',
          'SWIFT: PRZAPLXX\n',
          'IBAN: PL12 1234 5678 9012 3456 7890 1234\n',
        ],
        fontSize: 11,
      },
    ],

    styles: {
      header: {
        fontSize: 20,
        bold: true,
      },
    },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const stream = fs.createWriteStream(filePath);

  pdfDoc.pipe(stream);
  pdfDoc.end();

  stream.on('finish', () => cb(fileName));
}

const { invoice, pdfPath } = workerData;

fs.mkdirSync(pdfPath, { recursive: true });

generateInvoicePDF(invoice, pdfPath, (fileName) => {
  if (parentPort) parentPort.postMessage(fileName);
});
