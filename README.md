# System Faktur - Monorepo

Nowoczesny system faktur zbudowany jako monorepo z czterema aplikacjami JavaScript:
- **web-app** (Next.js) - Aplikacja główna z interfejsem użytkownika
- **invoice-worker** (Nest.js) - Worker do generowania PDF faktur
- **email-worker** (Express.js) - Worker do wysyłania emaili
- **pay-mock** (Express.js) - Mock aplikacja do symulacji płatności

![Dashboard aplikacji](assets/screen.png)

## 🚀 Szybki start

### Wymagania
- Node.js 18+
- Docker i Docker Compose
- npm

### Uruchomienie

1. **Klonowanie i instalacja**
```bash
git clone <repository-url>
cd invoices-poc
npm install
```

2. **Uruchomienie środowiska**
```bash
# Uruchomienie wszystkich kontenerów (PostgreSQL, RabbitMQ)
npm run docker:up

# Uruchomienie wszystkich aplikacji
npm run dev
```

3. **Dostęp do aplikacji**
- **Aplikacja główna**: http://localhost:3001
- **Pay Mock**: http://localhost:3003
- **RabbitMQ Management**: http://localhost:15672 (użytkownik: invoices_user, hasło: invoices_password)
- **PostgreSQL**: localhost:5433

### Domyślne dane logowania
- **Login**: dev
- **Hasło**: dev

## 🧪 Testy

### Testy w całym monorepo
```bash
# Wszystkie testy
npm run test

# Testy z coverage
npm run test:coverage

# Testy E2E
npm run test:e2e
```

### Testy w poszczególnych aplikacjach
```bash
# Web App
cd apps/web-app && npm test

# Invoice Worker
cd apps/invoice-worker && npm test

# Email Worker
cd apps/email-worker && npm test

# Pay Mock
cd apps/pay-mock && npm test
```

### Rodzaje testów
- **Unit Tests**: Testy funkcji i komponentów
- **Integration Tests**: Testy API i integracji
- **E2E Tests**: Testy całego flow aplikacji (Playwright)

## 📁 Struktura projektu

```
invoices-poc/
├── apps/
│   ├── web-app/          # Aplikacja Next.js (App Router + TypeScript)
│   │   ├── app/          # Strony i API routes
│   │   ├── lib/          # Biblioteki (Prisma, Auth, RabbitMQ)
│   │   ├── prisma/       # Schema bazy danych
│   │   ├── __tests__/    # Testy jednostkowe i integracyjne
│   │   └── tests/        # Testy E2E
│   ├── invoice-worker/    # Worker do generowania PDF
│   ├── email-worker/      # Worker do wysyłania emaili
│   └── pay-mock/         # Mock aplikacja płatności
├── storage/              # Pliki PDF i uploads
├── assets/               # Zasoby (fonty, etc.)
├── docker-compose.yml    # Konfiguracja Docker
├── turbo.json           # Konfiguracja monorepo
└── package.json         # Główny package.json
```

## 🔧 Funkcjonalności

### ✅ Zaimplementowane
- **Autentykacja JWT**: Logowanie z hasłem bcrypt
- **Dashboard**: Lista klientów i faktur z statusami (draft, sent, paid)
- **Zarządzanie klientami**: Dodawanie i edycja klientów z historią zmian
- **Zarządzanie fakturami**: Tworzenie faktur z pozycjami w modalnym edytorze
- **Generowanie PDF**: Automatyczne generowanie faktur PDF z polskimi znakami (DejaVu Sans)
- **Wysyłanie emaili**: Automatyczne wysyłanie faktur email z linkiem do płatności
- **System płatności**: Mock aplikacja do symulacji płatności z webhook
- **Event-driven**: RabbitMQ dla komunikacji między aplikacjami
- **Docker**: Kompletne środowisko kontenerowe
- **Monorepo**: Turborepo z npm workspaces
- **Testy**: Unit, integration i E2E tests

### 🔄 API Endpoints
- `POST /api/auth/login` - Logowanie użytkownika
- `GET /api/clients` - Lista klientów
- `POST /api/clients` - Dodanie nowego klienta
- `PUT /api/clients/[id]` - Edycja klienta z historią zmian
- `GET /api/invoices` - Lista faktur
- `POST /api/invoices` - Utworzenie nowej faktury
- `GET /api/invoices/[id]/pdf` - Pobieranie PDF faktury
- `GET /api/invoices/by-token/[token]` - Pobieranie faktury po tokenie płatności
- `POST /api/payments/webhook` - Webhook płatności z weryfikacją podpisu

### 🗄️ Model bazy danych
```sql
User (id, username, passwordHash, createdAt)
Client (id, name, email, nip, createdAt)
Invoice (id, clientId, userId, issueDate, dueDate, invoiceNumber, data, pdfFileName, status, payToken)
ClientChangeLog (id, clientId, userId, changedAt, before, after, field)
```

## 🐳 Docker

### Kontenery
- **PostgreSQL**: Baza danych (port 5433)
- **RabbitMQ**: Message broker (port 5672, management 15672)

### Komendy Docker
```bash
# Uruchomienie
docker-compose up -d

# Zatrzymanie
docker-compose down

# Rebuild
docker-compose build

# Logi
docker-compose logs -f
```

## 🛠️ Rozwój

### Skrypty npm
```bash
# Uruchomienie wszystkich aplikacji w trybie deweloperskim
npm run dev

# Build wszystkich aplikacji
npm run build

# Linting
npm run lint

# Type checking
npm run type-check

# Testy
npm run test
npm run test:coverage
npm run test:e2e

# Docker
npm run docker:up
npm run docker:down
npm run docker:logs
```

### Aplikacje
- **web-app** (port 3001): Next.js z TypeScript, Tailwind CSS, Prisma
- **invoice-worker**: Nest.js worker do generowania PDF z pdfkit
- **email-worker**: Express.js worker do wysyłania emaili z nodemailer
- **pay-mock** (port 3003): Express.js mock płatności z webhook

## 🔄 Flow aplikacji

1. **Tworzenie faktury**: Użytkownik tworzy fakturę w web-app z pozycjami
2. **Event invoice.created**: Web-app publikuje event do RabbitMQ z danymi faktury
3. **Generowanie PDF**: invoice-worker odbiera event i generuje PDF z polskimi znakami
4. **Event invoice.send**: invoice-worker publikuje event z nazwą wygenerowanego PDF
5. **Wysyłanie emaila**: email-worker odbiera event i wysyła email z PDF i linkiem do płatności
6. **Aktualizacja statusu**: email-worker aktualizuje status faktury na "sent"
7. **Płatność**: Użytkownik klika link w emailu i płaci przez pay-mock
8. **Webhook**: pay-mock wysyła webhook do web-app z podpisem
9. **Status "paid"**: Web-app weryfikuje podpis i aktualizuje status faktury na "paid"

## 🔐 Bezpieczeństwo

- **Hasła**: bcrypt z salt rounds 10
- **JWT**: 24h expiration z refresh token
- **Webhook signature**: Weryfikacja podpisu webhooków (X-PAYMENT-SIGNATURE)
- **CORS**: Poprawnie skonfigurowane nagłówki CORS dla cross-origin requests
- **Baza danych**: Izolowane kontenery Docker
- **Environment variables**: Konfiguracja przez .env w każdej aplikacji
- **SQL Injection**: Zabezpieczenia przez Prisma ORM

## 📊 Statusy faktur

- **draft** (żółty): Faktura utworzona, czeka na generowanie PDF
- **sent** (niebieski): PDF wygenerowany, email wysłany
- **paid** (zielony): Płatność zrealizowana

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź logi: `docker-compose logs`
2. Restart kontenerów: `docker-compose restart`
3. Reset bazy: `docker-compose down -v && docker-compose up -d`
4. Sprawdź status aplikacji: `npm run dev`
5. Sprawdź RabbitMQ: http://localhost:15672
6. Sprawdź bazy danych: `docker-compose exec postgres psql -U invoices_user -d invoices_db`
7. Sprawdź testy: `npm test` 