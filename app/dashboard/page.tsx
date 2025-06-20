'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'from-green-400 to-green-600'
      case 'pending': return 'from-yellow-400 to-orange-500'
      case 'disputed': return 'from-red-400 to-red-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'resolved': return 'Çözüldü'
      case 'pending': return 'Beklemede'
      case 'disputed': return 'İtilaflı'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-white/10 rounded-full -mr-16 sm:-mr-24 lg:-mr-32 -mt-16 sm:-mt-24 lg:-mt-32"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 lg:w-48 lg:h-48 bg-white/10 rounded-full -ml-12 sm:-ml-18 lg:-ml-24 -mb-12 sm:-mb-18 lg:-mb-24"></div>
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3">
            İletigo Dashboard 👋
          </h2>
          <p className="text-white/90 text-sm sm:text-base lg:text-lg">
            Bugün {new Date().toLocaleDateString('tr-TR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })} - Sistemde her şey yolunda
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="group bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Toplam Mutabakat</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 truncate">
                {stats?.totals?.total_reconciliations || 0}
              </p>
              <div className="flex items-center text-green-600 text-xs sm:text-sm">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5-5 5 5M7 7l5 5 5-5" />
                </svg>
                +12% bu ay
              </div>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 ml-3">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="group bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Aktif Şirketler</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 truncate">
                {stats?.totals?.total_companies || 0}
              </p>
              <div className="flex items-center text-green-600 text-xs sm:text-sm">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5-5 5 5M7 7l5 5 5-5" />
                </svg>
                +3 yeni şirket
              </div>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 ml-3">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="group bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Aktif Kullanıcılar</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 truncate">
                {stats?.totals?.total_users || 0}
              </p>
              <div className="flex items-center text-blue-600 text-xs sm:text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Hepsi online
              </div>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 ml-3">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="group bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Geciken İşler</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600 mb-2 truncate">
                {stats?.overdue_count || 0}
              </p>
              <div className="flex items-center text-red-600 text-xs sm:text-sm">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Acil müdahale
              </div>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 ml-3">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Status Chart */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20">
          <div className="p-4 sm:p-6 border-b border-gray-200/50">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Mutabakat Durumları</h3>
            <p className="text-gray-600 text-xs sm:text-sm">Anlık durum analizi</p>
          </div>
          <div className="p-4 sm:p-6">
            {stats?.reconciliation_stats && (
              <div className="space-y-4 sm:space-y-6">
                {stats.reconciliation_stats.map((stat: any, index: number) => (
                  <div key={index} className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r ${getStatusColor(stat.status)}`}></div>
                        <span className="font-semibold text-gray-800 text-sm sm:text-base truncate">{getStatusText(stat.status)}</span>
                        <span className="text-xs sm:text-sm text-gray-500">({stat.count} adet)</span>
                      </div>
                      <span className="font-bold text-gray-900 text-xs sm:text-sm whitespace-nowrap ml-2">
                        ₺{stat.total_difference.toLocaleString('tr-TR')}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                      <div 
                        className={`h-2 sm:h-3 bg-gradient-to-r ${getStatusColor(stat.status)} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${Math.min((stat.count / 20) * 100, 100)}%` }}
                      ></div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                      Ortalama: ₺{stat.avg_difference.toLocaleString('tr-TR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20">
          <div className="p-4 sm:p-6 border-b border-gray-200/50">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Son Aktiviteler</h3>
            <p className="text-gray-600 text-xs sm:text-sm">Sistem etkinlikleri</p>
          </div>
          <div className="p-4 sm:p-6 max-h-80 overflow-y-auto">
            <div className="space-y-3 sm:space-y-4">
              {[
                { action: 'Yeni mutabakat oluşturuldu', user: 'Admin User', time: '2 dakika önce', type: 'create' },
                { action: 'Şirket bilgileri güncellendi', user: 'Manager', time: '15 dakika önce', type: 'update' },
                { action: 'Rapor dışa aktarıldı', user: 'Admin User', time: '1 saat önce', type: 'export' },
                { action: 'Yeni kullanıcı eklendi', user: 'Admin User', time: '2 saat önce', type: 'create' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-xl hover:bg-white/50 transition-all duration-200">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mt-2 ${
                    activity.type === 'create' ? 'bg-green-400' :
                    activity.type === 'update' ? 'bg-blue-400' :
                    'bg-purple-400'
                  } animate-pulse`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                    <p className="text-xs text-gray-600 truncate">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Hızlı İşlemler</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {[
            { title: 'Yeni Mutabakat', desc: 'Mutabakat kaydı oluştur', icon: '📝', color: 'from-indigo-400 to-indigo-600', href: '/dashboard/reconciliations/new' },
            { title: 'Şirket Ekle', desc: 'Yeni şirket kaydı', icon: '🏢', color: 'from-green-400 to-green-600', href: '/dashboard/companies/new' },
            { title: 'Raporlar', desc: 'Detaylı analiz', icon: '📈', color: 'from-purple-400 to-purple-600', href: '/dashboard/reports' },
          ].map((action, index) => (
            <Link key={index} href={action.href} className="group p-4 sm:p-6 border border-gray-200/50 rounded-xl sm:rounded-2xl hover:bg-white/80 text-left transition-all duration-300 hover:scale-105 hover:shadow-xl block">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${action.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 text-lg sm:text-xl lg:text-2xl`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 text-sm sm:text-base truncate">{action.title}</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{action.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}