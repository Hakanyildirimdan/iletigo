import { NextRequest, NextResponse } from 'next/server'

// Demo dashboard stats endpoint
export async function GET(request: NextRequest) {
  try {
    // Demo statistics
    const stats = {
      reconciliation_stats: [
        { status: 'pending', count: 5, total_difference: 15000, avg_difference: 3000 },
        { status: 'resolved', count: 12, total_difference: 8000, avg_difference: 667 },
        { status: 'disputed', count: 2, total_difference: 5000, avg_difference: 2500 }
      ],
      totals: {
        total_reconciliations: 19,
        total_companies: 8,
        total_users: 3,
        active_periods: 1
      },
      recent_activity: [
        {
          action: 'login',
          table_name: 'users',
          created_at: new Date().toISOString(),
          user_name: 'Admin User'
        }
      ],
      overdue_count: 3
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}