import * as dotenv from 'dotenv';
import * as amqp from 'amqplib';
import { Worker } from 'worker_threads';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const RABBITMQ_INVOICE_CREATED_QUEUE_NAME =
  process.env.RABBITMQ_INVOICE_CREATED_QUEUE_NAME || 'invoice.created';
const RABBITMQ_INVOICE_SEND_QUEUE_NAME =
  process.env.RABBITMQ_INVOICE_SEND_QUEUE_NAME || 'invoice.send';
const RABBITMQ_EXCHANGE_NAME = process.env.RABBITMQ_EXCHANGE_NAME || 'invoices';
const PDF_STORAGE_PATH =
  process.env.PDF_STORAGE_PATH || path.resolve(__dirname, '../../storage/pdfs');
const prisma = new PrismaClient();

const INVOICE_WORKER_RABBITMQ_CHANNEL_PREFETCH = parseInt(
  process.env.INVOICE_WORKER_RABBITMQ_CHANNEL_PREFETCH || '3',
  10,
);
const INVOICE_WORKER_THREADS_LIMIT = parseInt(
  process.env.INVOICE_WORKER_THREADS_LIMIT || '3',
  10,
);

async function bootstrap() {
  console.log(' [*] Connecting to RabbitMQ:', RABBITMQ_URL);
  const conn = await amqp.connect(RABBITMQ_URL);
  console.log(' [*] Connected to RabbitMQ successfully');

  const channel = await conn.createChannel();
  console.log(' [*] Channel created');

  // Set prefetch
  channel.prefetch(INVOICE_WORKER_RABBITMQ_CHANNEL_PREFETCH);

  // Exchange and binding
  await channel.assertExchange(RABBITMQ_EXCHANGE_NAME, 'topic', {
    durable: true,
  });
  const q = await channel.assertQueue(RABBITMQ_INVOICE_CREATED_QUEUE_NAME, {
    durable: true,
  });
  await channel.bindQueue(
    q.queue,
    RABBITMQ_EXCHANGE_NAME,
    RABBITMQ_INVOICE_CREATED_QUEUE_NAME,
  );
  await channel.assertQueue(RABBITMQ_INVOICE_SEND_QUEUE_NAME, {
    durable: true,
  });
  console.log(' [*] Exchange, queues and bindings asserted');

  console.log(
    ' [*] Waiting for messages in invoice.created. To exit press CTRL+C',
  );

  let activeWorkers = 0;

  channel.consume(q.queue, async (msg) => {
    if (msg) {
      if (activeWorkers >= INVOICE_WORKER_THREADS_LIMIT) {
        // Thread limit reached, requeue message and wait
        console.warn(' [!] Worker thread limit reached, requeueing message');
        channel.nack(msg, false, true); // requeue
        return;
      }
      activeWorkers++;
      console.log(' [x] Received invoice.created message');
      const invoiceData = JSON.parse(msg.content.toString());
      console.log(' [x] Received invoice.created:', invoiceData);

      // Generate PDF in worker
      const worker = new Worker(path.resolve(__dirname, 'pdf.worker.js'), {
        workerData: { invoice: invoiceData, pdfPath: PDF_STORAGE_PATH },
      });

      worker.on('message', async (pdfFileName) => {
        try {
          // Update database with PDF file name and status "generated"
          await prisma.invoice.update({
            where: { id: invoiceData.invoiceId || invoiceData.id },
            data: {
              pdfFileName,
              status: 'generated',
            },
          });
          console.log(
            ` [✓] Invoice ${invoiceData.invoiceId || invoiceData.id} pdfFileName updated to '${pdfFileName}' and status set to 'generated'`,
          );
          // After PDF is generated, send to invoice.send
          const sendData = { ...invoiceData, pdfFileName };
          channel.sendToQueue(
            RABBITMQ_INVOICE_SEND_QUEUE_NAME,
            Buffer.from(JSON.stringify(sendData)),
            { persistent: true },
          );
          console.log(' [>] Sent invoice.send:', sendData);
        } catch (error) {
          console.error('Error updating invoice with PDF filename:', error);
        }
      });

      worker.on('error', (err) => {
        console.error('PDF worker error:', err);
      });

      worker.on('exit', (code) => {
        activeWorkers--;
        if (code !== 0) {
          console.error(`PDF worker stopped with exit code ${code}`);
        }
        // Optionally, you can add logic here to re-fetch the message if the worker crashed
      });

      channel.ack(msg);
    }
  });
}

bootstrap().catch((err) => {
  console.error('Bootstrap error:', err);
  process.exit(1);
});
