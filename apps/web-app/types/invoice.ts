import { Client } from './client';
import { InvoiceItem } from './invoice-item';

export interface InvoiceData {
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
}

export interface Invoice {
  id: number;
  clientId: number;
  userId: number;
  issueDate: string;
  dueDate: string;
  invoiceNumber: string;
  data: InvoiceData;
  pdfFileName?: string;
  status: string;
  client: Client;
  user: {
    id: number;
    username: string;
  };
}
