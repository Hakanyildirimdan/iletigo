import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      );
    }

    // Get reconciliation data with all related information
    const reconciliationQuery = `
      SELECT 
        r.*,
        c.name as company_name,
        c.tax_number,
        c.address as company_address,
        c.phone as company_phone,
        c.email as company_email,
        rp.name as period_name,
        rp.start_date,
        rp.end_date,
        u1.first_name || ' ' || u1.last_name as assigned_to_name,
        u2.first_name || ' ' || u2.last_name as created_by_name
      FROM reconciliations r
      LEFT JOIN companies c ON r.company_id = c.id
      LEFT JOIN reconciliation_periods rp ON r.period_id = rp.id
      LEFT JOIN users u1 ON r.assigned_to = u1.id
      LEFT JOIN users u2 ON r.created_by = u2.id
      WHERE r.id = $1
    `;

    const reconciliationResult = await query(reconciliationQuery, [id]);
    
    if (reconciliationResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Mutabakat bulunamadı' },
        { status: 404 }
      );
    }

    const reconciliation = reconciliationResult.rows[0];

    // Get reconciliation details
    const detailsQuery = `
      SELECT * FROM reconciliation_details 
      WHERE reconciliation_id = $1 
      ORDER BY line_number
    `;
    const detailsResult = await query(detailsQuery, [id]);

    // Generate PDF content as HTML (in a real app, you'd use a library like puppeteer or jsPDF)
    const htmlContent = generatePDFHTML(reconciliation, detailsResult.rows);

    // For now, we'll return the HTML content
    // In a production app, you'd convert this to PDF using a library
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="mutabakat_${reconciliation.reference_number}.pdf"`
      }
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'PDF oluşturma hatası' },
      { status: 500 }
    );
  }
}

function generatePDFHTML(reconciliation: any, details: any[]) {
  const currentDate = new Date().toLocaleDateString('tr-TR');
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Mutabakat Raporu - ${reconciliation.reference_number}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-info { margin-bottom: 20px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table th, .info-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .info-table th { background-color: #f2f2f2; }
        .amount-summary { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .amount-box { border: 1px solid #ddd; padding: 15px; text-align: center; width: 30%; }
        .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .details-table th, .details-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .details-table th { background-color: #f2f2f2; }
        .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
        .signature-box { border: 1px solid #ddd; padding: 20px; width: 45%; text-align: center; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>MUTABAKAT RAPORU</h1>
        <h3>Referans No: ${reconciliation.reference_number}</h3>
    </div>

    <div class="company-info">
        <table class="info-table">
            <tr>
                <th>Şirket Adı</th>
                <td>${reconciliation.company_name}</td>
                <th>Vergi No</th>
                <td>${reconciliation.tax_number || '-'}</td>
            </tr>
            <tr>
                <th>Dönem</th>
                <td>${reconciliation.period_name}</td>
                <th>Dönem Tarihi</th>
                <td>${new Date(reconciliation.start_date).toLocaleDateString('tr-TR')} - ${new Date(reconciliation.end_date).toLocaleDateString('tr-TR')}</td>
            </tr>
            <tr>
                <th>Mutabakat Başlığı</th>
                <td colspan="3">${reconciliation.title}</td>
            </tr>
            <tr>
                <th>Açıklama</th>
                <td colspan="3">${reconciliation.description || '-'}</td>
            </tr>
            <tr>
                <th>Durum</th>
                <td>${getStatusText(reconciliation.status)}</td>
                <th>Oluşturulma Tarihi</th>
                <td>${new Date(reconciliation.created_at).toLocaleDateString('tr-TR')}</td>
            </tr>
        </table>
    </div>

    <div class="amount-summary">
        <div class="amount-box">
            <h4>Bizim Tutar</h4>
            <h2>${reconciliation.our_amount.toLocaleString('tr-TR')} ${reconciliation.currency}</h2>
        </div>
        <div class="amount-box">
            <h4>Onların Tutarı</h4>
            <h2>${reconciliation.their_amount.toLocaleString('tr-TR')} ${reconciliation.currency}</h2>
        </div>
        <div class="amount-box">
            <h4>Fark</h4>
            <h2 style="color: ${Math.abs(reconciliation.difference) > 0 ? 'red' : 'green'}">
                ${reconciliation.difference.toLocaleString('tr-TR')} ${reconciliation.currency}
            </h2>
        </div>
    </div>

    ${details.length > 0 ? `
    <h3>Detaylar</h3>
    <table class="details-table">
        <thead>
            <tr>
                <th>Sıra</th>
                <th>Açıklama</th>
                <th>Bizim Tutar</th>
                <th>Onların Tutarı</th>
                <th>Fark</th>
                <th>Notlar</th>
            </tr>
        </thead>
        <tbody>
            ${details.map(detail => `
                <tr>
                    <td>${detail.line_number}</td>
                    <td>${detail.description}</td>
                    <td>${detail.our_amount.toLocaleString('tr-TR')}</td>
                    <td>${detail.their_amount.toLocaleString('tr-TR')}</td>
                    <td style="color: ${Math.abs(detail.difference) > 0 ? 'red' : 'green'}">
                        ${detail.difference.toLocaleString('tr-TR')}
                    </td>
                    <td>${detail.notes || '-'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    ` : ''}

    <div class="signature-section">
        <div class="signature-box">
            <h4>ONAYLAYAN</h4>
            <br><br><br>
            <p>_____________________</p>
            <p>Ad Soyad</p>
            <p>Tarih: ${currentDate}</p>
        </div>
        <div class="signature-box">
            <h4>KARŞI TARAF</h4>
            <br><br><br>
            <p>_____________________</p>
            <p>Ad Soyad</p>
            <p>Tarih: ${currentDate}</p>
        </div>
    </div>

    <div class="footer">
        <p>Bu belge ${currentDate} tarihinde İletigo Mutabakat Sistemi tarafından oluşturulmuştur.</p>
    </div>
</body>
</html>`;
}

function getStatusText(status: string) {
  switch (status) {
    case 'pending': return 'Beklemede';
    case 'matched': return 'Eşleşti';
    case 'disputed': return 'Uyuşmazlık';
    case 'resolved': return 'Çözüldü';
    case 'cancelled': return 'İptal Edildi';
    default: return status;
  }
}
