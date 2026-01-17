# Server Git Pull Sorunu Çözümü

Server'da local değişiklikler var. İki seçeneğiniz var:

## Seçenek 1: Local Değişiklikleri Stash Yap (Önerilen)

Eğer server'da yaptığınız değişiklikleri kaybetmek istemiyorsanız:

```bash
# Local değişiklikleri geçici olarak sakla
sudo git stash

# Pull yap
sudo git pull origin main

# Eğer stash'teki değişiklikleri geri almak isterseniz:
sudo git stash pop
```

## Seçenek 2: Local Değişiklikleri Discard Et (Hızlı Çözüm)

Eğer server'daki local değişiklikleri kaybetmek istemiyorsanız:

```bash
# Local değişiklikleri at
sudo git reset --hard HEAD

# Pull yap
sudo git pull origin main
```

## Seçenek 3: Ne Değişmiş Bakalım

Önce ne değişmiş görelim:

```bash
# Değişiklikleri göster
sudo git diff package.json package-lock.json

# Eğer önemli değişiklikler yoksa, discard edin:
sudo git checkout -- package.json package-lock.json

# Sonra pull yapın
sudo git pull origin main
```

## Önerilen Adımlar

1. **Önce ne değişmiş bakalım:**
   ```bash
   sudo git diff package.json package-lock.json
   ```

2. **Eğer sadece npm install'dan kaynaklanan değişiklikler varsa (genellikle öyledir), discard edin:**
   ```bash
   sudo git checkout -- package.json package-lock.json
   sudo git pull origin main
   ```

3. **Yeni paketleri yükleyin:**
   ```bash
   sudo npm install
   ```

4. **Build yapın:**
   ```bash
   sudo npm run build
   ```

5. **Server'ı restart edin** (PM2, systemd veya manuel)
