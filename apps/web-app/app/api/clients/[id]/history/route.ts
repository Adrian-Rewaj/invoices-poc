import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { withSecurityHeaders, handleOptions } from '../../../../../lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

// GET /api/clients/[id]/history - historia zmian klienta
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return withSecurityHeaders(NextResponse.json({ error: 'Invalid client id' }, { status: 400 }));
  }
  
  const logs = await prisma.clientChangeLog.findMany({
    where: { clientId: id },
    orderBy: { changedAt: 'desc' },
    include: { user: { select: { username: true } } },
  });
  
  return withSecurityHeaders(NextResponse.json(logs));
} 