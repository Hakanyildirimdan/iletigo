'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/')
      return
    }
    
    setUser(JSON.parse(userData))
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                📊
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">İletigo Dashboard</h1>
                <p className="text-sm text-gray-600">Mutabakat Yönetim Sistemi</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
              </div>
              
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition duration-200"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Hoş geldiniz, {user?.first_name}!
          </h2>
          <p className="text-gray-600">
            İletigo Mutabakat Yönetim Sistemi'ne başarıyla giriş yaptınız.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Mutabakat</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500">Database bağlandığında güncellenecek</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                📊
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif Şirketler</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500">Database bağlandığında güncellenecek</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                🏢
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bekleyen İşler</p>
                <p className="text-2xl font-bold text-yellow-600">0</p>
                <p className="text-xs text-gray-500">Database bağlandığında güncellenecek</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                ⏳
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  📝
                </div>
                <div>
                  <p className="font-medium text-gray-900">Yeni Mutabakat</p>
                  <p className="text-sm text-gray-600">Mutabakat kaydı oluştur</p>
                </div>
              </div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  🏢
                </div>
                <div>
                  <p className="font-medium text-gray-900">Şirket Ekle</p>
                  <p className="text-sm text-gray-600">Yeni şirket kaydı</p>
                </div>
              </div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  📈
                </div>
                <div>
                  <p className="font-medium text-gray-900">Raporlar</p>
                  <p className="text-sm text-gray-600">Detaylı analiz</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Sistem Durumu</h3>
          <p className="text-blue-700 mb-4">
            Sistem demo modunda çalışıyor. PostgreSQL database bağlantısı kurulduğunda tüm özellikler aktif olacak.
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm text-blue-700">Login/Logout sistemi aktif</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">⏳</span>
              <span className="text-sm text-blue-700">PostgreSQL bağlantısı hazırlanıyor</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">⏳</span>
              <span className="text-sm text-blue-700">Database migration bekliyor</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">⏳</span>
              <span className="text-sm text-blue-700">API endpoints hazırlanıyor</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white border border-blue-300 rounded">
            <p className="text-xs text-blue-600 font-medium">Database Bilgileri:</p>
            <p className="text-xs text-blue-600">Host: 178.18.206.227:5433</p>
            <p className="text-xs text-blue-600">Database: postgres</p>
            <p className="text-xs text-blue-600">Status: Hazır, migration bekleniyor</p>
          </div>
        </div>
      </main>
    </div>
  )
}