import { NextRequest, NextResponse } from 'next/server'

// Demo login endpoint - works without database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    // Demo credentials check
    if (email === 'admin@iletigo.com' && password === 'admin123') {
      const demoUser = {
        id: 1,
        email: 'admin@iletigo.com',
        first_name: 'Admin',
        last_name: 'User', 
        role: 'admin',
        department: 'IT'
      }
      
      return NextResponse.json({
        user: demoUser,
        token: 'demo-token-' + Date.now(),
        message: 'Demo login successful'
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}