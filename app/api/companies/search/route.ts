import { NextRequest, NextResponse } from 'next/server'

// Demo companies data (this would come from database in real app)
const demoCompanies = [
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
  },
  {
    id: 4,
    code: 'GHI999',
    name: 'GHI İnşaat A.Ş.',
    contact_person: 'Fatma Özkan',
    email: 'info@ghiinsaat.com',
    phone: '0312 444 55 66',
    mobile_phone: '0544 444 55 66'
  },
  {
    id: 5,
    code: 'JKL-CONS',
    name: 'JKL Consulting Ltd.',
    contact_person: 'Ahmet Kaya',
    email: 'hello@jklcons.com',
    phone: '0216 777 88 99',
    mobile_phone: '0532 777 88 99'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')?.toUpperCase()
    
    if (!code) {
      return NextResponse.json(
        { error: 'Company code is required' },
        { status: 400 }
      )
    }

    // Search for company by code (exact match)
    const company = demoCompanies.find(c => c.code === code)
    
    if (company) {
      return NextResponse.json({
        success: true,
        company: company
      })
    } else {
      return NextResponse.json({
        success: true,
        company: null,
        message: 'Company not found'
      })
    }

  } catch (error) {
    console.error('Company search API error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}