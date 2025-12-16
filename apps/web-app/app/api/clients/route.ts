import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withSecurityHeaders, handleOptions } from '../../../lib/cors';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return withSecurityHeaders(NextResponse.json(clients));
  } catch (error) {
    console.error('Error fetching clients:', error);
    return withSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return withSecurityHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    const body = await request.json();
    const { name, email, nip } = body as {
      name: string;
      email: string;
      nip: string;
    };

    if (!name || !email || !nip) {
      return withSecurityHeaders(
        NextResponse.json({ error: 'Name, email and NIP are required' }, { status: 400 }),
      );
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        nip,
      },
    });

    return withSecurityHeaders(NextResponse.json(client, { status: 201 }));
  } catch (error) {
    console.error('Error creating client:', error);
    return withSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    );
  }
}
