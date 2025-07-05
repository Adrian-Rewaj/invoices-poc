# Pay Mock - Payment Simulator

Simple Express.js application simulating payment system for invoices.

![Payment Page](../../assets/screen.png)

## 🚀 Description

Pay Mock is an application that:
- Displays payment page for invoices by token
- Allows payment simulation with form
- Sends webhook to main application after "payment"
- Verifies webhook signature for security
- Updates invoice status to "paid"

## 🛠️ Technologies

- **Express.js** - Node.js framework
- **node-fetch** - HTTP requests
- **CORS** - Cross-origin requests

## 🚀 Setup

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Production start
npm start
```

Application will be available at `http://localhost:3003`

## 🔧 Configuration

### Environment variables (.env)
```env
# API Configuration
API_URL="http://localhost:3001/api"

# Server Configuration
PORT=3003
```

### Variable descriptions
- **API_URL** - URL to main application API (web-app)
- **PORT** - Port on which application starts (default 3003)

## 📁 Project Structure

```
pay-mock/
├── index.js              # Main Express application
├── package.json          # Dependencies
├── .env                  # Environment variables
├── .env.example          # Configuration example
├── .gitignore           # Ignored files
└── README.md           # Documentation
```

## 🔄 API Endpoints

### Payments
- `GET /pay/:token` - Payment page for invoice with given token

### Usage example
```
http://localhost:3003/pay/abc123def456
```

## 📄 Payment Page

### Features
- **Invoice display**: Invoice and client data
- **Payment simulation**: "Pay now" button
- **Webhook**: Automatic sending after payment

### Page example
```html
<!DOCTYPE html>
<html>
<head>
    <title>Payment - Invoice INV-2024-001</title>
</head>
<body>
    <h1>Invoice Payment</h1>
    <div class="invoice-details">
        <h2>Invoice INV-2024-001</h2>
        <p>Client: Jan Kowalski</p>
        <p>Amount: 369,00 zł</p>
        <p>Due date: 2024-02-15</p>
    </div>
    
    <button id="payBtn">Pay now</button>
</body>
</html>
```

## 🔗 Integrations

### Webhook
- **URL**: `${API_URL}/payments/webhook`
- **Method**: POST
- **Headers**: `X-PAYMENT-SIGNATURE` with signature
- **Body**: Payment data in JSON

### API
- **Get invoice**: `${API_URL}/invoices/by-token/:token`
- **Webhook**: `${API_URL}/payments/webhook`

## 🔐 Security

- **Token Validation**: Checking payment token validity
- **Webhook Signature**: Signing webhooks
- **CORS**: Properly configured CORS headers
- **Error Handling**: Error and exception handling

## 📊 Payment Flow

1. **Token reception**: User enters `/pay/:token`
2. **Invoice retrieval**: Application fetches invoice data from API
3. **Page display**: Shows invoice data and payment button
4. **Payment simulation**: Clicking "Pay now"
5. **Webhook sending**: POST to web-app with signature
6. **Status update**: Web-app changes status to "paid"

## 📞 Support

In case of issues:
1. Check logs: `npm run dev`
2. Check API_URL: `echo $API_URL`
3. Check webhook: `curl -X POST ${API_URL}/payments/webhook`
4. Check CORS: Browser Developer Tools

## 🔧 Debugging

### Webhook check
```bash
curl -X POST http://localhost:3001/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT-SIGNATURE: sekretnasygnatura" \
  -d '{"invoiceId": 1, "status": "paid"}'
```

### API check
```bash
curl http://localhost:3001/api/invoices/by-token/abc123
```

### CORS check
```javascript
// In browser console
fetch('http://localhost:3001/api/invoices/by-token/abc123')
  .then(response => response.json())
  .then(data => console.log(data));
``` 