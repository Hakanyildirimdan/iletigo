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

    // Generate HTML content for client-side PDF generation
    const htmlContent = generatePDFHTML(reconciliation, detailsResult.rows);

    // Log activity
    const activityQuery = `
      INSERT INTO activity_logs (user_id, action, table_name, record_id, new_values)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    // Note: In a real app, you'd get user_id from the JWT token
    const userId = 1; // Placeholder
    
    await query(activityQuery, [
      userId,
      'GENERATE_PDF',
      'reconciliations',
      id,
      JSON.stringify({ reference_number: reconciliation.reference_number })
    ]);

    // Return HTML for client-side PDF generation
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'X-PDF-Filename': `mutabakat_${reconciliation.reference_number}.pdf`
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
        @media print {
            @page { margin: 20mm; }
            body { -webkit-print-color-adjust: exact; }
        }
        
        body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 20px;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        
        .header h1 {
            color: #333;
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        
        .header h3 {
            color: #666;
            margin: 10px 0 0 0;
            font-size: 16px;
        }
        
        .company-info { 
            margin-bottom: 20px; 
        }
        
        .info-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
        }
        
        .info-table th, .info-table td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
            font-size: 11px;
        }
        
        .info-table th { 
            background-color: #f8f9fa; 
            font-weight: bold;
            width: 25%;
        }
        
        .amount-summary { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 20px; 
            gap: 10px;
        }
        
        .amount-box { 
            border: 2px solid #ddd; 
            padding: 15px; 
            text-align: center; 
            flex: 1;
            border-radius: 5px;
        }
        
        .amount-box h4 {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 12px;
        }
        
        .amount-box h2 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
        }
        
        .amount-box.positive h2 { color: #28a745; }
        .amount-box.negative h2 { color: #dc3545; }
        .amount-box.neutral h2 { color: #6c757d; }
        
        .details-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px; 
        }
        
        .details-table th, .details-table td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
            font-size: 10px;
        }
        
        .details-table th { 
            background-color: #f8f9fa; 
            font-weight: bold;
        }
        
        .details-table td.number {
            text-align: right;
        }
        
        .signature-section { 
            margin-top: 50px; 
            display: flex; 
            justify-content: space-between; 
            gap: 20px;
        }
        
        .signature-box { 
            border: 1px solid #ddd; 
            padding: 20px; 
            flex: 1; 
            text-align: center; 
            min-height: 100px;
            border-radius: 5px;
        }
        
        .signature-box h4 {
            margin: 0 0 20px 0;
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        
        .signature-line {
            border-bottom: 1px solid #333;
            width: 200px;
            margin: 40px auto 10px auto;
            height: 1px;
        }
        
        .footer { 
            margin-top: 30px; 
            text-align: center; 
            font-size: 10px; 
            color: #666; 
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-pending { background-color: #fff3cd; color: #856404; }
        .status-matched { background-color: #d4edda; color: #155724; }
        .status-disputed { background-color: #f8d7da; color: #721c24; }
        .status-resolved { background-color: #d1ecf1; color: #0c5460; }
        .status-cancelled { background-color: #e2e3e5; color: #383d41; }
        
        .pdf-actions {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        
        @media print {
            .pdf-actions { display: none; }
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.6.0/jspdf.plugin.autotable.min.js"></script>
</head>
<body>
    <div class="pdf-actions">
        <button onclick="generatePDF()" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">PDF İndir</button>
        <button onclick="window.print()" style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Yazdır</button>
    </div>

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
            ${reconciliation.description ? `
            <tr>
                <th>Açıklama</th>
                <td colspan="3">${reconciliation.description}</td>
            </tr>
            ` : ''}
            <tr>
                <th>Durum</th>
                <td><span class="status-badge status-${reconciliation.status}">${getStatusText(reconciliation.status)}</span></td>
                <th>Oluşturulma Tarihi</th>
                <td>${new Date(reconciliation.created_at).toLocaleDateString('tr-TR')}</td>
            </tr>
            ${reconciliation.assigned_to_name ? `
            <tr>
                <th>Sorumlu</th>
                <td>${reconciliation.assigned_to_name}</td>
                <th>Oluşturan</th>
                <td>${reconciliation.created_by_name || '-'}</td>
            </tr>
            ` : ''}
        </table>
    </div>

    <div class="amount-summary">
        <div class="amount-box">
            <h4>BİZİM TUTAR</h4>
            <h2>${reconciliation.our_amount.toLocaleString('tr-TR')} ${reconciliation.currency}</h2>
        </div>
        <div class="amount-box">
            <h4>ONLARIN TUTARI</h4>
            <h2>${reconciliation.their_amount.toLocaleString('tr-TR')} ${reconciliation.currency}</h2>
        </div>
        <div class="amount-box ${Math.abs(reconciliation.difference) > 0 ? 'negative' : 'neutral'}">
            <h4>FARK</h4>
            <h2>${reconciliation.difference.toLocaleString('tr-TR')} ${reconciliation.currency}</h2>
        </div>
    </div>

    ${details.length > 0 ? `
    <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">DETAYLAR</h3>
    <table class="details-table" id="details-table">
        <thead>
            <tr>
                <th style="width: 5%;">Sıra</th>
                <th style="width: 35%;">Açıklama</th>
                <th style="width: 15%;">Bizim Tutar</th>
                <th style="width: 15%;">Onların Tutarı</th>
                <th style="width: 15%;">Fark</th>
                <th style="width: 15%;">Notlar</th>
            </tr>
        </thead>
        <tbody>
            ${details.map(detail => `
                <tr>
                    <td style="text-align: center;">${detail.line_number}</td>
                    <td>${detail.description}</td>
                    <td class="number">${detail.our_amount.toLocaleString('tr-TR')}</td>
                    <td class="number">${detail.their_amount.toLocaleString('tr-TR')}</td>
                    <td class="number" style="color: ${Math.abs(detail.difference) > 0 ? '#dc3545' : '#28a745'}; font-weight: bold;">
                        ${detail.difference.toLocaleString('tr-TR')}
                    </td>
                    <td>${detail.notes || '-'}</td>
                </tr>
            `).join('')}
        </tbody>
        <tfoot>
            <tr style="background-color: #f8f9fa; font-weight: bold;">
                <td colspan="2" style="text-align: right;">TOPLAM:</td>
                <td class="number">${details.reduce((sum, d) => sum + d.our_amount, 0).toLocaleString('tr-TR')}</td>
                <td class="number">${details.reduce((sum, d) => sum + d.their_amount, 0).toLocaleString('tr-TR')}</td>
                <td class="number" style="color: ${Math.abs(details.reduce((sum, d) => sum + d.difference, 0)) > 0 ? '#dc3545' : '#28a745'};">
                    ${details.reduce((sum, d) => sum + d.difference, 0).toLocaleString('tr-TR')}
                </td>
                <td></td>
            </tr>
        </tfoot>
    </table>
    ` : ''}

    <div class="signature-section">
        <div class="signature-box">
            <h4>ONAYLAYAN (İLETİGO)</h4>
            <div class="signature-line"></div>
            <p><strong>Ad Soyad:</strong> _____________________</p>
            <p><strong>İmza:</strong></p>
            <p><strong>Tarih:</strong> ${currentDate}</p>
        </div>
        <div class="signature-box">
            <h4>KARŞI TARAF (${reconciliation.company_name.toUpperCase()})</h4>
            <div class="signature-line"></div>
            <p><strong>Ad Soyad:</strong> _____________________</p>
            <p><strong>İmza:</strong></p>
            <p><strong>Tarih:</strong> ${currentDate}</p>
        </div>
    </div>

    <div class="footer">
        <p><strong>Bu belge ${currentDate} tarihinde İletigo Mutabakat Yönetim Sistemi tarafından otomatik olarak oluşturulmuştur.</strong></p>
        <p>Belge ID: ${reconciliation.reference_number} | Oluşturma Zamanı: ${new Date().toLocaleString('tr-TR')}</p>
    </div>

    <script>
        function generatePDF() {
            // Hide PDF actions for clean PDF
            document.querySelector('.pdf-actions').style.display = 'none';
            
            // Use jsPDF to generate PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            // Add title
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('MUTABAKAT RAPORU', 105, 20, { align: 'center' });
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text('Referans No: ${reconciliation.reference_number}', 105, 30, { align: 'center' });
            
            // Add company info
            let yPos = 50;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Şirket Bilgileri', 20, yPos);
            
            yPos += 10;
            doc.setFont('helvetica', 'normal');
            doc.text('Şirket: ${reconciliation.company_name}', 20, yPos);
            yPos += 7;
            doc.text('Vergi No: ${reconciliation.tax_number || '-'}', 20, yPos);
            yPos += 7;
            doc.text('Dönem: ${reconciliation.period_name}', 20, yPos);
            yPos += 7;
            doc.text('Başlık: ${reconciliation.title}', 20, yPos);
            
            // Add amounts
            yPos += 20;
            doc.setFont('helvetica', 'bold');
            doc.text('Tutar Özeti', 20, yPos);
            
            yPos += 10;
            doc.setFont('helvetica', 'normal');
            doc.text('Bizim Tutar: ${reconciliation.our_amount.toLocaleString('tr-TR')} ${reconciliation.currency}', 20, yPos);
            yPos += 7;
            doc.text('Onların Tutarı: ${reconciliation.their_amount.toLocaleString('tr-TR')} ${reconciliation.currency}', 20, yPos);
            yPos += 7;
            doc.text('Fark: ${reconciliation.difference.toLocaleString('tr-TR')} ${reconciliation.currency}', 20, yPos);
            
            // Add details table if exists
            ${details.length > 0 ? `
            yPos += 20;
            const tableData = [
                ${details.map(detail => `['${detail.line_number}', '${detail.description}', '${detail.our_amount.toLocaleString('tr-TR')}', '${detail.their_amount.toLocaleString('tr-TR')}', '${detail.difference.toLocaleString('tr-TR')}']`).join(',')}
            ];
            
            doc.autoTable({
                head: [['Sıra', 'Açıklama', 'Bizim Tutar', 'Onların Tutarı', 'Fark']],
                body: tableData,
                startY: yPos,
                theme: 'grid',
                styles: { fontSize: 8 },
                headStyles: { fillColor: [248, 249, 250] }
            });
            ` : ''}
            
            // Add signature section
            const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : yPos + 20;
            doc.setFont('helvetica', 'bold');
            doc.text('İmza Alanları', 20, finalY);
            
            doc.setFont('helvetica', 'normal');
            doc.text('ONAYLAYAN (İLETİGO)', 30, finalY + 20);
            doc.line(30, finalY + 40, 80, finalY + 40);
            doc.text('Ad Soyad: _______________', 30, finalY + 50);
            doc.text('Tarih: ${currentDate}', 30, finalY + 60);
            
            doc.text('KARŞI TARAF (${reconciliation.company_name.toUpperCase()})', 110, finalY + 20);
            doc.line(110, finalY + 40, 160, finalY + 40);
            doc.text('Ad Soyad: _______________', 110, finalY + 50);
            doc.text('Tarih: ${currentDate}', 110, finalY + 60);
            
            // Save PDF
            doc.save('mutabakat_${reconciliation.reference_number}.pdf');
            
            // Show PDF actions again
            document.querySelector('.pdf-actions').style.display = 'block';
        }
    </script>
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
