# Pay Mock - Symulator Płatności

Prosta aplikacja Express.js symulująca system płatności dla faktur.

![Strona płatności](../../assets/screen.png)

## 🚀 Opis

Pay Mock to aplikacja, która:
- Wyświetla stronę płatności dla faktur po tokenie
- Pozwala na symulację płatności z formularzem
- Wysyła webhook do głównej aplikacji po "płatności"
- Weryfikuje podpis webhook dla bezpieczeństwa
- Aktualizuje status faktury na "paid"

## 🛠️ Technologie

- **Express.js** - Framework Node.js
- **node-fetch** - HTTP requests
- **CORS** - Cross-origin requests

## 🚀 Uruchomienie

```bash
# Instalacja zależności
npm install

# Uruchomienie w trybie deweloperskim
npm run dev

# Uruchomienie produkcyjne
npm start
```

Aplikacja będzie dostępna na `http://localhost:3003`

## 🔧 Konfiguracja

### Zmienne środowiskowe (.env)
```env
# API Configuration
API_URL="http://localhost:3001/api"

# Server Configuration
PORT=3003
```

### Opis zmiennych
- **API_URL** - URL do API głównej aplikacji (web-app)
- **PORT** - Port na którym uruchamia się aplikacja (domyślnie 3003)

## 📁 Struktura projektu

```
pay-mock/
├── index.js              # Główna aplikacja Express
├── package.json          # Zależności
├── .env                  # Zmienne środowiskowe
├── .env.example          # Przykład konfiguracji
├── .gitignore           # Ignorowane pliki
└── README.md           # Dokumentacja
```

## 🔄 API Endpoints

### Płatności
- `GET /pay/:token` - Strona płatności dla faktury z danym tokenem

### Przykład użycia
```
http://localhost:3003/pay/abc123def456
```

## 📄 Strona płatności

### Funkcjonalności
- **Wyświetlanie faktury**: Dane faktury i klienta
- **Symulacja płatności**: Przycisk "Zapłać teraz"
- **Webhook**: Automatyczne wysłanie po płatności

### Przykład strony
```html
<!DOCTYPE html>
<html>
<head>
    <title>Płatność - Faktura INV-2024-001</title>
</head>
<body>
    <h1>Płatność faktury</h1>
    <div class="invoice-details">
        <h2>Faktura INV-2024-001</h2>
        <p>Klient: Jan Kowalski</p>
        <p>Kwota: 369,00 zł</p>
        <p>Termin: 2024-02-15</p>
    </div>
    
    <button id="payBtn">Zapłać teraz</button>
</body>
</html>
```

## 🔗 Integracje

### Webhook
- **URL**: `${API_URL}/payments/webhook`
- **Method**: POST
- **Headers**: `X-PAYMENT-SIGNATURE` z podpisem
- **Body**: Dane płatności w JSON

### API
- **Pobieranie faktury**: `${API_URL}/invoices/by-token/:token`
- **Webhook**: `${API_URL}/payments/webhook`

## 🔐 Bezpieczeństwo

- **Token Validation**: Sprawdzanie poprawności tokenu płatności
- **Webhook Signature**: Podpisywanie webhooków
- **CORS**: Poprawnie skonfigurowane nagłówki CORS
- **Error Handling**: Obsługa błędów i wyjątków

## 📊 Flow płatności

1. **Odbieranie tokenu**: Użytkownik wchodzi na `/pay/:token`
2. **Pobieranie faktury**: Aplikacja pobiera dane faktury z API
3. **Wyświetlanie strony**: Pokazuje dane faktury i przycisk płatności
4. **Symulacja płatności**: Kliknięcie "Zapłać teraz"
5. **Wysłanie webhook**: POST do web-app z podpisem
6. **Aktualizacja statusu**: Web-app zmienia status na "paid"

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź logi: `npm run dev`
2. Sprawdź API_URL: `echo $API_URL`
3. Sprawdź webhook: `curl -X POST ${API_URL}/payments/webhook`
4. Sprawdź CORS: Browser Developer Tools

## 🔧 Debugowanie

### Sprawdzenie webhook
```bash
curl -X POST http://localhost:3001/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT-SIGNATURE: sekretnasygnatura" \
  -d '{"invoiceId": 1, "status": "paid"}'
```

### Sprawdzenie API
```bash
curl http://localhost:3001/api/invoices/by-token/abc123
```

### Sprawdzenie CORS
```javascript
// W konsoli przeglądarki
fetch('http://localhost:3001/api/invoices/by-token/abc123')
  .then(response => response.json())
  .then(data => console.log(data));
``` 