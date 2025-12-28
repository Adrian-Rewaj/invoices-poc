require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then((mod) => mod.default(...args));
const app = express();
const PORT = process.env.PORT || 3003;
const API_URL = process.env.API_URL || 'http://localhost:3001/api';
const PAYMENT_SIGNATURE = process.env.PAYMENT_SIGNATURE || 'sekretnasygnatura';

app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');

// Pobierz fakturę po payToken z web-app
async function getInvoiceByToken(token) {
  try {
    const resp = await fetch(`${API_URL}/invoices/by-token/${token}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-PAYMENT-SIGNATURE': `${PAYMENT_SIGNATURE}`,
      },
    });
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
  const apiUrl = API_URL;
  const paymentSignature = PAYMENT_SIGNATURE;

  res.render('pay', { invoice, apiUrl, paymentSignature });
});

app.listen(PORT, () => {
  console.log(`Pay-mock listening on http://localhost:${PORT}`);
  console.log(`API URL: ${API_URL}`);
});
