const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const app = express();
const PORT = process.env.PORT || 3003;
const API_URL = process.env.API_URL || 'http://localhost:3001/api';

app.use(cors());
app.use(express.json());

// Pobierz fakturę po payToken z web-app
async function getInvoiceByToken(token) {
  try {
    const resp = await fetch(`${API_URL}/invoices/by-token/${token}`);
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

app.get('/pay/:token', async (req, res) => {
  const token = req.params.token;
  const invoice = await getInvoiceByToken(token);
  if (!invoice) {
    return res.status(404).send('<h2>Nie znaleziono faktury</h2>');
  }
  res.send(`
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Płatność za fakturę #${invoice.invoiceNumber}</title>
      <style>
        body { background: #f0f4f8; font-family: 'Segoe UI', Arial, sans-serif; color: #222; }
        .container { max-width: 400px; margin: 60px auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px #0001; padding: 32px; text-align: center; }
        h1 { color: #2563eb; margin-bottom: 8px; }
        .amount { font-size: 2.2rem; color: #16a34a; margin: 16px 0; font-weight: bold; }
        button { background: linear-gradient(90deg, #2563eb, #38bdf8); color: #fff; border: none; border-radius: 8px; padding: 14px 32px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; margin-top: 24px; }
        button:active { background: linear-gradient(90deg, #1d4ed8, #0ea5e9); }
        .msg { margin-top: 24px; font-size: 1.1rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Płatność za fakturę</h1>
        <div>ID faktury: <b>#${invoice.invoiceNumber}</b></div>
        <div class="amount">${invoice.data?.total?.toFixed(2) || '0.00'} zł</div>
        <button id="payBtn">Zapłać teraz</button>
        <div class="msg" id="msg"></div>
      </div>
      <script>
        document.getElementById('payBtn').onclick = async function() {
          const btn = this;
          btn.disabled = true;
          btn.textContent = 'Przetwarzanie...';
          document.getElementById('msg').textContent = '';
          try {
            const resp = await fetch('${API_URL}/payments/webhook', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-PAYMENT-SIGNATURE': 'sekretnasygnatura',
              },
              body: JSON.stringify({ invoiceId: ${invoice.id}, status: 'paid' })
            });
            if (resp.ok) {
              btn.textContent = 'Opłacono';
              document.getElementById('msg').textContent = 'Płatność zakończona sukcesem!';
              document.getElementById('msg').style.color = '#16a34a';
            } else {
              btn.textContent = 'Zapłać teraz';
              btn.disabled = false;
              document.getElementById('msg').textContent = 'Błąd płatności!';
              document.getElementById('msg').style.color = '#dc2626';
            }
          } catch (e) {
            btn.textContent = 'Zapłać teraz';
            btn.disabled = false;
            document.getElementById('msg').textContent = 'Błąd połączenia!';
            document.getElementById('msg').style.color = '#dc2626';
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Pay-mock listening on http://localhost:${PORT}`);
  console.log(`API URL: ${API_URL}`);
}); 