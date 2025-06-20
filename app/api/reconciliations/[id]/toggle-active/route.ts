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
    mail_status: 'not_sent',
    approval_token: null
  }
  // ... other reconciliations would be here
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reconciliationId = parseInt(params.id)
    const body = await request.json()
    
    // Find the reconciliation
    const reconciliationIndex = reconciliationsStorage.findIndex(r => r.id === reconciliationId)
    
    if (reconciliationIndex === -1) {
      return NextResponse.json(
        { error: 'Mutabakat kaydı bulunamadı' },
        { status: 404 }
      )
    }

    const reconciliation = reconciliationsStorage[reconciliationIndex]

    // Validate request body
    if (typeof body.is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active alanı boolean olmalıdır' },
        { status: 400 }
      )
    }

    // Update the active status
    const oldStatus = reconciliation.is_active
    reconciliation.is_active = body.is_active
    reconciliation.updated_at = new Date().toISOString()

    // Update the reconciliation in storage
    reconciliationsStorage[reconciliationIndex] = reconciliation

    // Generate appropriate message
    const statusMessage = body.is_active ? 'aktif' : 'pasif'
    const actionMessage = body.is_active ? 'etkinleştirildi' : 'devre dışı bırakıldı'

    return NextResponse.json({
      success: true,
      message: `Mutabakat kaydı başarıyla ${actionMessage}`,
      data: {
        reconciliation_id: reconciliationId,
        reference_number: reconciliation.reference_number,
        company_name: reconciliation.company_name,
        old_status: oldStatus,
        new_status: body.is_active,
        status_label: statusMessage,
        updated_at: reconciliation.updated_at
      }
    })

  } catch (error) {
    console.error('Toggle active status error:', error)
    return NextResponse.json(
      { error: 'Durum değiştirilirken hata oluştu' },
      { status: 500 }
    )
  }
}