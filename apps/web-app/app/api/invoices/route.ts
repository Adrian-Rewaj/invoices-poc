import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { publishEvent } from '../../../lib/rabbitmq';
import { getUserFromRequest } from '@/lib/auth';
import { withSecurityHeaders, handleOptions } from '../../../lib/cors';
import { generateInvoiceNumber, getCompanyData, getBankData, calculateInvoiceTotals, type InvoiceData, type InvoiceItem } from '../../../lib/invoice';
import { v4 as uuidv4 } from 'uuid';

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    return withSecurityHeaders(NextResponse.json(invoices));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return withSecurityHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Sprawdź autoryzację
    const user = await getUserFromRequest(request);
    if (!user) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      );
    }

    const body = await request.json();
    const { clientId, items = [] } = body as {
      clientId: number;
      items?: InvoiceItem[];
    };

    if (!clientId) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: 'Client ID is required' },
          { status: 400 }
        )
      );
    }

    // Sprawdź czy klient istnieje
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        )
      );
    }

    // Generuj numer faktury
    const invoiceNumber = await generateInvoiceNumber();
    
    // Ustaw datę płatności (30 dni od dziś)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Oblicz kwoty
    const { subtotal, vatAmount, total } = calculateInvoiceTotals(items);

    // Przygotuj dane faktury
    const invoiceData: InvoiceData = {
      items,
      subtotal,
      vatRate: 23,
      vatAmount,
      total,
      currency: 'PLN',
      paymentTerms: '30 dni',
      notes: 'Dziękujemy za zaufanie',
    };

    // Generuj unikalny token do płatności
    const payToken = uuidv4();

    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        userId: user.id,
        invoiceNumber,
        dueDate,
        data: invoiceData as any,
        status: 'draft',
        payToken,
      },
      include: {
        client: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // Publish event to RabbitMQ
    await publishEvent('invoice.created', {
      invoiceId: invoice.id,
      clientId: invoice.clientId,
      userId: invoice.userId,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      data: invoice.data,
      client: (invoice as any).client || null,
      payToken: invoice.payToken,
    });

    return withSecurityHeaders(NextResponse.json(invoice, { status: 201 }));
  } catch (error) {
    console.error('Error creating invoice:', error);
    return withSecurityHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    );
  }
} 