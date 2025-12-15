import { NextRequest, NextResponse } from 'next/server';

export function withSecurityHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-PAYMENT-SIGNATURE',
  );
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  // security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  );
  return response;
}

// preflight OPTIONS
export function handleOptions(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 });
    return withSecurityHeaders(res);
  }
  return null;
}
