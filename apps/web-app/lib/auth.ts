import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export interface JWTPayload {
  userId: number;
  username: string;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return user;
}

export async function getSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  return session;
}
