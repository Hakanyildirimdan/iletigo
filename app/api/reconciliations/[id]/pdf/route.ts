import { NextRequest, NextResponse } from 'next/server';

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

    // Mock data for PDF generation
    const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Mutabakat Raporu - REF-${id}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        h1 { color: #333; }
        .info { margin: 20px 0; }
        .print-btn { position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
        @media print { .print-btn { display: none; } }
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">🖨️ Yazdır</button>
    
    <div class="header">
        <h1>MUTABAKAT RAPORU</h1>
        <h3>Referans No: REF-${id}</h3>
    </div>
    
    <div class="info">
        <p><strong>Şirket:</strong> Test Şirket</p>
        <p><strong>Dönem:</strong> Q2 2025</p>
        <p><strong>Bizim Tutar:</strong> 10.000 TRY</p>
        <p><strong>Onların Tutarı:</strong> 9.500 TRY</p>
        <p><strong>Fark:</strong> 500 TRY</p>
        <p><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
    </div>
    
    <div style="margin-top: 50px;">
        <p><em>Bu belge test amaçlı oluşturulmuştur.</em></p>
    </div>
</body>
</html>`;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
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
