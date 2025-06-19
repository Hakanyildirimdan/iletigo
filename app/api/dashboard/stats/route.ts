import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }
    
    // Get reconciliation statistics
    const statsResult = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(ABS(difference)), 0) as total_difference,
        COALESCE(AVG(ABS(difference)), 0) as avg_difference
      FROM reconciliations 
      GROUP BY status
    `)
    
    // Get total counts
    const totalCountsResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM reconciliations) as total_reconciliations,
        (SELECT COUNT(*) FROM companies WHERE is_active = true) as total_companies,
        (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
        (SELECT COUNT(*) FROM reconciliation_periods WHERE status = 'active') as active_periods
    `)
    
    // Get recent activity
    const recentActivityResult = await query(`
      SELECT 
        al.action,
        al.table_name,
        al.created_at,
        u.first_name || ' ' || u.last_name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `)
    
    // Get overdue reconciliations
    const overdueResult = await query(`
      SELECT COUNT(*) as overdue_count
      FROM reconciliations 
      WHERE due_date < CURRENT_DATE 
      AND status NOT IN ('resolved', 'cancelled')
    `)
    
    const stats = {
      reconciliation_stats: statsResult.rows,
      totals: totalCountsResult.rows[0],
      recent_activity: recentActivityResult.rows,
      overdue_count: overdueResult.rows[0].overdue_count
    }
    
    return NextResponse.json(stats)
    
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}