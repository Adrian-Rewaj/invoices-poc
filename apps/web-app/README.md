# Web App - System Faktur

Główna aplikacja Next.js systemu faktur z interfejsem użytkownika.

![Dashboard aplikacji](../../assets/screen.png)

## 🚀 Opis

Web App to główna aplikacja systemu faktur, która zapewnia:
- **Dashboard** z listą klientów i faktur
- **Autentykację JWT** z bezpiecznym logowaniem
- **Zarządzanie klientami** z historią zmian
- **Tworzenie faktur** z modalnym edytorem pozycji
- **Pobieranie PDF** wygenerowanych faktur
- **API endpoints** dla innych aplikacji w systemie

## 🛠️ Technologie

- **Next.js 14** z App Router
- **TypeScript** dla type safety
- **Tailwind CSS** dla stylowania
- **Prisma ORM** dla bazy danych
- **JWT** dla autentykacji
- **RabbitMQ** dla komunikacji z workerami
- **Jest** dla testów jednostkowych
- **Playwright** dla testów E2E

## 🚀 Uruchomienie

```bash
# Instalacja zależności
npm install

# Uruchomienie w trybie deweloperskim
npm run dev

# Build produkcyjny
npm run build

# Uruchomienie produkcyjne
npm start
```

Aplikacja będzie dostępna na `http://localhost:3001`

## 🧪 Testy

```bash
# Testy jednostkowe
npm test

# Testy w trybie watch
npm run test:watch

# Testy z coverage
npm run test:coverage

# Testy E2E
npm run test:e2e

# Testy E2E z UI
npm run test:e2e:ui
```

### Rodzaje testów
- **Unit Tests**: Testy funkcji i komponentów (`__tests__/unit/`)
- **Integration Tests**: Testy API endpoints (`__tests__/integration/`)
- **E2E Tests**: Testy całego flow aplikacji (`tests/e2e/`)

Więcej informacji: [TESTING.md](./TESTING.md)

## 🔧 Konfiguracja

### Zmienne środowiskowe (.env)
```env
# Baza danych
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

## 📁 Struktura projektu

```
web-app/
├── app/                    # App Router (Next.js 14)
│   ├── api/               # API routes
│   │   ├── auth/          # Autentykacja
│   │   ├── clients/       # Zarządzanie klientami
│   │   ├── invoices/      # Zarządzanie fakturami
│   │   └── payments/      # Webhook płatności
│   ├── dashboard/         # Strona główna
│   ├── login/            # Strona logowania
│   ├── globals.css       # Style globalne
│   ├── layout.tsx        # Główny layout
│   ├── page.tsx          # Strona główna z przekierowaniem
│   └── favicon.ico       # Ikona aplikacji
├── lib/                   # Biblioteki
│   ├── auth.ts           # Autentykacja JWT
│   ├── cors.ts           # Konfiguracja CORS
│   ├── invoice.ts        # Logika faktur
│   ├── prisma.ts         # Klient Prisma
│   └── rabbitmq.ts       # Komunikacja RabbitMQ
├── prisma/               # Schema bazy danych
│   └── schema.prisma     # Model danych
├── components/           # Komponenty React
├── __tests__/           # Testy jednostkowe i integracyjne
│   ├── unit/            # Testy jednostkowe
│   └── integration/     # Testy integracyjne
├── tests/               # Testy E2E
│   └── e2e/            # Playwright tests
├── public/              # Pliki statyczne
└── jest.config.js       # Konfiguracja Jest
```

## 🔄 API Endpoints

### Autentykacja
- `POST /api/auth/login` - Logowanie użytkownika

### Klienci
- `GET /api/clients` - Lista klientów
- `POST /api/clients` - Dodanie nowego klienta
- `PUT /api/clients/[id]` - Edycja klienta z historią

### Faktury
- `GET /api/invoices` - Lista faktur
- `POST /api/invoices` - Utworzenie nowej faktury
- `GET /api/invoices/[id]/pdf` - Pobieranie PDF
- `GET /api/invoices/by-token/[token]` - Faktura po tokenie

### Płatności
- `POST /api/payments/webhook` - Webhook z weryfikacją podpisu

## 🔐 Bezpieczeństwo

- **JWT**: Tokeny z 24h expiration
- **bcrypt**: Hasła hashowane z salt rounds 10
- **CORS**: Poprawnie skonfigurowane nagłówki
- **Webhook signature**: Weryfikacja podpisu płatności
- **Prisma**: Zabezpieczenia przed SQL injection

## 📊 Funkcjonalności

### Dashboard
- Lista klientów z możliwością dodawania/edycji
- Lista faktur z statusami (draft, sent, paid)
- Pobieranie PDF faktur
- Podgląd szczegółów faktury

### Zarządzanie klientami
- Dodawanie nowych klientów
- Edycja danych klientów
- Historia zmian z timestampami
- Walidacja danych

### Tworzenie faktur
- Modalny edytor pozycji faktury
- Automatyczne obliczanie kwot
- Walidacja danych
- Publikowanie eventów do RabbitMQ

### Statusy faktur
- **draft** (żółty): Faktura utworzona
- **sent** (niebieski): PDF wygenerowany, email wysłany
- **paid** (zielony): Płatność zrealizowana

## 🔗 Integracje

- **invoice-worker**: Odbiera eventy `invoice.created`
- **email-worker**: Dostarcza dane faktur przez API
- **pay-mock**: Odbiera webhook płatności
- **RabbitMQ**: Komunikacja event-driven
- **PostgreSQL**: Baza danych z Prisma ORM

## 🐳 Docker

Aplikacja może być uruchomiona w kontenerze Docker:

```bash
# Build
docker build -t web-app .

# Uruchomienie
docker run -p 3001:3001 web-app
```

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź logi: `npm run dev`
2. Sprawdź bazy danych: `npx prisma studio`
3. Sprawdź RabbitMQ: http://localhost:15672
4. Sprawdź testy: `npm test`
5. Reset: `npm run clean && npm install`
