# Invoice Worker - Generator PDF Faktur

Worker Nest.js do automatycznego generowania PDF faktur z polskimi znakami.

## 🚀 Opis

Invoice Worker to aplikacja Nest.js, która:
- Nasłuchuje eventów `invoice.created` z RabbitMQ
- Generuje PDF faktury z polskimi znakami (DejaVu Sans)
- Zapisuje PDF w storage/pdfs/
- Aktualizuje bazę danych z nazwą wygenerowanego pliku
- Publikuje event `invoice.send` z nazwą PDF

## 🛠️ Technologie

- **Nest.js** - Framework Node.js
- **TypeScript** - Type safety
- **pdfkit** - Generowanie PDF
- **RabbitMQ** - Komunikacja event-driven
- **Prisma** - ORM dla bazy danych
- **Worker Threads** - Asynchroniczne generowanie PDF

## 🚀 Uruchomienie

```bash
# Instalacja zależności
npm install

# Uruchomienie w trybie deweloperskim
npm run start:dev

# Uruchomienie produkcyjne
npm run start:prod

# Build
npm run build
```

## 🔧 Konfiguracja

### Zmienne środowiskowe (.env)
```env
# Baza danych
DATABASE_URL="postgresql://invoices_user:invoices_password@localhost:5433/invoices_db"

# RabbitMQ
RABBITMQ_URL="amqp://invoices_user:invoices_password@localhost:5672"

# PDF Storage
PDF_STORAGE_PATH="/var/www/html/development/invoices-poc/storage/pdfs"

# Fonty
FONT_PATH="/var/www/html/development/invoices-poc/assets/fonts/DejaVuSans.ttf"
```

## 📁 Struktura projektu

```
invoice-worker/
├── src/
│   ├── app.module.ts      # Główny moduł aplikacji
│   ├── main.ts           # Entry point
│   ├── invoice/          # Moduł faktur
│   │   ├── invoice.controller.ts
│   │   ├── invoice.service.ts
│   │   └── invoice.module.ts
│   ├── pdf/              # Moduł PDF
│   │   ├── pdf.service.ts
│   │   └── pdf.module.ts
│   └── rabbitmq/         # Konfiguracja RabbitMQ
│       └── rabbitmq.module.ts
├── prisma/               # Schema bazy danych
│   └── schema.prisma
└── package.json
```

## 🔄 Flow pracy

1. **Odbieranie eventu**: Worker nasłuchuje `invoice.created` z RabbitMQ
2. **Pobieranie danych**: Pobiera dane faktury z bazy danych
3. **Generowanie PDF**: Tworzy PDF z polskimi znakami używając pdfkit
4. **Zapisywanie pliku**: Zapisuje PDF w storage/pdfs/ z unikalną nazwą
5. **Aktualizacja bazy**: Aktualizuje fakturę z nazwą wygenerowanego PDF
6. **Publikowanie eventu**: Wysyła `invoice.send` z nazwą PDF

## 📄 Generowanie PDF

### Funkcjonalności
- **Polskie znaki**: Używa fontu DejaVu Sans dla polskich znaków
- **Layout**: Profesjonalny layout faktury z logo
- **Dane klienta**: Pełne dane klienta i faktury
- **Pozycje**: Lista pozycji z kwotami
- **Sumy**: Automatyczne obliczanie podsumowań
- **Filenames**: Bezpieczne nazwy plików bez znaków specjalnych

### Przykład PDF
```
┌─────────────────────────────────────┐
│           FAKTURA VAT              │
│  Nr: INV-2024-001                 │
│  Data wystawienia: 2024-01-15     │
│  Termin płatności: 2024-02-15     │
├─────────────────────────────────────┤
│ SPRZEDAWCA:                        │
│ Firma XYZ Sp. z o.o.              │
│ ul. Przykładowa 1, 00-000 Warszawa│
│ NIP: 1234567890                   │
├─────────────────────────────────────┤
│ NABYWCA:                           │
│ Klient ABC                         │
│ ul. Testowa 5, 01-234 Kraków      │
│ NIP: 0987654321                   │
├─────────────────────────────────────┤
│ POZYCJE:                           │
│ 1. Usługa A - 100,00 zł           │
│ 2. Produkt B - 200,00 zł          │
├─────────────────────────────────────┤
│ RAZEM: 300,00 zł                  │
│ VAT (23%): 69,00 zł               │
│ DO ZAPŁATY: 369,00 zł             │
└─────────────────────────────────────┘
```

## 🔗 Integracje

### RabbitMQ Events
- **Odbiera**: `invoice.created` - Nowa faktura do wygenerowania
- **Publikuje**: `invoice.send` - PDF wygenerowany, gotowy do wysłania

### Baza danych
- **Odczyt**: Pobiera dane faktury i klienta
- **Zapis**: Aktualizuje fakturę z nazwą PDF

### API
- **Web-app**: Dostarcza dane faktur przez Prisma ORM

## 🔐 Bezpieczeństwo

- **Worker Threads**: Asynchroniczne generowanie PDF
- **Error Handling**: Obsługa błędów generowania
- **File Validation**: Sprawdzanie poprawności plików
- **Database Transactions**: Bezpieczne aktualizacje bazy

## 📊 Monitoring

### Logi
```bash
# Sprawdź logi
npm run start:dev

# Logi RabbitMQ
docker-compose logs rabbitmq
```

### Statusy
- **Processing**: Generowanie PDF w toku
- **Success**: PDF wygenerowany pomyślnie
- **Error**: Błąd generowania PDF

## 🐳 Docker

```bash
# Build
docker build -t invoice-worker .

# Uruchomienie
docker run --env-file .env invoice-worker
```

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź logi: `npm run start:dev`
2. Sprawdź RabbitMQ: http://localhost:15672
3. Sprawdź storage: `ls -la storage/pdfs/`
4. Sprawdź bazy danych: `npx prisma studio`
5. Reset: `npm run clean && npm install`
