import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'
import { LoginSchema } from '@/lib/validations'
import { logActivity, getRequestMetadata, LOG_ACTIONS } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = LoginSchema.parse(body)
    const { email, password } = validatedData
    
    // Find user
    const userResult = await query(
      'SELECT id, email, password_hash, first_name, last_name, role, department, is_active FROM users WHERE email = $1',
      [email]
    )
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'E-posta veya şifre hatalı' },
        { status: 401 }
      )
    }
    
    const user = userResult.rows[0]
    
    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Hesabınız deaktif durumda' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'E-posta veya şifre hatalı' },
        { status: 401 }
      )
    }
    
    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    )
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      department: user.department
    })
    
    // Log activity
    const metadata = getRequestMetadata(request)
    await logActivity({
      user_id: user.id,
      action: LOG_ACTIONS.LOGIN,
      table_name: 'users',
      record_id: user.id,
      ...metadata
    })
    
    // Return user info and token
    const { password_hash, ...userWithoutPassword } = user
    
    return NextResponse.json({
      user: userWithoutPassword,
      token,
      message: 'Giriş başarılı'
    })
    
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Geçersiz giriş verileri' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}