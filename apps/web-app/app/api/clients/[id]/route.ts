import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/clients/[id] - pobierz dane klienta
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid client id' }, { status: 400 });
  }
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }
  return NextResponse.json(client);
}

// PATCH /api/clients/[id] - edytuj klienta i loguj zmiany
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid client id' }, { status: 400 });
  }
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }
  const body = await req.json();
  const { name, email, nip } = body;
  const updates: any = {};
  const logs: any[] = [];
  if (name && name !== client.name) {
    logs.push({ field: 'name', before: { name: client.name }, after: { name }, userId: user.id });
    updates.name = name;
  }
  if (email && email !== client.email) {
    logs.push({ field: 'email', before: { email: client.email }, after: { email }, userId: user.id });
    updates.email = email;
  }
  if (nip && nip !== client.nip) {
    logs.push({ field: 'nip', before: { nip: client.nip }, after: { nip }, userId: user.id });
    updates.nip = nip;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No changes' }, { status: 400 });
  }
  const updated = await prisma.client.update({ where: { id }, data: updates });
  // Zapisz logi zmian
  for (const log of logs) {
    await prisma.clientChangeLog.create({
      data: {
        clientId: id,
        userId: log.userId,
        field: log.field,
        before: log.before,
        after: log.after,
      },
    });
  }
  return NextResponse.json(updated);
}

// GET /api/clients/[id]/history - historia zmian klienta
export async function GET_HISTORY(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid client id' }, { status: 400 });
  }
  const logs = await prisma.clientChangeLog.findMany({
    where: { clientId: id },
    orderBy: { changedAt: 'desc' },
    include: { user: { select: { username: true } } },
  });
  return NextResponse.json(logs);
} 