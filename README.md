# İletigo - Mutabakat Yönetim Sistemi

Next.js ile geliştirilmiş modern mutabakat yönetim sistemi.

## Özellikler

- 🔐 Güvenli kullanıcı girişi
- 📱 Responsive tasarım
- 🎨 Modern UI/UX
- ⚡ Hızlı performans
- 📊 Mutabakat kayıt yönetimi
- ✅ Onay/Red işlemleri
- 📎 Dosya yükleme (Ekstre, PDF)
- 📄 PDF rapor oluşturma
- 💬 Yorum sistemi
- 🔍 Gelişmiş filtreleme
- 📈 Özet istatistikler

## Yeni Eklenen Özellikler

### Mutabakat Detay Sayfası (`/dashboard/reconciliations/[id]`)

- **Temel Bilgiler**: Şirket, dönem, atanan kişi, son tarih
- **Tutar Özeti**: Bizim tutar, onların tutarı, fark hesaplama
- **Detaylar Tablosu**: Satır bazında tutar karşılaştırması
- **Onay/Red İşlemleri**: Durum güncelleme butonları
- **Dosya Yükleme**:
  - Ekstre yükleme (.pdf, .xls, .xlsx, .csv)
  - İmzalı PDF yükleme (.pdf)
- **PDF Oluşturma**: Profesyonel mutabakat raporu
- **Yorum Sistemi**: İç notlar ve yorum ekleme
- **Dosya Listesi**: Yüklenen dosyaları görüntüleme

### API Endpoints

- `GET /api/reconciliations/[id]` - Mutabakat detayı
- `PATCH /api/reconciliations/[id]` - Durum güncelleme
- `POST /api/reconciliations/[id]/attachments` - Dosya yükleme
- `POST /api/reconciliations/[id]/comments` - Yorum ekleme
- `POST /api/reconciliations/[id]/pdf` - PDF oluşturma

## Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Veritabanı migration
npm run db:migrate

# Örnek veri ekleme
npm run db:seed

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build
npm start
```

## Klasör Yapısı

```
app/
├── api/
│   └── reconciliations/
│       └── [id]/
│           ├── route.ts          # GET, PATCH
│           ├── attachments/
│           │   └── route.ts      # POST (dosya yükleme)
│           ├── comments/
│           │   └── route.ts      # POST, GET
│           └── pdf/
│               └── route.ts      # POST (PDF oluşturma)
├── dashboard/
│   └── reconciliations/
│       ├── page.tsx              # Liste sayfası
│       ├── [id]/
│       │   └── page.tsx          # Detay sayfası
│       └── new/
│           └── page.tsx          # Yeni kayıt
└── globals.css
```

## Veritabanı Tabloları

- `reconciliations` - Ana mutabakat kayıtları
- `reconciliation_details` - Detay satırları
- `attachments` - Dosya ekleri
- `comments` - Yorumlar
- `activity_logs` - Aktivite logları

## Teknolojiler

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React 18
- **Backend**: Next.js API Routes, PostgreSQL
- **PDF Oluşturma**: Puppeteer
- **Dosya Yükleme**: Multer
- **İkonlar**: Lucide React

## Kurulum

1. Repository'yi klonlayın
2. Bağımlılıkları yükleyin: `npm install`
3. `.env.local` dosyasını oluşturun ve veritabanı bilgilerini ekleyin
4. Veritabanı migration'ları çalıştırın: `npm run db:migrate`
5. Geliştirme sunucusunu başlatın: `npm run dev`

## Kullanım

1. `http://localhost:3000` adresine gidin
2. Dashboard'a erişim için giriş yapın
3. Mutabakat kayıtlarını görüntülemek için `/dashboard/reconciliations` sayfasına gidin
4. Detayları görmek için herhangi bir kayıta tıklayın
5. Gerekli onay/red işlemlerini, dosya yüklemelerini ve PDF oluşturmayı kullanın

## Lisans

MIT
