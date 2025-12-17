import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { withSecurityHeaders, handleOptions } from '../../../../../lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function GET(req: NextRequest, context: { params: Promise<{ token: string }> }) {
  const params = await context.params;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { payToken: params.token },
    });
    if (!invoice) {
      return withSecurityHeaders(NextResponse.json({ error: 'Not found' }, { status: 404 }));
    }
    return withSecurityHeaders(NextResponse.json(invoice));
  } catch (error) {
    console.error('Error fetching invoice by token:', error);
    return withSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    );
  }
}
