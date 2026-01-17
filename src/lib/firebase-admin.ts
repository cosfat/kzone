import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

// Firebase Admin SDK'yı initialize et
// Singleton pattern kullanarak sadece bir kez initialize edilmesini sağlıyoruz
let adminApp: App | undefined;

function getAdminApp(): App {
  // Eğer zaten initialize edilmişse, mevcut instance'ı döndür
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Service account key'i environment variable'dan al
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY environment variable bulunamadı. ' +
      'Lütfen Firebase Console\'dan service account key indirip .env.local dosyasına ekleyin.'
    );
  }

  try {
    // JSON string'i parse et
    const serviceAccount = JSON.parse(serviceAccountKey);

    // Firebase Admin SDK'yı initialize et
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });

    return adminApp;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY geçerli bir JSON değil. ' +
        'Lütfen service account key dosyasının içeriğini doğru şekilde kopyaladığınızdan emin olun.'
      );
    }
    throw error;
  }
}

// Auth instance'ı
export function getAdminAuth() {
  const app = getAdminApp();
  return getAuth(app);
}

// Database instance'ı
export function getAdminDatabase() {
  const app = getAdminApp();
  return getDatabase(app);
}

// Token doğrulama fonksiyonu
export async function verifyIdToken(idToken: string) {
  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    throw error;
  }
}

// Kullanıcının admin olup olmadığını kontrol et
export async function isAdmin(idToken: string): Promise<boolean> {
  try {
    const decodedToken = await verifyIdToken(idToken);
    // Admin email'ini environment variable'dan al veya varsayılan kullan
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@kzone.com';
    return decodedToken.email === adminEmail;
  } catch (error) {
    console.error('Admin kontrolü hatası:', error);
    return false;
  }
}
