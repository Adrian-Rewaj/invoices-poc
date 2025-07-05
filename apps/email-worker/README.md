# Email Worker - Wysyłanie Emaili z Fakturami

Worker Express.js do automatycznego wysyłania emaili z załączonymi PDF faktur.

## 🚀 Opis

Email Worker to aplikacja Express.js, która:
- Nasłuchuje eventów `invoice.send` z RabbitMQ
- Pobiera dane faktury i klienta z bazy danych
- Wysyła email z załączonym PDF faktury
- Dodaje link do płatności w treści emaila
- Aktualizuje status faktury na "sent"

## 🛠️ Technologie

- **Express.js** - Framework Node.js
- **TypeScript** - Type safety
- **nodemailer** - Wysyłanie emaili
- **RabbitMQ** - Komunikacja event-driven
- **Prisma** - ORM dla bazy danych
- **SMTP** - Protokół wysyłania emaili

## 🚀 Uruchomienie

```bash
# Instalacja zależności
npm install

# Uruchomienie w trybie deweloperskim
npm run dev

# Uruchomienie produkcyjne
npm start

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

# SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Email
FROM_EMAIL="noreply@faktury.pl"
FROM_NAME="System Faktur"

# Payment
PAYMENT_BASE_URL="http://localhost:3003"
```

## 📁 Struktura projektu

```
email-worker/
├── src/
│   ├── app.ts            # Główna aplikacja Express
│   ├── server.ts         # Entry point
│   ├── services/         # Serwisy
│   │   ├── email.service.ts
│   │   ├── invoice.service.ts
│   │   └── rabbitmq.service.ts
│   ├── templates/        # Szablony emaili
│   │   └── invoice-email.html
│   └── types/           # Typy TypeScript
│       └── index.ts
├── prisma/              # Schema bazy danych
│   └── schema.prisma
└── package.json
```

## 🔄 Flow pracy

1. **Odbieranie eventu**: Worker nasłuchuje `invoice.send` z RabbitMQ
2. **Pobieranie danych**: Pobiera dane faktury, klienta i PDF z bazy
3. **Generowanie emaila**: Tworzy email z szablonem HTML
4. **Załączanie PDF**: Dodaje wygenerowany PDF jako załącznik
5. **Wysyłanie**: Wysyła email przez SMTP
6. **Aktualizacja statusu**: Zmienia status faktury na "sent"

## 📧 Szablon emaila

### HTML Template
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Faktura {{invoiceNumber}}</title>
</head>
<body>
    <h2>Faktura {{invoiceNumber}}</h2>
    <p>Dzień dobry {{clientName}},</p>
    <p>W załączeniu przesyłamy fakturę nr {{invoiceNumber}}.</p>
    <p>Kwota do zapłaty: {{totalAmount}} zł</p>
    <p>Termin płatności: {{dueDate}}</p>
    
    <div style="margin: 20px 0;">
        <a href="{{paymentUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Zapłać teraz
        </a>
    </div>
    
    <p>Pozdrawiamy,<br>System Faktur</p>
</body>
</html>
```

### Przykład emaila
```
Od: System Faktur <noreply@faktury.pl>
Do: klient@example.com
Temat: Faktura INV-2024-001

Dzień dobry Jan Kowalski,

W załączeniu przesyłamy fakturę nr INV-2024-001.

Kwota do zapłaty: 369,00 zł
Termin płatności: 2024-02-15

[Zapłać teraz] - http://localhost:3003/pay/abc123

Pozdrawiamy,
System Faktur

Załączniki:
- faktura_INV-2024-001.pdf
```

## 🔗 Integracje

### RabbitMQ Events
- **Odbiera**: `invoice.send` - PDF wygenerowany, gotowy do wysłania

### Baza danych
- **Odczyt**: Pobiera dane faktury, klienta i nazwę PDF
- **Zapis**: Aktualizuje status faktury na "sent"

### API
- **Web-app**: Dostarcza dane faktur przez Prisma ORM
- **Pay-mock**: Generuje link do płatności

### SMTP
- **Gmail**: SMTP z autoryzacją OAuth2
- **Inne**: Dowolny serwer SMTP

## 🔐 Bezpieczeństwo

- **SMTP Auth**: Bezpieczna autoryzacja SMTP
- **Email Validation**: Walidacja adresów email
- **Error Handling**: Obsługa błędów wysyłania
- **Rate Limiting**: Ograniczenie liczby emaili
- **Logging**: Logowanie wszystkich operacji

## 📊 Monitoring

### Logi
```bash
# Sprawdź logi
npm run dev

# Logi RabbitMQ
docker-compose logs rabbitmq
```

### Statusy emaili
- **Pending**: Email w kolejce
- **Sent**: Email wysłany pomyślnie
- **Failed**: Błąd wysyłania
- **Bounced**: Email zwrócony

## 🐳 Docker

```bash
# Build
docker build -t email-worker .

# Uruchomienie
docker run --env-file .env email-worker
```

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź logi: `npm run dev`
2. Sprawdź RabbitMQ: http://localhost:15672
3. Sprawdź SMTP: `telnet smtp.gmail.com 587`
4. Sprawdź bazy danych: `npx prisma studio`
5. Reset: `npm run clean && npm install`

## 📧 Konfiguracja SMTP

### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Inne serwery
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=username
SMTP_PASS=password
```
