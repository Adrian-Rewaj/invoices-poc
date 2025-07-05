import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
console.log('RABBITMQ_URL', RABBITMQ_URL);
let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

export async function getRabbitMQConnection() {
  if (!connection) {
    connection = await amqp.connect(RABBITMQ_URL);
  }
  return connection;
}

export async function getRabbitMQChannel() {
  if (!channel) {
    const conn = await getRabbitMQConnection();
    channel = await conn.createChannel();
  }
  return channel;
}

export async function publishEvent(eventName: string, data: any) {
  try {
    const ch = await getRabbitMQChannel();
    console.log('ch', ch);
    const exchange = 'invoices';
    
    await ch.assertExchange(exchange, 'topic', { durable: true });
    
    ch.publish(exchange, eventName, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });
    
    console.log(`Event published: ${eventName}`, data);
  } catch (error) {
    console.error('Error publishing event:', error);
  }
}

export async function closeRabbitMQConnection() {
  if (channel) {
    await channel.close();
    channel = null;
  }
  if (connection) {
    await connection.close();
    connection = null;
  }
} 