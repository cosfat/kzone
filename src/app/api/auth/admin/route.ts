import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/firebase-admin';

// Admin kontrolü için API endpoint
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'Token gerekli' },
        { status: 401 }
      );
    }

    // Kullanıcının admin olup olmadığını kontrol et
    const admin = await isAdmin(idToken);

    if (!admin) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Admin yetkisi gerekli.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ 
      admin: true,
      message: 'Admin yetkisi doğrulandı'
    });
  } catch (error) {
    console.error('Admin kontrolü hatası:', error);
    return NextResponse.json(
      { error: 'Admin kontrolü başarısız' },
      { status: 401 }
    );
  }
}
