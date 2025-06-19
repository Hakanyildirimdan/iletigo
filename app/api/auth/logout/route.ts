import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { logActivity, getRequestMetadata, LOG_ACTIONS } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (user) {
      // Log logout activity
      const metadata = getRequestMetadata(request)
      await logActivity({
        user_id: user.userId,
        action: LOG_ACTIONS.LOGOUT,
        table_name: 'users',
        record_id: user.userId,
        ...metadata
      })
    }
    
    return NextResponse.json({ message: 'Çıkış başarılı' })
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}