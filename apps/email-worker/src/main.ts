import * as dotenv from 'dotenv';
import * as amqp from 'amqplib';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const RABBITMQ_INVOICE_SEND_QUEUE_NAME =
  process.env.RABBITMQ_INVOICE_SEND_QUEUE_NAME || 'invoice.send';
const RABBITMQ_INVOICE_SEND_DLQ_NAME =
  process.env.RABBITMQ_INVOICE_SEND_DLQ_NAME || 'invoice.send.dlq';
const RABBITMQ_DLX_NAME = process.env.RABBITMQ_DLX_NAME || 'invoices.dlx';
const PDF_STORAGE_PATH =
  process.env.PDF_STORAGE_PATH ||
  path.resolve(__dirname, '../../../storage/pdfs');

const SMTP_HOST = process.env.SMTP_HOST || 'localhost';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '1025');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'invoices@yourcompany.com';
const EMAIL_WORKER_RABBITMQ_CHANNEL_PREFETCH = parseInt(
  process.env.EMAIL_WORKER_RABBITMQ_CHANNEL_PREFETCH || '3',
  10,
);

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

async function main() {
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  channel.prefetch(EMAIL_WORKER_RABBITMQ_CHANNEL_PREFETCH);

  // --- Declare Dead Letter Exchange & Queue ---
  await channel.assertExchange(RABBITMQ_DLX_NAME, 'topic', { durable: true });
  await channel.assertQueue(RABBITMQ_INVOICE_SEND_DLQ_NAME, { durable: true });
  await channel.bindQueue(
    RABBITMQ_INVOICE_SEND_DLQ_NAME,
    RABBITMQ_DLX_NAME,
    RABBITMQ_INVOICE_SEND_DLQ_NAME,
  );

  // --- Declare main queue with DLX ---
  await channel.assertQueue(RABBITMQ_INVOICE_SEND_QUEUE_NAME, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': RABBITMQ_DLX_NAME,
      'x-dead-letter-routing-key': RABBITMQ_INVOICE_SEND_DLQ_NAME,
    },
  });

  console.log(
    ` [*] Waiting for messages in ${RABBITMQ_INVOICE_SEND_QUEUE_NAME}. To exit press CTRL+C`,
  );

  channel.consume(RABBITMQ_INVOICE_SEND_QUEUE_NAME, async (msg) => {
    if (!msg) return;

    const data = JSON.parse(msg.content.toString());
    console.log(' [x] Received invoice.send:', data);

    try {
      // Pobierz PDF
      const pdfPath = path.join(PDF_STORAGE_PATH, data.pdfFileName);
      const pdfBuffer = fs.readFileSync(pdfPath);

      // Wyślij e-mail
      const mailOptions = {
        from: SMTP_FROM,
        to: data.client?.email || 'test@example.com',
        subject: `Faktura VAT ${data.invoiceNumber}`,
        text: `Dzień dobry! W załączniku znajdziesz fakturę VAT. Link do płatności: http://localhost:3003/pay/${data.payToken}`,
        attachments: [
          {
            filename: data.pdfFileName,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      };
      await transporter.sendMail(mailOptions);
      console.log(' [>] E-mail sent to', mailOptions.to);

      // Aktualizuj status faktury z "draft" na "sent"
      const invoiceId = data.id || data.invoiceId;
      if (invoiceId) {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: 'sent', pdfFileName: data.pdfFileName },
        });
        console.log(
          ` [✓] Invoice ${invoiceId} status updated to 'sent' and pdfFileName set to '${data.pdfFileName}'`,
        );
      }

      channel.ack(msg); // ✅ ACK on success
    } catch (err) {
      console.error(' [!] E-mail worker error, sending to DLQ:', err);
      channel.nack(msg, false, false); // ❌ send to DLQ
    }
  });
}

main().catch((err) => {
  console.error('Worker bootstrap error:', err);
  process.exit(1);
});
