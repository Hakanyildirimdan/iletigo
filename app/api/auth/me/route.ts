import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const tokenUser = await getUserFromRequest(request)
    
    if (!tokenUser) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }
    
    // Get fresh user data from database
    const userResult = await query(
      `SELECT id, email, first_name, last_name, role, department, 
              phone, is_active, last_login, created_at 
       FROM users WHERE id = $1 AND is_active = true`,
      [tokenUser.userId]
    )
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }
    
    const user = userResult.rows[0]
    
    return NextResponse.json({ user })
    
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}