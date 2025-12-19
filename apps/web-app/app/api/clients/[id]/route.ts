import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '../../../../lib/auth';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await context.params;
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

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await context.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid client id' }, { status: 400 });
  }

  const user = session.user;

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
    logs.push({
      field: 'email',
      before: { email: client.email },
      after: { email },
      userId: user.id,
    });
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
  // save change logs
  for (const log of logs) {
    await prisma.clientChangeLog.create({
      data: {
        clientId: id,
        userId: parseInt(log.userId),
        field: log.field,
        before: log.before,
        after: log.after,
      },
    });
  }
  return NextResponse.json(updated);
}
