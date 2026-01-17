import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, isAdmin } from '@/lib/firebase-admin';

// Firebase Admin SDK ile token doğrulama
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'Token gerekli' },
        { status: 401 }
      );
    }

    // Token'ı doğrula
    const decodedToken = await verifyIdToken(idToken);
    
    // Kullanıcının admin olup olmadığını kontrol et
    const admin = await isAdmin(idToken);

    return NextResponse.json({ 
      valid: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      admin: admin
    });
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    
    // Hata mesajını daha açıklayıcı yap
    let errorMessage = 'Token doğrulama başarısız';
    
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        errorMessage = 'Token süresi dolmuş. Lütfen tekrar giriş yapın.';
      } else if (error.message.includes('invalid')) {
        errorMessage = 'Geçersiz token.';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    );
  }
}
