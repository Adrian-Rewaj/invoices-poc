import { parentPort, workerData } from 'worker_threads';
import * as fs from 'fs';
import * as path from 'path';

function generatePdfFileName(invoice: any) {
  const safeNumber = (invoice.invoiceNumber || invoice.id || Date.now()).replace(/[\\/]/g, '_');
  return `faktura-${safeNumber}.pdf`;
}

function generateInvoicePDF(invoice: any, pdfPath: string, cb: (fileName: string) => void) {
  const fileName = generatePdfFileName(invoice);
  const filePath = path.join(pdfPath, fileName);
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ margin: 40 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Użyj fontu z polskimi znakami
  doc.registerFont('dejavu', path.resolve(__dirname, '../../../assets/DejaVuSans.ttf'));
  doc.font('dejavu');

  // Nagłówek
  doc.fontSize(20).text(`FAKTURA VAT`, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Nr: ${invoice.invoiceNumber || ''}`, { align: 'center' });
  doc.moveDown(1.5);

  // Dane sprzedawcy i nabywcy w dwóch kolumnach
  const seller = [
    'Sprzedawca:',
    'Twoja Firma Sp. z o.o.',
    'ul. Przykładowa 123, 00-000 Warszawa',
    'NIP: 123-456-78-90',
    'Email: faktury@twojafirma.pl',
  ];
  const buyer = [
    'Nabywca:',
    invoice.client?.name || '',
    `Email: ${invoice.client?.email || ''}`,
    `NIP: ${invoice.client?.nip || ''}`,
  ];
  const startY = doc.y;
  doc.fontSize(12).text(seller.join('\n'), 40, startY);
  doc.fontSize(12).text(buyer.join('\n'), 320, startY);
  doc.moveDown(5);

  // Daty
  doc.fontSize(11).text(`Data wystawienia: ${invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('pl-PL') : ''}`);
  doc.fontSize(11).text(`Termin płatności: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('pl-PL') : ''}`);
  doc.moveDown(1.5);

  // Tabelka z pozycjami
  const tableTop = doc.y;
  const itemCols = [40, 70, 270, 320, 370, 440]; // x positions
  doc.fontSize(12).text('Lp.', itemCols[0], tableTop, { width: 30, align: 'center' });
  doc.text('Nazwa', itemCols[1], tableTop, { width: 200 });
  doc.text('Ilość', itemCols[2], tableTop, { width: 50, align: 'right' });
  doc.text('Cena', itemCols[3], tableTop, { width: 50, align: 'right' });
  doc.text('Wartość', itemCols[4], tableTop, { width: 70, align: 'right' });
  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(540, doc.y).stroke();

  const items = invoice.data?.items || [];
  let y = doc.y + 2;
  items.forEach((item: any, idx: number) => {
    doc.fontSize(11).text(`${idx + 1}`, itemCols[0], y, { width: 30, align: 'center' });
    doc.text(item.name, itemCols[1], y, { width: 200 });
    doc.text(item.quantity, itemCols[2], y, { width: 50, align: 'right' });
    doc.text(item.unitPrice.toFixed(2), itemCols[3], y, { width: 50, align: 'right' });
    doc.text((item.total || 0).toFixed(2), itemCols[4], y, { width: 70, align: 'right' });
    y += 18;
  });
  doc.moveTo(40, y).lineTo(540, y).stroke();
  y += 10;

  // Podsumowanie
  doc.fontSize(12).text(`Wartość netto: ${(invoice.data?.subtotal || 0).toFixed(2)} zł`, 370, y);
  y += 16;
  doc.text(`VAT (${invoice.data?.vatRate || 23}%): ${(invoice.data?.vatAmount || 0).toFixed(2)} zł`, 370, y);
  y += 16;
  doc.fontSize(14).text(`Razem: ${(invoice.data?.total || 0).toFixed(2)} zł`, 370, y, { bold: true });
  y += 24;

  // Uwagi
  if (invoice.data?.notes) {
    doc.fontSize(11).text(`Uwagi: ${invoice.data.notes}`, 40, y);
    y += 18;
  }

  // Dane do przelewu
  doc.moveDown(2);
  doc.fontSize(12).text('Dane do przelewu:', { underline: true });
  doc.text('Bank: Przykładowy Bank S.A.');
  doc.text('Nr konta: 12 1234 5678 9012 3456 7890 1234');
  doc.text('SWIFT: PRZAPLXX');
  doc.text('IBAN: PL12 1234 5678 9012 3456 7890 1234');

  doc.end();
  stream.on('finish', () => cb(fileName));
}

const { invoice, pdfPath } = workerData;
fs.mkdirSync(pdfPath, { recursive: true });
generateInvoicePDF(invoice, pdfPath, (fileName) => {
  if (parentPort) parentPort.postMessage(fileName);
}); 