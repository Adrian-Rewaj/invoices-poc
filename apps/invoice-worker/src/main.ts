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
const RABBITMQ_INVOICE_CREATED_DLQ_NAME =
  process.env.RABBITMQ_INVOICE_CREATED_DLQ_NAME || 'invoice.created.dlq';
const RABBITMQ_DLX_NAME = process.env.RABBITMQ_DLX_NAME || 'invoices.dlx';
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

  await channel.assertExchange(RABBITMQ_DLX_NAME, 'topic', { durable: true });
  await channel.assertQueue(RABBITMQ_INVOICE_CREATED_DLQ_NAME, {
    durable: true,
  });
  await channel.bindQueue(
    RABBITMQ_INVOICE_CREATED_DLQ_NAME,
    RABBITMQ_DLX_NAME,
    RABBITMQ_INVOICE_CREATED_DLQ_NAME,
  );

  // Main Exchange
  await channel.assertExchange(RABBITMQ_EXCHANGE_NAME, 'topic', {
    durable: true,
  });

  // Main Queue with DLX settings
  const mainQueue = await channel.assertQueue(
    RABBITMQ_INVOICE_CREATED_QUEUE_NAME,
    {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': RABBITMQ_DLX_NAME,
        'x-dead-letter-routing-key': RABBITMQ_INVOICE_CREATED_DLQ_NAME,
      },
    },
  );

  await channel.bindQueue(
    mainQueue.queue,
    RABBITMQ_EXCHANGE_NAME,
    RABBITMQ_INVOICE_CREATED_QUEUE_NAME,
  );

  console.log(' [*] Exchange, queues and bindings asserted');
  console.log(
    ' [*] Waiting for messages in invoice.created. To exit press CTRL+C',
  );

  let activeWorkers = 0;

  channel.consume(mainQueue.queue, async (msg) => {
    if (!msg) return;

    if (activeWorkers >= INVOICE_WORKER_THREADS_LIMIT) {
      console.warn(' [!] Worker thread limit reached, requeueing message');
      channel.nack(msg, false, true); // requeue
      return;
    }

    activeWorkers++;
    const invoiceData = JSON.parse(msg.content.toString());
    console.log(' [x] Received invoice.created:', invoiceData);

    const worker = new Worker(path.resolve(__dirname, 'pdf.worker.js'), {
      workerData: { invoice: invoiceData, pdfPath: PDF_STORAGE_PATH },
    });

    // On success
    worker.once('message', async (pdfFileName) => {
      try {
        await prisma.invoice.update({
          where: { id: invoiceData.invoiceId || invoiceData.id },
          data: { pdfFileName, status: 'generated' },
        });

        const sendData = { ...invoiceData, pdfFileName };
        channel.sendToQueue(
          RABBITMQ_INVOICE_SEND_QUEUE_NAME,
          Buffer.from(JSON.stringify(sendData)),
          { persistent: true },
        );
        console.log(' [>] Sent invoice.send:', sendData);

        channel.ack(msg); // ✅ ACK only on success
      } catch (err) {
        console.error(' [!] Processing error, sending to DLQ:', err);
        channel.nack(msg, false, false); // ❌ send to DLQ
      } finally {
        activeWorkers--;
      }
    });

    // Worker error → DLQ
    worker.once('error', (err) => {
      console.error(' [!] PDF worker error, sending to DLQ:', err);
      activeWorkers--;
      channel.nack(msg, false, false);
    });

    // Worker exit
    worker.once('exit', (code) => {
      if (code !== 0) {
        console.error(` [!] PDF worker exited with code ${code}`);
      }
    });
  });
}

bootstrap().catch((err) => {
  console.error('Bootstrap error:', err);
  process.exit(1);
});
