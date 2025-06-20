import { NextRequest, NextResponse } from 'next/server'

// Demo reconciliations data
const demoReconciliations = [
  {
    id: 1,
    reference_number: 'MUT-2024-001',
    title: 'Ocak Ayi Satis Mutabakati',
    company_name: 'ABC Sirket Ltd.',
    our_amount: 15000.00,
    their_amount: 14800.00,
    difference: 200.00,
    currency: 'TRY',
    status: 'pending',
    priority: 'high',
    due_date: '2024-02-15',
    assigned_to: 'Admin User',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:20:00Z'
  },
  {
    id: 2,
    reference_number: 'MUT-2024-002',
    title: 'Subat Ayi Alim Mutabakati',
    company_name: 'XYZ Corp A.S.',
    our_amount: 25000.00,
    their_amount: 25000.00,
    difference: 0.00,
    currency: 'TRY',
    status: 'resolved',
    priority: 'medium',
    due_date: '2024-03-15',
    assigned_to: 'Manager User',
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-02-10T16:45:00Z'
  },
  {
    id: 3,
    reference_number: 'MUT-2024-003',
    title: 'Mart Ayi Hizmet Mutabakati',
    company_name: 'DEF Teknoloji Ltd.',
    our_amount: 8500.00,
    their_amount: 9200.00,
    difference: -700.00,
    currency: 'TRY',
    status: 'disputed',
    priority: 'urgent',
    due_date: '2024-04-10',
    assigned_to: 'Admin User',
    created_at: '2024-03-05T11:20:00Z',
    updated_at: '2024-03-12T13:30:00Z'
  },
  {
    id: 4,
    reference_number: 'MUT-2024-004',
    title: 'Nisan Ayi Urun Satis Mutabakati',
    company_name: 'GHI Insaat A.S.',
    our_amount: 35000.00,
    their_amount: 34500.00,
    difference: 500.00,
    currency: 'TRY',
    status: 'pending',
    priority: 'medium',
    due_date: '2024-05-15',
    assigned_to: 'User Staff',
    created_at: '2024-04-02T08:45:00Z',
    updated_at: '2024-04-08T10:15:00Z'
  },
  {
    id: 5,
    reference_number: 'MUT-2024-005',
    title: 'Mayis Ayi Danismanlik Mutabakati',
    company_name: 'JKL Consulting Ltd.',
    our_amount: 12000.00,
    their_amount: 12000.00,
    difference: 0.00,
    currency: 'TRY',
    status: 'resolved',
    priority: 'low',
    due_date: '2024-06-20',
    assigned_to: 'Manager User',
    created_at: '2024-05-01T14:10:00Z',
    updated_at: '2024-05-15T09:25:00Z'
  },
  {
    id: 6,
    reference_number: 'MUT-2024-006',
    title: 'Haziran Ayi Lojistik Mutabakati',
    company_name: 'MNO Lojistik A.S.',
    our_amount: 18500.00,
    their_amount: 17900.00,
    difference: 600.00,
    currency: 'TRY',
    status: 'pending',
    priority: 'high',
    due_date: '2024-07-10',
    assigned_to: 'Admin User',
    created_at: '2024-06-03T16:30:00Z',
    updated_at: '2024-06-18T11:40:00Z'
  }
]

// Demo companies data
let demoCompanies = [
  {
    id: 1,
    code: 'ABC123',
    name: 'ABC Şirket Ltd.',
    contact_person: 'Ali Veli',
    email: 'info@abcsirket.com',
    phone: '0212 123 45 67',
    mobile_phone: '0555 123 45 67'
  },
  {
    id: 2,
    code: 'XYZ001',
    name: 'XYZ Corp A.Ş.',
    contact_person: 'Mehmet Yılmaz',
    email: 'contact@xyzcorp.com',
    phone: '0212 987 65 43',
    mobile_phone: '0555 987 65 43'
  },
  {
    id: 3,
    code: 'DEF-500',
    name: 'DEF Teknoloji Ltd.',
    contact_person: 'Ayşe Demir',
    email: 'bilgi@deftek.com',
    phone: '0216 555 11 22',
    mobile_phone: '0533 555 11 22'
  }
]

// In-memory storage for new data
let reconciliationsStorage = [...demoReconciliations]
let companiesStorage = [...demoCompanies]
let nextReconciliationId = 7
let nextCompanyId = 4

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    
    let filteredData = [...reconciliationsStorage]
    
    // Filter by status
    if (status && status !== 'all') {
      filteredData = filteredData.filter(item => item.status === status)
    }
    
    // Filter by priority
    if (priority && priority !== 'all') {
      filteredData = filteredData.filter(item => item.priority === priority)
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredData = filteredData.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.company_name.toLowerCase().includes(searchLower) ||
        item.reference_number.toLowerCase().includes(searchLower)
      )
    }
    
    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = filteredData.slice(startIndex, endIndex)
    
    return NextResponse.json({
      data: paginatedData,
      pagination: {
        current_page: page,
        per_page: limit,
        total: filteredData.length,
        total_pages: Math.ceil(filteredData.length / limit)
      },
      filters: {
        status,
        priority,
        search
      }
    })
    
  } catch (error) {
    console.error('Reconciliations API error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['company_code', 'company_name', 'email', 'phone', 'type', 'debt_credit', 'amount', 'reconciliation_date']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Check if company exists, if not create it
    let company = companiesStorage.find(c => c.code === body.company_code.toUpperCase())
    
    if (!company) {
      // Create new company
      company = {
        id: nextCompanyId++,
        code: body.company_code.toUpperCase(),
        name: body.company_name,
        contact_person: body.contact_person || '',
        email: body.email,
        phone: body.phone,
        mobile_phone: body.mobile_phone || ''
      }
      companiesStorage.push(company)
    } else {
      // Update existing company with new information
      company.name = body.company_name
      company.contact_person = body.contact_person || company.contact_person
      company.email = body.email
      company.phone = body.phone
      company.mobile_phone = body.mobile_phone || company.mobile_phone
    }

    // Generate reference number
    const year = new Date().getFullYear()
    const referenceNumber = `MUT-${year}-${String(nextReconciliationId).padStart(3, '0')}`

    // Create reconciliation record
    const newReconciliation = {
      id: nextReconciliationId++,
      reference_number: referenceNumber,
      title: `${body.company_name} - ${body.type} (${body.debt_credit})`,
      company_name: body.company_name,
      company_code: body.company_code.toUpperCase(),
      our_amount: parseFloat(body.amount),
      their_amount: 0, // Will be filled later during reconciliation process
      difference: parseFloat(body.amount), // Initially equals our amount
      currency: 'TRY',
      status: 'pending',
      priority: body.amount > 50000 ? 'high' : body.amount > 20000 ? 'medium' : 'low',
      type: body.type,
      debt_credit: body.debt_credit,
      due_date: body.due_date || null,
      reconciliation_date: body.reconciliation_date,
      year: body.year,
      month: body.month,
      description: body.description || '',
      contact_person: body.contact_person || '',
      email: body.email,
      phone: body.phone,
      mobile_phone: body.mobile_phone || '',
      assigned_to: 'Admin User', // This would come from auth in real app
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Add to storage
    reconciliationsStorage.push(newReconciliation)

    return NextResponse.json({
      success: true,
      message: 'Mutabakat başarıyla oluşturuldu',
      data: newReconciliation,
      company: company
    }, { status: 201 })

  } catch (error) {
    console.error('POST Reconciliation error:', error)
    return NextResponse.json(
      { error: 'Mutabakat oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}