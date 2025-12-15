# Email Worker - Sending Emails with Invoices

Nest.js worker for automatically sending emails with attached PDF invoices.

## 🚀 Description

Email Worker is an Nest.js application that:

- Listens to `invoice.send` events from RabbitMQ
- Retrieves invoice and client data from database
- Sends email with attached PDF invoice
- Adds payment link in email content
- Updates invoice status to "sent"

## 🛠️ Technologies

- **Nest.js** - Node.js framework
- **TypeScript** - Type safety
- **nodemailer** - Email sending
- **RabbitMQ** - Event-driven communication
- **Prisma** - ORM for database
- **SMTP** - Email sending protocol

## 🚀 Setup

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Production start
npm start

# Build
npm run build
```

## 🔧 Configuration

### Environment variables (.env)

```env
# Database
DATABASE_URL="postgresql://invoices_user:invoices_password@localhost:5432/invoices_db"

# RabbitMQ
RABBITMQ_URL="amqp://invoices_user:invoices_password@localhost:5672"

# SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Email
FROM_EMAIL="noreply@faktury.pl"
FROM_NAME="Invoice System"

# Payment
PAYMENT_BASE_URL="http://localhost:3003"
```

## 📁 Project Structure

```
email-worker/
├── src/
│   ├── app.ts            # Main Express application
│   ├── server.ts         # Entry point
│   ├── services/         # Services
│   │   ├── email.service.ts
│   │   ├── invoice.service.ts
│   │   └── rabbitmq.service.ts
│   ├── templates/        # Email templates
│   │   └── invoice-email.html
│   └── types/           # TypeScript types
│       └── index.ts
├── prisma/              # Database schema
│   └── schema.prisma
└── package.json
```

## 🔄 Work Flow

1. **Event reception**: Worker listens to `invoice.send` from RabbitMQ
2. **Data retrieval**: Retrieves invoice, client and PDF data from database
3. **Email generation**: Creates email with HTML template
4. **PDF attachment**: Adds generated PDF as attachment
5. **Sending**: Sends email via SMTP
6. **Status update**: Changes invoice status to "sent"

## 📧 Email Template

### HTML Template

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Invoice {{invoiceNumber}}</title>
  </head>
  <body>
    <h2>Invoice {{invoiceNumber}}</h2>
    <p>Hello {{clientName}},</p>
    <p>Please find attached invoice {{invoiceNumber}}.</p>
    <p>Amount to pay: {{totalAmount}} zł</p>
    <p>Due date: {{dueDate}}</p>

    <div style="margin: 20px 0;">
      <a
        href="{{paymentUrl}}"
        style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;"
      >
        Pay now
      </a>
    </div>

    <p>Best regards,<br />Invoice System</p>
  </body>
</html>
```

### Email example

```
From: Invoice System <noreply@faktury.pl>
To: client@example.com
Subject: Invoice INV-2024-001

Hello Jan Kowalski,

Please find attached invoice INV-2024-001.

Amount to pay: 369,00 zł
Due date: 2024-02-15

[Pay now] - http://localhost:3003/pay/abc123

Best regards,
Invoice System

Attachments:
- faktura_INV-2024-001.pdf
```

## 🔗 Integrations

### RabbitMQ Events

- **Receives**: `invoice.send` - PDF generated, ready to send

### Database

- **Read**: Retrieves invoice, client and PDF filename data
- **Write**: Updates invoice status to "sent"

### API

- **Web-app**: Provides invoice data through Prisma ORM
- **Pay-mock**: Generates payment link

### SMTP

- **Gmail**: SMTP with OAuth2 authorization
- **Others**: Any SMTP server

## 🔐 Security

- **SMTP Auth**: Secure SMTP authorization
- **Email Validation**: Email address validation
- **Error Handling**: Email sending error handling
- **Rate Limiting**: Email sending rate limiting
- **Logging**: All operations logging

## 📊 Monitoring

### Logs

```bash
# Check logs
npm run dev

# RabbitMQ logs
docker-compose logs rabbitmq
```

### Email statuses

- **Pending**: Email in queue
- **Sent**: Email sent successfully
- **Failed**: Sending error
- **Bounced**: Email returned

## 🐳 Docker

```bash
# Build
docker build -t email-worker .

# Run
docker run --env-file .env email-worker
```

## 📞 Support

In case of issues:

1. Check logs: `npm run dev`
2. Check RabbitMQ: http://localhost:15672
3. Check SMTP: `telnet smtp.gmail.com 587`
4. Check database: `npx prisma studio`
5. Reset: `npm run clean && npm install`

## 📧 SMTP Configuration

### Gmail

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Other servers

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=username
SMTP_PASS=password
```
