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

  // Sadece login sayfası için rate limiting (brute force koruması)
  // Admin sayfası zaten authentication ile korunuyor, rate limiting gerekmez
  if (pathname.startsWith('/login')) {
    // Sadece POST request'ler için rate limiting (form submit'ler için)
    // GET request'ler (sayfa yükleme) için rate limiting yapmıyoruz
    if (request.method === 'POST') {
      if (!checkRateLimit(ip)) {
        return NextResponse.json(
          { error: 'Çok fazla deneme. Lütfen 15 dakika sonra tekrar deneyin.' },
          { status: 429 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login/:path*'],
};
