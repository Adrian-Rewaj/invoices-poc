import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { withSecurityHeaders, handleOptions } from '../../../../lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function POST(request: NextRequest) {
  // check signature
  const signature = request.headers.get('x-payment-signature');
  const expected = process.env.PAYMENT_SIGNATURE;
  if (!signature || !expected || signature !== expected) {
    // wrong signature - reject
    return withSecurityHeaders(new NextResponse(null, { status: 401 }));
  }

  let body: { invoiceId?: number; status?: string };
  try {
    body = await request.json();
  } catch {
    return withSecurityHeaders(NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }));
  }

  if (!body.invoiceId || !body.status) {
    return withSecurityHeaders(
      NextResponse.json({ error: 'Missing invoiceId or status' }, { status: 400 }),
    );
  }

  if (body.status === 'paid') {
    await prisma.invoice.update({
      where: { id: body.invoiceId },
      data: { status: 'paid' },
    });
  }

  return withSecurityHeaders(NextResponse.json({ ok: true }));
}
