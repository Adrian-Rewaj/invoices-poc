import { prisma } from './prisma';

export interface InvoiceData {
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  currency: string;
  notes?: string;
  paymentTerms: string;
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  description?: string;
}

export interface CompanyData {
  name: string;
  address: string;
  nip: string;
  regon: string;
  email: string;
  phone: string;
}

export interface BankData {
  accountNumber: string;
  bankName: string;
  swift: string;
  iban: string;
}

export function getCompanyData(): CompanyData {
  return {
    name: process.env.COMPANY_NAME || 'Twoja Firma Sp. z o.o.',
    address: process.env.COMPANY_ADDRESS || 'ul. Przykładowa 123, 00-000 Warszawa',
    nip: process.env.COMPANY_NIP || '123-456-78-90',
    regon: process.env.COMPANY_REGON || '123456789',
    email: process.env.COMPANY_EMAIL || 'faktury@twojafirma.pl',
    phone: process.env.COMPANY_PHONE || '+48 123 456 789',
  };
}

export function getBankData(): BankData {
  return {
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || '12 1234 5678 9012 3456 7890 1234',
    bankName: process.env.BANK_NAME || 'Przykładowy Bank S.A.',
    swift: process.env.BANK_SWIFT || 'PRZAPLXX',
    iban: process.env.BANK_IBAN || 'PL12 1234 5678 9012 3456 7890 1234',
  };
}

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: `FV/${year}/`,
      },
    },
    orderBy: {
      invoiceNumber: 'desc' as any,
    },
  });

  let nextNumber = 1;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('/').pop() || '0');
    nextNumber = lastNumber + 1;
  }

  return `FV/${year}/${nextNumber.toString().padStart(4, '0')}`;
}

export function calculateInvoiceTotals(items: InvoiceItem[], vatRate: number = 23): {
  subtotal: number;
  vatAmount: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = (subtotal * vatRate) / 100;
  const total = subtotal + vatAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
} 