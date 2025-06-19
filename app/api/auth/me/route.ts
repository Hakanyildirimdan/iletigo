import { NextRequest, NextResponse } from 'next/server'

// Demo user info endpoint
export async function GET(request: NextRequest) {
  try {
    // Demo user data
    const user = {
      id: 1,
      email: 'admin@iletigo.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      department: 'IT',
      is_active: true,
      created_at: new Date().toISOString()
    }
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}