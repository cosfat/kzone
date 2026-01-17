import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting için basit bir in-memory store
// Production'da Redis gibi bir çözüm kullanılmalı
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 dakika
const MAX_REQUESTS = 5; // 15 dakikada maksimum 5 deneme

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // Yeni kayıt veya süre dolmuş
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false; // Rate limit aşıldı
  }

  record.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // IP adresini header'lardan al (Next.js'te request.ip yok)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

  // Admin sayfası için rate limiting
  if (pathname.startsWith('/admin')) {
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Çok fazla deneme. Lütfen 15 dakika sonra tekrar deneyin.' },
        { status: 429 }
      );
    }
  }

  // Login sayfası için rate limiting
  if (pathname.startsWith('/login')) {
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Çok fazla deneme. Lütfen 15 dakika sonra tekrar deneyin.' },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login/:path*'],
};
