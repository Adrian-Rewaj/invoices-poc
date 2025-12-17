import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withSecurityHeaders, handleOptions } from '../../../../../lib/cors';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return withSecurityHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }
    const user = session.user;

    const invoiceId = Number(params.id);
    if (isNaN(invoiceId)) {
      return withSecurityHeaders(
        NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 }),
      );
    }

    // Pobierz fakturę z bazą danych
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
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

    if (!invoice) {
      return withSecurityHeaders(
        NextResponse.json({ error: 'Invoice not found' }, { status: 404 }),
      );
    }

    // Sprawdź czy plik PDF istnieje
    if (!invoice.pdfFileName) {
      return withSecurityHeaders(
        NextResponse.json({ error: 'PDF file not available yet' }, { status: 404 }),
      );
    }

    const pdfPath = path.join(
      process.env.PDF_STORAGE_PATH || '/var/www/html/development/invoices-poc/storage/pdfs',
      invoice.pdfFileName,
    );

    try {
      const pdfBuffer = await fs.readFile(pdfPath);

      const response = new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="faktura-${invoice.invoiceNumber}.pdf"`,
        },
      });

      return withSecurityHeaders(response);
    } catch (fileError) {
      console.error('Error reading PDF file:', fileError);
      return withSecurityHeaders(
        NextResponse.json({ error: 'PDF file not found on disk' }, { status: 404 }),
      );
    }
  } catch (error) {
    console.error('Error serving PDF:', error);
    return withSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    );
  }
}
