# Güvenlik Dokümantasyonu

## Mevcut Güvenlik Önlemleri

### 1. Authentication
- Firebase Authentication kullanılıyor
- Email/Password ile giriş yapılıyor
- Client-side token kontrolü yapılıyor

### 2. Rate Limiting
- Middleware ile rate limiting eklendi
- 15 dakikada maksimum 5 deneme hakkı
- IP bazlı kontrol yapılıyor

### 3. Environment Variables
- Admin şifresi artık environment variable olarak saklanıyor
- `NEXT_PUBLIC_ADMIN_EMAIL` ve `NEXT_PUBLIC_ADMIN_PASSWORD` kullanılıyor

## Önemli Güvenlik Notları

### ⚠️ Yapılması Gerekenler

1. **Firebase Realtime Database Güvenlik Kuralları** ✅
   - Firebase Console'dan Realtime Database güvenlik kurallarını kontrol edin
   - **ÖNEMLİ**: Mevcut kurallarınızda kritik güvenlik açıkları var!
   - Düzeltilmiş güvenlik kuralları `firebase-database-rules.json` dosyasında
   - **Sorunlar**:
     - ❌ Admin kontrolü yanlış: `root.child('users').child('admin').child('username').val() == 'admin'` her zaman true döner
     - ❌ Settings yazma yetkisi çok geniş: Herhangi bir authenticated kullanıcı ayarları değiştirebilir
   - **Çözüm**: Email bazlı admin kontrolü kullanılmalı
   ```json
   {
     "rules": {
       "users": {
         "$uid": {
           ".read": "auth != null && auth.uid == $uid",
           ".write": "auth != null && auth.uid == $uid"
         },
         "admin": {
           ".read": "auth != null",
           ".write": false
         }
       },
       "eventList": {
         ".read": true,
         ".write": "auth != null && auth.token.email == 'admin@kzone.com'",
         ".indexOn": "date"
       },
       "eventTypes": {
         ".read": true,
         ".write": "auth != null && auth.token.email == 'admin@kzone.com'"
       },
       "settings": {
         ".read": true,
         ".write": "auth != null && auth.token.email == 'admin@kzone.com'"
       }
     }
   }
   ```

2. **Firebase Admin SDK Kurulumu** ✅
   - ✅ `firebase-admin` paketi yüklendi
   - ✅ `src/lib/firebase-admin.ts` dosyası oluşturuldu
   - ✅ Token doğrulama fonksiyonları eklendi
   - ✅ API route'ları güncellendi
   - ⚠️ **YAPILMASI GEREKEN**: Service account key'i Firebase Console'dan indirip `.env.local` dosyasına ekleyin
   - 📖 Detaylı kurulum rehberi: `FIREBASE_ADMIN_SDK_SETUP.md`

3. **HTTPS Zorunluluğu**
   - Production'da mutlaka HTTPS kullanılmalı
   - Vercel otomatik olarak HTTPS sağlıyor

4. **Environment Variables**
   - `.env.local` dosyası asla Git'e commit edilmemeli
   - `.gitignore` dosyasında `.env*` olmalı
   - Production'da Vercel environment variables kullanılmalı

5. **Şifre Güvenliği**
   - Admin şifresi güçlü olmalı (en az 12 karakter, büyük/küçük harf, sayı, özel karakter)
   - Şifre düzenli olarak değiştirilmeli
   - Şifre asla kod içinde hardcoded olmamalı

6. **Session Yönetimi**
   - Firebase Auth otomatik olarak session yönetimi yapıyor
   - Token refresh mekanizması çalışıyor
   - Logout işlemi düzgün çalışıyor

## Güvenlik İyileştirmeleri (Yapıldı)

✅ Hardcoded şifreler kaldırıldı  
✅ Environment variable'lara taşındı  
✅ Rate limiting eklendi  
✅ Middleware ile brute force koruması eklendi  
✅ API route'ları oluşturuldu (gelecekte Firebase Admin SDK ile geliştirilebilir)

## Güvenlik İyileştirmeleri (Yapılacak)

- [x] Firebase Admin SDK kurulumu (kod hazır, service account key eklenmeli)
- [x] Server-side token doğrulaması (API route'ları hazır)
- [ ] Firebase Realtime Database güvenlik kurallarının güncellenmesi (kurallar hazır, Firebase Console'a uygulanmalı)
- [ ] CSRF koruması
- [x] XSS koruması (React otomatik olarak yapıyor)
- [ ] Content Security Policy (CSP) headers
- [ ] Logging ve monitoring

## Güvenlik Kontrol Listesi

- [x] Hardcoded şifreler kaldırıldı
- [x] Rate limiting eklendi
- [x] Environment variables kullanılıyor
- [x] Firebase Admin SDK kurulu (kod hazır, service account key eklenmeli)
- [x] Server-side authentication kontrolü (API route'ları hazır)
- [x] Firebase Realtime Database güvenlik kuralları analiz edildi (kurallar hazır, Firebase Console'a uygulanmalı)
- [x] HTTPS zorunlu (Vercel otomatik sağlıyor)
- [ ] Güçlü şifre politikası (kullanıcı tarafında uygulanmalı)
- [ ] Logging ve monitoring

## Acil Yapılması Gerekenler

1. **Firebase Realtime Database Güvenlik Kuralları**: En kritik güvenlik açığı bu. Mutlaka Firebase Console'dan kontrol edilmeli ve sadece authenticated kullanıcıların yazma yetkisi olmalı.

2. **Firebase Admin SDK**: ✅ Kod hazır! Service account key'i Firebase Console'dan indirip `.env.local` dosyasına ekleyin. Detaylı rehber: `FIREBASE_ADMIN_SDK_SETUP.md`

3. **Environment Variables**: `.env.local` dosyasının `.gitignore`'da olduğundan emin olunmalı.
