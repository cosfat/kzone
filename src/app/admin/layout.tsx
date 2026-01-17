// Admin sayfası için server-side koruma
// Not: Bu basit bir kontrol. Production'da Firebase Admin SDK ile
// token doğrulaması yapılmalı
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Client-side'da Firebase Auth kontrolü yapıldığı için
  // burada sadece sayfanın yüklenmesine izin veriyoruz
  // Gerçek authentication kontrolü client-side'da yapılıyor
  
  // Production'da burada Firebase Admin SDK ile token doğrulaması yapılmalı
  // Örnek:
  // const token = cookies().get('auth-token');
  // if (!token || !await verifyToken(token.value)) {
  //   redirect('/login');
  // }

  return <>{children}</>;
}
