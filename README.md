# KZONE PRODUCTIONS

KZONE PRODUCTIONS firmasının organizasyonlarını listeleyen web uygulaması.

## Özellikler

- Etkinliklerin tarihe göre listelenmesi
- Admin paneli ile etkinlik ekleme, düzenleme ve silme
- Etkinlik türlerine göre filtreleme
- Bilet satış durumu gösterimi
- Bilet satın alma bağlantıları

## Teknolojiler

- Next.js
- React
- TypeScript
- Tailwind CSS
- Firebase (Authentication ve Realtime Database)

## Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/cosfat/kzone.git
cd kzone
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env.local` dosyasını oluşturun ve Firebase yapılandırma bilgilerinizi ekleyin:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your-database-url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

5. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

## Dağıtım

Bu proje Vercel ile dağıtılmıştır. Ana domain: [kzone.com.tr](https://kzone.com.tr)

## Lisans

Bu proje özel lisans altında dağıtılmaktadır. Tüm hakları saklıdır.
