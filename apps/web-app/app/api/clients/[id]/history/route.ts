import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { withSecurityHeaders, handleOptions } from '../../../../../lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

// GET /api/clients/[id]/history - client changes hisotry
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
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
