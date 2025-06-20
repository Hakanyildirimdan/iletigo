import { NextRequest, NextResponse } from 'next/server'

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
    mail_status: 'sent',
    approval_token: 'sample-token-123'
  }
  // ... other reconciliations would be here
]

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    
    // Find reconciliation by approval token
    const reconciliation = reconciliationsStorage.find(r => r.approval_token === token)
    
    if (!reconciliation) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş onay linki' },
        { status: 404 }
      )
    }

    if (reconciliation.mail_status === 'approved') {
      return NextResponse.json(
        { error: 'Bu mutabakat zaten onaylanmış' },
        { status: 400 }
      )
    }

    if (reconciliation.mail_status === 'rejected') {
      return NextResponse.json(
        { error: 'Bu mutabakat zaten reddedilmiş' },
        { status: 400 }
      )
    }

    // Update reconciliation status
    reconciliation.mail_status = 'approved'
    reconciliation.status = 'resolved'
    reconciliation.updated_at = new Date().toISOString()

    // In real app, you might also want to:
    // - Log the approval action
    // - Send notification to admin
    // - Update related financial records

    return NextResponse.json({
      success: true,
      message: 'Mutabakat başarıyla onaylandı',
      data: {
        reference_number: reconciliation.reference_number,
        company_name: reconciliation.company_name,
        amount: reconciliation.our_amount,
        currency: reconciliation.currency,
        approved_at: new Date().toISOString(),
        status: 'approved'
      }
    })

  } catch (error) {
    console.error('Approval error:', error)
    return NextResponse.json(
      { error: 'Onay işlemi sırasında hata oluştu' },
      { status: 500 }
    )
  }
}