# Firebase Admin SDK Kurulum Rehberi

Bu rehber, Firebase Admin SDK'yı Next.js projenize kurmak için adım adım talimatlar içerir.

## 📋 Adım 1: Firebase Console'dan Service Account Key İndirme

1. **Firebase Console'a gidin**: https://console.firebase.google.com/
2. **Projenizi seçin**: `kzone-ac443` (veya proje adınız)
3. **Proje Ayarları'na gidin**: Sol menüden ⚙️ (Settings) > **Project settings**
4. **Service Accounts sekmesine tıklayın**
5. **"Generate new private key" butonuna tıklayın**
   - ⚠️ **UYARI**: Bu dosya çok hassas! Asla Git'e commit etmeyin!
6. **JSON dosyası indirilecek** (örnek: `kzone-ac443-firebase-adminsdk-xxxxx.json`)

## 📋 Adım 2: Service Account Key'i Environment Variable Olarak Ekleme

### Yerel Geliştirme (.env.local)

1. İndirdiğiniz JSON dosyasını açın
2. Tüm içeriği kopyalayın (tek satır veya çok satırlı olabilir, fark etmez)
3. `.env.local` dosyanızı açın (yoksa oluşturun)
4. Şu satırı ekleyin:

```env
# Firebase Admin SDK Service Account Key
# JSON dosyasının TÜM içeriğini buraya yapıştırın (tek satır olarak)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"kzone-ac443",...}'
```

**ÖNEMLİ NOTLAR:**
- JSON içeriğini tek tırnak içine alın: `'...'`
- JSON içinde tek tırnak varsa, escape edin: `\'`
- Veya çift tırnak kullanın ve içindeki çift tırnakları escape edin: `"..."`

**Alternatif Yöntem (Daha Kolay):**
JSON dosyasını tek satıra çevirmek için:
```bash
# Terminal'de (Mac/Linux)
cat kzone-ac443-firebase-adminsdk-xxxxx.json | jq -c
```

### Production (Vercel)

1. **Vercel Dashboard'a gidin**: https://vercel.com/dashboard
2. **Projenizi seçin**
3. **Settings > Environment Variables** sekmesine gidin
4. **Yeni variable ekleyin**:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value**: JSON dosyasının tüm içeriği (tek satır)
   - **Environment**: Production, Preview, Development (hepsini seçin)
5. **Save** butonuna tıklayın

## 📋 Adım 3: Kod Kontrolü

Kurulum tamamlandı! Şu dosyalar oluşturuldu:

- ✅ `src/lib/firebase-admin.ts` - Firebase Admin SDK initialization
- ✅ `src/app/api/auth/verify/route.ts` - Token doğrulama endpoint
- ✅ `src/app/api/auth/admin/route.ts` - Admin kontrolü endpoint

## 📋 Adım 4: Test Etme

### 1. Yerel Geliştirme

```bash
# Development server'ı başlatın
npm run dev
```

### 2. Token Doğrulama Testi

Client-side'da bir token alıp test edebilirsiniz:

```typescript
// Test için (browser console'da)
const user = auth.currentUser;
if (user) {
  const token = await user.getIdToken();
  
  const response = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token })
  });
  
  const data = await response.json();
  console.log('Token doğrulama sonucu:', data);
}
```

### 3. Admin Kontrolü Testi

```typescript
// Test için (browser console'da)
const user = auth.currentUser;
if (user) {
  const token = await user.getIdToken();
  
  const response = await fetch('/api/auth/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token })
  });
  
  const data = await response.json();
  console.log('Admin kontrolü sonucu:', data);
}
```

## 📋 Adım 5: Admin Layout'u Güncelleme (Opsiyonel)

Server-side'da admin kontrolü yapmak isterseniz, `src/app/admin/layout.tsx` dosyasını güncelleyebilirsiniz. Ancak şu an için client-side kontrol yeterli.

## 🔒 Güvenlik Notları

1. **Service Account Key ASLA commit etmeyin!**
   - `.gitignore` dosyasında `.env*.local` zaten var ✅
   - JSON dosyasını da `.gitignore`'a ekleyin

2. **Environment Variables**
   - Production'da mutlaka Vercel environment variables kullanın
   - Local development için `.env.local` kullanın

3. **Token Güvenliği**
   - Token'lar client-side'da saklanmamalı
   - HttpOnly cookies kullanılabilir (ileride)

## 🐛 Sorun Giderme

### Hata: "FIREBASE_SERVICE_ACCOUNT_KEY environment variable bulunamadı"

**Çözüm:**
- `.env.local` dosyasının proje root'unda olduğundan emin olun
- Environment variable adının doğru olduğundan emin olun: `FIREBASE_SERVICE_ACCOUNT_KEY`
- Development server'ı yeniden başlatın: `npm run dev`

### Hata: "FIREBASE_SERVICE_ACCOUNT_KEY geçerli bir JSON değil"

**Çözüm:**
- JSON içeriğini tek tırnak içine aldığınızdan emin olun
- JSON içindeki özel karakterleri escape edin
- JSON'u tek satıra çevirin

### Hata: "Token doğrulama başarısız"

**Çözüm:**
- Token'ın geçerli olduğundan emin olun
- Token'ın süresinin dolmadığından emin olun
- Firebase proje ayarlarını kontrol edin

## 📚 Ek Kaynaklar

- [Firebase Admin SDK Dokümantasyonu](https://firebase.google.com/docs/admin/setup)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## ✅ Kurulum Kontrol Listesi

- [ ] Firebase Console'dan service account key indirildi
- [ ] `.env.local` dosyasına `FIREBASE_SERVICE_ACCOUNT_KEY` eklendi
- [ ] Vercel'de environment variable eklendi (production için)
- [ ] Development server başlatıldı ve test edildi
- [ ] Token doğrulama çalışıyor
- [ ] Admin kontrolü çalışıyor

## 🎉 Tamamlandı!

Firebase Admin SDK kurulumu tamamlandı! Artık server-side'da token doğrulaması yapabilirsiniz.
