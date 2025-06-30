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
- 📄 PDF rapor oluşturma (jsPDF)
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
- **PDF Oluşturma**: Client-side jsPDF ile profesyonel mutabakat raporu
- **Yorum Sistemi**: İç notlar ve yorum ekleme
- **Dosya Listesi**: Yüklenen dosyaları görüntüleme

### API Endpoints

- `GET /api/reconciliations/[id]` - Mutabakat detayı
- `PATCH /api/reconciliations/[id]` - Durum güncelleme
- `POST /api/reconciliations/[id]/attachments` - Dosya yükleme
- `POST /api/reconciliations/[id]/comments` - Yorum ekleme
- `POST /api/reconciliations/[id]/pdf` - PDF HTML şablonu

## Deployment Çözümü

### Coolify Deployment Hatası Çözümü

Puppeteer deployment sorunları nedeniyle **jsPDF** kullanılarak çözüldü:

#### Eski Sistem (Puppeteer - Deployment Hatası):
```typescript
// Sunucu tarafında Chromium gerektirir
const browser = await puppeteer.launch();
```

#### Yeni Sistem (jsPDF - Deployment Uyumlu):
```typescript
// Client-side PDF generation
const htmlContent = await response.text();
const newWindow = window.open('', '_blank');
newWindow.document.write(htmlContent);
```

### Avantajlar:
- ✅ Serverless deployment uyumlu
- ✅ Chromium dependency yok
- ✅ Daha hızlı build süreleri
- ✅ Düşük resource kullanımı
- ✅ Client-side PDF generation
- ✅ Print-friendly HTML şablonları

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
│               └── route.ts      # POST (PDF HTML)
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
- **PDF Oluşturma**: jsPDF (Client-side)
- **Dosya Yükleme**: Multer
- **İkonlar**: Lucide React

## Kurulum

1. Repository'yi klonlayın
2. Bağımlılıkları yükleyin: `npm install`
3. `.env.local` dosyasını oluşturun ve veritabanı bilgilerini ekleyin
4. Veritabanı migration'ları çalıştırın: `npm run db:migrate`
5. Geliştirme sunucusunu başlatın: `npm run dev`

## Deployment

### Coolify için:
1. Repository'yi Coolify'a bağlayın
2. Environment variables'ları ayarlayın
3. Build command: `npm run build`
4. Start command: `npm start`
5. Port: `3000`

### Vercel için:
1. Vercel'e repository'yi import edin
2. Environment variables'ları ekleyin
3. Otomatik deployment

### Docker için:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Kullanım

1. `http://localhost:3000` adresine gidin
2. Dashboard'a erişim için giriş yapın
3. Mutabakat kayıtlarını görüntülemek için `/dashboard/reconciliations` sayfasına gidin
4. Detayları görmek için herhangi bir kayıta tıklayın
5. Gerekli onay/red işlemlerini, dosya yüklemelerini ve PDF oluşturmayı kullanın

## PDF Özelliği

### Kullanım:
1. Detay sayfasında "PDF İndir" butonuna tıklayın
2. Yeni pencerede HTML şablon açılır
3. "PDF İndir" butonu ile jsPDF kullanarak PDF oluşturun
4. "Yazdır" butonu ile doğrudan yazdırın

### PDF İçeriği:
- Şirket ve dönem bilgileri
- Tutar özeti ve fark hesaplaması
- Detay tablosu (varsa)
- İmza alanları
- Otomatik tarih ve referans bilgileri

## Troubleshooting

### Deployment Hataları:
- Puppeteer hatası alıyorsanız, jsPDF versiyonu kullanılıyor
- Build hatası için: `npm ci` ile clean install yapın
- TypeScript hatası: `next.config.js`'de `ignoreBuildErrors: true` ayarı mevcut

### Veritabanı Bağlantısı:
- `.env.local` dosyasında `DATABASE_URL` kontrol edin
- PostgreSQL sunucusunun çalıştığından emin olun
- Migration'ları çalıştırmayı unutmayın

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## Lisans

MIT

## İletişim

Proje Sahibi: Hakan Yıldırım
- GitHub: [@Hakanyildirimdan](https://github.com/Hakanyildirimdan)
- Email: hakanyildirimdan@gmail.com

## Değişiklik Geçmişi

### v1.1.0 (2025-06-30)
- ✅ Mutabakat detay sayfası eklendi
- ✅ PDF oluşturma (jsPDF ile)
- ✅ Dosya yükleme sistemi
- ✅ Yorum sistemi
- ✅ Onay/Red işlemleri
- ✅ Deployment optimization (Puppeteer → jsPDF)

### v1.0.0 (2025-06-29)
- ✅ Temel dashboard
- ✅ Mutabakat listesi
- ✅ Yeni kayıt oluşturma
- ✅ Filtreleme ve arama
