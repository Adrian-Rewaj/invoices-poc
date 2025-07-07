# Invoice Worker - PDF Invoice Generator

Nest.js worker for automatically generating PDF invoices with Polish characters.

## 🚀 Description

Invoice Worker is a Nest.js application that:
- Listens to `invoice.created` events from RabbitMQ
- Generates PDF invoice with Polish characters (DejaVu Sans)
- Saves PDF in storage/pdfs/
- Updates database with generated file name
- Publishes `invoice.send` event with PDF name

## 🛠️ Technologies

- **Nest.js** - Node.js framework
- **TypeScript** - Type safety
- **pdfkit** - PDF generation
- **RabbitMQ** - Event-driven communication
- **Prisma** - ORM for database
- **Worker Threads** - Asynchronous PDF generation

## 🚀 Setup

```bash
# Install dependencies
npm install

# Start in development mode
npm run start:dev

# Production start
npm run start:prod

# Build
npm run build
```

## 🔧 Configuration

### Environment variables (.env)
```env
# Database
DATABASE_URL="postgresql://invoices_user:invoices_password@localhost:5433/invoices_db"

# RabbitMQ
RABBITMQ_URL="amqp://invoices_user:invoices_password@localhost:5672"

# PDF Storage
PDF_STORAGE_PATH="/var/www/html/development/invoices-poc/storage/pdfs"

# Fonts
FONT_PATH="/var/www/html/development/invoices-poc/assets/fonts/DejaVuSans.ttf"
```

## 📁 Project Structure

```
invoice-worker/
├── src/
│   ├── app.module.ts      # Main application module
│   ├── main.ts           # Entry point
│   ├── invoice/          # Invoice module
│   │   ├── invoice.controller.ts
│   │   ├── invoice.service.ts
│   │   └── invoice.module.ts
│   ├── pdf/              # PDF module
│   │   ├── pdf.service.ts
│   │   └── pdf.module.ts
│   └── rabbitmq/         # RabbitMQ configuration
│       └── rabbitmq.module.ts
├── prisma/               # Database schema
│   └── schema.prisma
└── package.json
```

## 🔄 Work Flow

1. **Event reception**: Worker listens to `invoice.created` from RabbitMQ
2. **Data retrieval**: Retrieves invoice data from database
3. **PDF generation**: Creates PDF with Polish characters using pdfkit
4. **File saving**: Saves PDF in storage/pdfs/ with unique name
5. **Database update**: Updates invoice with generated PDF name
6. **Event publishing**: Sends `invoice.send` with PDF name

## 📄 PDF Generation

### Features
- **Polish characters**: Uses DejaVu Sans font for Polish characters
- **Layout**: Professional invoice layout with logo
- **Client data**: Full client and invoice data
- **Items**: List of items with amounts
- **Totals**: Automatic total calculations
- **Filenames**: Safe filenames without special characters

### PDF example
```
┌─────────────────────────────────────┐
│           VAT INVOICE              │
│  No: INV-2024-001                 │
│  Issue date: 2024-01-15           │
│  Due date: 2024-02-15             │
├─────────────────────────────────────┤
│ SELLER:                            │
│ Company XYZ Sp. z o.o.            │
│ ul. Example 1, 00-000 Warsaw      │
│ NIP: 1234567890                   │
├─────────────────────────────────────┤
│ BUYER:                             │
│ Client ABC                         │
│ ul. Test 5, 01-234 Krakow         │
│ NIP: 0987654321                   │
├─────────────────────────────────────┤
│ ITEMS:                             │
│ 1. Service A - 100,00 zł          │
│ 2. Product B - 200,00 zł          │
├─────────────────────────────────────┤
│ TOTAL: 300,00 zł                  │
│ VAT (23%): 69,00 zł               │
│ TO PAY: 369,00 zł                 │
└─────────────────────────────────────┘
```

## 🔗 Integrations

### RabbitMQ Events
- **Receives**: `invoice.created` - New invoice to generate
- **Publishes**: `invoice.send` - PDF generated, ready to send

### Database
- **Read**: Retrieves invoice and client data
- **Write**: Updates invoice with PDF name

### API
- **Web-app**: Provides invoice data through Prisma ORM

## 🔐 Security

- **Worker Threads**: Asynchronous PDF generation
- **Error Handling**: PDF generation error handling
- **File Validation**: File correctness checking
- **Database Transactions**: Safe database updates

## 📊 Monitoring

### Logs
```bash
# Check logs
npm run start:dev

# RabbitMQ logs
docker-compose logs rabbitmq
```

### Statuses
- **Processing**: PDF generation in progress
- **Success**: PDF generated successfully
- **Error**: PDF generation error

## 🐳 Docker

```bash
# Build
docker build -t invoice-worker .

# Run
docker run --env-file .env invoice-worker
```

## 📞 Support

In case of issues:
1. Check logs: `npm run start:dev`
2. Check RabbitMQ: http://localhost:15672
3. Check storage: `ls -la storage/pdfs/`
4. Check database: `npx prisma studio`
5. Reset: `npm run clean && npm install`

## 📂 Required directories

Before running the worker, make sure the following directory exists:

```bash
mkdir -p storage/pdfs/
```

This is where generated PDF invoices will be saved.
