import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Demo data (in real app, this would come from database)
let reconciliationsStorage = [
  {
    id: 1,
    reference_number: 'MUT-2024-001',
    title: 'Ocak Ayi Satis Mutabakati',
    company_name: 'ABC Sirket Ltd.',
    company_code: 'ABC123',
    our_amount: 15000.00,
    their_amount: 14800.00,
    difference: 200.00,
    currency: 'TRY',
    status: 'pending',
    priority: 'high',
    due_date: '2024-02-15',
    assigned_to: 'Admin User',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:20:00Z',
    reconciliation_date: '2024-01-15',
    year: 2024,
    month: 1,
    email: 'info@abcsirket.com',
    phone: '0212 123 45 67',
    type: 'mutabakat',
    debt_credit: 'borc',
    is_active: true,
    mail_status: 'not_sent',
    approval_token: null
  }
  // ... other reconciliations would be here
]

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reconciliationId = parseInt(params.id)
    
    // Find the reconciliation
    const reconciliation = reconciliationsStorage.find(r => r.id === reconciliationId)
    
    if (!reconciliation) {
      return NextResponse.json(
        { error: 'Mutabakat kaydı bulunamadı' },
        { status: 404 }
      )
    }

    if (!reconciliation.email) {
      return NextResponse.json(
        { error: 'Email adresi bulunamadı' },
        { status: 400 }
      )
    }

    // Generate approval token
    const approvalToken = crypto.randomUUID()
    
    // Update reconciliation with token and mail status
    reconciliation.approval_token = approvalToken
    reconciliation.mail_status = 'sent'
    reconciliation.updated_at = new Date().toISOString()

    // In real app, here you would:
    // 1. Generate HTML email template
    // 2. Send email via service like Nodemailer, SendGrid, etc.
    // 3. Include approval/reject links with token
    
    // Mock email content
    const emailContent = generateEmailTemplate(reconciliation, approvalToken)
    
    // Log for demo purposes (in real app, this would be actual email sending)
    console.log('Email sent to:', reconciliation.email)
    console.log('Approval Token:', approvalToken)
    console.log('Email Content:', emailContent)

    // Mock successful email sending
    const mockEmailResponse = {
      messageId: `msg_${Date.now()}`,
      status: 'sent',
      recipient: reconciliation.email
    }

    return NextResponse.json({
      success: true,
      message: `Mutabakat formu ${reconciliation.email} adresine gönderildi`,
      data: {
        reconciliation_id: reconciliationId,
        email: reconciliation.email,
        approval_token: approvalToken,
        approval_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reconciliation/approve/${approvalToken}`,
        reject_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reconciliation/reject/${approvalToken}`,
        email_response: mockEmailResponse
      }
    })

  } catch (error) {
    console.error('Send mail error:', error)
    return NextResponse.json(
      { error: 'Mail gönderilirken hata oluştu' },
      { status: 500 }
    )
  }
}

function generateEmailTemplate(reconciliation: any, approvalToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const approveUrl = `${baseUrl}/reconciliation/approve/${approvalToken}`
  const rejectUrl = `${baseUrl}/reconciliation/reject/${approvalToken}`

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mutabakat Onay Formu</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .reconciliation-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .amount-box { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
        .amount { font-size: 24px; font-weight: bold; color: #1976d2; }
        .button { display: inline-block; padding: 12px 30px; margin: 10px 5px; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center; }
        .btn-approve { background: #4caf50; color: white; }
        .btn-reject { background: #f44336; color: white; }
        .btn-approve:hover { background: #45a049; }
        .btn-reject:hover { background: #da190b; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 İletigo Mutabakat Sistemi</h1>
            <p>Mutabakat Onay Formu</p>
        </div>
        
        <div class="content">
            <h2>Sayın ${reconciliation.company_name} Yetkilileri,</h2>
            
            <p>Aşağıda belirtilen mutabakat bilgilerini incelemenizi ve onaylamanızı rica ederiz.</p>
            
            <div class="reconciliation-details">
                <h3>📋 Mutabakat Detayları</h3>
                <p><strong>Referans No:</strong> ${reconciliation.reference_number}</p>
                <p><strong>Şirket:</strong> ${reconciliation.company_name}</p>
                <p><strong>Şirket Kodu:</strong> ${reconciliation.company_code}</p>
                <p><strong>Dönem:</strong> ${reconciliation.month}/${reconciliation.year}</p>
                <p><strong>Mutabakat Tarihi:</strong> ${new Date(reconciliation.reconciliation_date).toLocaleDateString('tr-TR')}</p>
                <p><strong>İşlem Türü:</strong> ${getTypeLabel(reconciliation.type)}</p>
                <p><strong>Borç/Alacak:</strong> ${reconciliation.debt_credit === 'borc' ? 'Borç' : 'Alacak'}</p>
            </div>
            
            <div class="amount-box">
                <p><strong>Mutabakat Tutarı</strong></p>
                <div class="amount">${reconciliation.our_amount.toLocaleString('tr-TR')} ₺</div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Önemli:</strong> Bu mutabakat formunu inceleyerek aşağıdaki butonlardan birini kullanarak yanıtlayınız.
                Link 7 gün süreyle geçerlidir.
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${approveUrl}" class="button btn-approve">✅ ONAYLA</a>
                <a href="${rejectUrl}" class="button btn-reject">❌ REDDET</a>
            </div>
            
            <p><strong>İletişim Bilgileri:</strong></p>
            <p>📧 Email: ${reconciliation.email}</p>
            <p>📞 Telefon: ${reconciliation.phone}</p>
            
            <div class="footer">
                <p>Bu email İletigo Mutabakat Sistemi tarafından otomatik olarak gönderilmiştir.</p>
                <p>© ${new Date().getFullYear()} İletigo. Tüm hakları saklıdır.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `
}

function getTypeLabel(type: string): string {
  const types = {
    'mutabakat': 'Mutabakat',
    'cari_bakiye_hatirlatma': 'Cari Bakiye Hatırlatma',
    'bilgilendirme': 'Bilgilendirme'
  }
  return types[type as keyof typeof types] || type
}