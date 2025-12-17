import { Client } from './client';

export interface Invoice {
  id: number;
  clientId: number;
  userId: number;
  issueDate: string;
  dueDate: string;
  invoiceNumber: string;
  data: any;
  pdfFileName?: string;
  status: string;
  client: Client;
  user: {
    id: number;
    username: string;
  };
}
