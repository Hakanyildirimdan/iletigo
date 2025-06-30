import { NextRequest, NextResponse } from 'next/server';

export async function GET(
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

    // Mock data for testing deployment
    const mockReconciliation = {
      id: id,
      reference_number: `REF-${id}`,
      title: 'Test Mutabakat',
      description: 'Test açıklama',
      our_amount: 10000,
      their_amount: 9500,
      difference: 500,
      currency: 'TRY',
      status: 'pending',
      priority: 'medium',
      due_date: '2025-07-01',
      company_name: 'Test Şirket',
      period_name: 'Q2 2025',
      assigned_to_name: 'Test User',
      created_by_name: 'Admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      details: [],
      attachments: [],
      comments: []
    };

    return NextResponse.json(mockReconciliation);
  } catch (error) {
    console.error('Reconciliation fetch error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { status } = body;
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      );
    }

    // Mock update response
    return NextResponse.json({ 
      id, 
      status, 
      updated_at: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Reconciliation update error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
