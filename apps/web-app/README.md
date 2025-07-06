# Web App - Invoice System

Main Next.js application of the invoice system with user interface.

![Application Dashboard](../../assets/screen.png)

## 🚀 Description

Web App is the main application of the invoice system that provides:
- **Dashboard** with list of clients and invoices
- **JWT Authentication** with secure login
- **Client Management** with change history
- **Invoice Creation** with modal item editor
- **PDF Download** of generated invoices
- **API endpoints** for other applications in the system

## 🛠️ Technologies

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Prisma ORM** for database
- **JWT** for authentication
- **RabbitMQ** for communication with workers
- **Jest** for unit tests
- **Playwright** for E2E tests

## 🚀 Setup

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Production build
npm run build

# Production start
npm start
```

Application will be available at `http://localhost:3001`

## 🧪 Testing

```bash
# Unit tests
npm test

# Tests in watch mode
npm run test:watch

# Tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

### Test types
- **Unit Tests**: Function and component tests (`__tests__/unit/`)
- **Integration Tests**: API endpoint tests (`__tests__/integration/`)
- **E2E Tests**: Full application flow tests (`tests/e2e/`)

More information: [TESTING.md](./TESTING.md)

## 🔧 Configuration

### Environment variables (.env)
```env
# Database
DATABASE_URL="postgresql://invoices_user:invoices_password@localhost:5433/invoices_db"

# JWT
JWT_SECRET="your-secret-key"

# RabbitMQ
RABBITMQ_URL="amqp://invoices_user:invoices_password@localhost:5672"

# Webhook
PAYMENT_SIGNATURE="sekretnasygnatura"

# PDF Storage
PDF_STORAGE_PATH="/var/www/html/development/invoices-poc/storage/pdfs"
```

## 📁 Project Structure

```
web-app/
├── app/                    # App Router (Next.js 14)
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication
│   │   ├── clients/       # Client management
│   │   ├── invoices/      # Invoice management
│   │   └── payments/      # Payment webhook
│   ├── dashboard/         # Main page
│   ├── login/            # Login page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Main layout
│   ├── page.tsx          # Main page with redirect
│   └── favicon.ico       # Application icon
├── lib/                   # Libraries
│   ├── auth.ts           # JWT authentication
│   ├── cors.ts           # CORS configuration
│   ├── invoice.ts        # Invoice logic
│   ├── prisma.ts         # Prisma client
│   └── rabbitmq.ts       # RabbitMQ communication
├── prisma/               # Database schema
│   └── schema.prisma     # Data model
├── components/           # React components
├── __tests__/           # Unit and integration tests
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── tests/               # E2E tests
│   └── e2e/            # Playwright tests
├── public/              # Static files
└── jest.config.js       # Jest configuration
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Clients
- `GET /api/clients` - Client list
- `POST /api/clients` - Add new client
- `PUT /api/clients/[id]` - Edit client with history

### Invoices
- `GET /api/invoices` - Invoice list
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/[id]/pdf` - Download PDF
- `GET /api/invoices/by-token/[token]` - Invoice by token

### Payments
- `POST /api/payments/webhook` - Webhook with signature verification

## 🔐 Security

- **JWT**: Tokens with 24h expiration
- **bcrypt**: Passwords hashed with salt rounds 10
- **CORS**: Properly configured headers
- **Webhook signature**: Payment signature verification
- **Prisma**: Protection against SQL injection

## 📊 Features

### Dashboard
- Client list with add/edit capabilities
- Invoice list with statuses (draft, sent, paid)
- PDF invoice download
- Invoice details preview

### Client Management
- Adding new clients
- Editing client data
- Change history with timestamps
- Data validation

### Invoice Creation
- Modal invoice item editor
- Automatic amount calculations
- Data validation
- Publishing events to RabbitMQ

### Invoice Statuses
- **draft** (yellow): Invoice created
- **sent** (blue): email sent
- **paid** (green): Payment completed

## 🔗 Integrations

- **invoice-worker**: Receives `invoice.created` events
- **email-worker**: Provides invoice data through API
- **pay-mock**: Receives payment webhooks
- **RabbitMQ**: Event-driven communication
- **PostgreSQL**: Database with Prisma ORM

## 🐳 Docker

Application can be run in Docker container:

```bash
# Build
docker build -t web-app .

# Run
docker run -p 3001:3001 web-app
```

## 📞 Support

In case of issues:
1. Check logs: `npm run dev`
2. Check database: `npx prisma studio`
3. Check RabbitMQ: http://localhost:15672
4. Check tests: `npm test`
5. Reset: `npm run clean && npm install`
