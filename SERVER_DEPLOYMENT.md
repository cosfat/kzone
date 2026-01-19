# Server Deployment Rehberi

Bu rehber, güvenlik güncellemelerini server'a deploy etmek için adım adım talimatlar içerir.

## 📋 Adım 1: GitHub'a Push Etme

### 1.1. Değişiklikleri Stage'e Ekle

```bash
# Tüm değişiklikleri ekle
git add .

# Veya tek tek eklemek isterseniz:
git add .gitignore
git add package.json package-lock.json
git add src/
git add *.md
git add firebase-database-rules.json
git add src/middleware.ts
```

### 1.2. Commit Yap

```bash
git commit -m "feat: Güvenlik iyileştirmeleri - Firebase Admin SDK, rate limiting, middleware eklendi"
```

### 1.3. Push Et

```bash
git push origin main
```

## 📋 Adım 2: Server'da Pull ve Kurulum

### 2.1. Server'a SSH ile Bağlan

```bash
ssh kullanici@server-ip
# veya
ssh kullanici@kzone.com.tr
```

### 2.2. Proje Dizinine Git

```bash
cd /path/to/kzone
# Örnek: cd /var/www/kzone veya cd ~/kzone
```

### 2.3. Git Pull Yap

```bash
git pull origin main
```

### 2.4. Yeni Bağımlılıkları Yükle

```bash
npm install
```

Bu komut `firebase-admin` paketini yükleyecektir.

### 2.5. Environment Variables Kontrolü

`.env.local` dosyasını kontrol edin veya oluşturun:

```bash
nano .env.local
# veya
vi .env.local
```

**Eklenmesi gerekenler:**

```env
# Mevcut Firebase değişkenleri (zaten varsa eklemeyin)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDJ0nSIg7to3iiPVx3ExS7hMTKQrQywr_Q
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kzone-ac443.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://kzone-ac443-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kzone-ac443
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kzone-ac443.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=297493573404
NEXT_PUBLIC_FIREBASE_APP_ID=1:297493573404:web:ae27144f595e28d06614d9

# YENİ: Admin email ve password (eğer yoksa)
NEXT_PUBLIC_ADMIN_EMAIL=admin@kzone.com
NEXT_PUBLIC_ADMIN_PASSWORD=your-strong-password-here

# YENİ: Firebase Admin SDK Service Account Key
# Firebase Console'dan indirdiğiniz JSON dosyasının TÜM içeriğini buraya yapıştırın
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"kzone-ac443",...}'
```

**ÖNEMLİ:** 
- `FIREBASE_SERVICE_ACCOUNT_KEY` değeri tek satır olmalı
- JSON içeriğini tek tırnak içine alın: `'...'`

### 2.6. (Opsiyonel) Cache Temizleme

Eğer server'da disk alanı sorunu varsa, development cache'lerini temizleyebilirsiniz:

```bash
# Sadece development cache'lerini temizle (production build'i korur)
rm -rf .next/cache .next/dev

# Veya tüm .next klasörünü temizle (sonra build yapılacak)
rm -rf .next
```

**Not:** Production'da çalışıyorsanız, sadece `.next/cache` ve `.next/dev` klasörlerini temizleyin. `.next/server` ve `.next/static` klasörleri production için gereklidir.

### 2.7. Build Yap

```bash
npm run build
```

Eğer build başarılı olursa, devam edin. Hata alırsanız, hata mesajını kontrol edin.

### 2.8. Development Server'ı Yeniden Başlat

**PM2 kullanıyorsanız:**
```bash
pm2 restart kzone
# veya
pm2 restart all
```

**Systemd service kullanıyorsanız:**
```bash
sudo systemctl restart kzone
# veya servis adınız ne ise
```

**Manuel olarak çalıştırıyorsanız:**
```bash
# Eski process'i durdurun (Ctrl+C veya kill)
# Sonra tekrar başlatın:
npm run start
# veya production için:
NODE_ENV=production npm run start
```

## 📋 Adım 3: Vercel Kullanıyorsanız (Production)

Eğer Vercel kullanıyorsanız, otomatik deploy olacaktır. Ancak environment variable eklemeniz gerekir:

### 3.1. Vercel Dashboard'a Gidin

1. https://vercel.com/dashboard
2. Projenizi seçin (`kzone` veya proje adınız)

### 3.2. Environment Variables Ekleyin

**Settings > Environment Variables** sekmesine gidin ve şunları ekleyin:

1. **NEXT_PUBLIC_ADMIN_EMAIL** (eğer yoksa)
   - Value: `admin@kzone.com`
   - Environment: Production, Preview, Development

2. **NEXT_PUBLIC_ADMIN_PASSWORD** (eğer yoksa)
   - Value: Güçlü şifreniz
   - Environment: Production, Preview, Development

3. **FIREBASE_SERVICE_ACCOUNT_KEY** (YENİ - MUTLAKA EKLEYİN)
   - Value: Firebase Console'dan indirdiğiniz JSON dosyasının tüm içeriği (tek satır)
   - Environment: Production, Preview, Development (hepsini seçin)

### 3.3. Redeploy Yapın

Environment variable'ları ekledikten sonra:

1. **Deployments** sekmesine gidin
2. Son deployment'ın yanındaki **"..."** menüsüne tıklayın
3. **"Redeploy"** seçeneğini seçin
4. Veya yeni bir commit push edin (otomatik deploy olur)

## 📋 Adım 4: Firebase Realtime Database Kurallarını Güncelleme

**ÖNEMLİ:** Firebase Console'dan güvenlik kurallarını güncellemeniz gerekiyor!

1. **Firebase Console'a gidin**: https://console.firebase.google.com/
2. **Projenizi seçin**: `kzone-ac443`
3. **Realtime Database** sekmesine gidin
4. **Rules** sekmesine tıklayın
5. `firebase-database-rules.json` dosyasındaki kuralları kopyalayıp yapıştırın
6. **Publish** butonuna tıklayın

## 📋 Adım 5: Test Etme

### 5.1. Site Erişilebilirliği

```bash
curl https://kzone.com.tr
# veya
curl http://localhost:3000
```

### 5.2. API Endpoint'leri Test

```bash
# Token doğrulama endpoint'i (browser console'dan)
# Önce login olun, sonra:
const user = auth.currentUser;
const token = await user.getIdToken();
const response = await fetch('/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken: token })
});
const data = await response.json();
```

### 5.3. Admin Panel Test

1. https://kzone.com.tr/login adresine gidin
2. Admin bilgileriyle giriş yapın
3. Admin panelinin çalıştığını kontrol edin

## 🐛 Sorun Giderme

### Hata: "FIREBASE_SERVICE_ACCOUNT_KEY environment variable bulunamadı"

**Çözüm:**
- `.env.local` dosyasında `FIREBASE_SERVICE_ACCOUNT_KEY` olduğundan emin olun
- Vercel kullanıyorsanız, Vercel dashboard'dan environment variable'ı ekleyin
- Server'ı yeniden başlatın

### Hata: "FIREBASE_SERVICE_ACCOUNT_KEY geçerli bir JSON değil"

**Çözüm:**
- JSON içeriğini tek tırnak içine aldığınızdan emin: `'...'`
- JSON'u tek satıra çevirin
- Özel karakterleri escape edin

### Hata: Build başarısız

**Çözüm:**
- `npm install` komutunu tekrar çalıştırın
- `node_modules` ve `.next` klasörlerini silip tekrar build yapın:
  ```bash
  rm -rf node_modules .next
  npm install
  npm run build
  ```

### Disk Alanı Sorunu

**Sorun:** Server'da disk alanı doluyor

**Çözüm:**
```bash
# 1. Development cache'lerini temizle (güvenli)
rm -rf .next/cache .next/dev

# 2. Eğer hala yer gerekiyorsa, tüm .next'i temizle ve yeniden build yap
rm -rf .next
npm run build

# 3. node_modules boyutunu kontrol et (normal: 600-700MB)
du -sh node_modules

# 4. Gereksiz dosyaları temizle
rm -rf .DS_Store
find . -name "*.log" -type f -delete
```

**Önemli:** Production'da çalışıyorsanız, `.next/server` ve `.next/static` klasörlerini silmeyin!

### Hata: Port zaten kullanımda

**Çözüm:**
```bash
# Port'u kullanan process'i bulun
lsof -ti:3000

# Process'i sonlandırın
kill -9 <process-id>

# Veya tüm Next.js process'lerini sonlandırın
pkill -f "next"
```

## ✅ Deployment Kontrol Listesi

- [ ] GitHub'a push edildi
- [ ] Server'a SSH ile bağlanıldı
- [ ] `git pull` yapıldı
- [ ] `npm install` çalıştırıldı
- [ ] `.env.local` dosyası güncellendi (FIREBASE_SERVICE_ACCOUNT_KEY eklendi)
- [ ] `npm run build` başarılı oldu
- [ ] Server yeniden başlatıldı
- [ ] Vercel environment variables eklendi (Vercel kullanıyorsanız)
- [ ] Firebase Realtime Database kuralları güncellendi
- [ ] Site test edildi
- [ ] Admin panel test edildi

## 📚 Ek Kaynaklar

- [Firebase Admin SDK Setup](./FIREBASE_ADMIN_SDK_SETUP.md)
- [Security Documentation](./SECURITY.md)
- [Firebase Rules Analysis](./FIREBASE_RULES_ANALYSIS.md)

## 🎉 Tamamlandı!

Tüm adımları tamamladıktan sonra, güvenlik iyileştirmeleri aktif olacaktır!
