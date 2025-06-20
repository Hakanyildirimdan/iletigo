'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/')
      return
    }
    
    setUser(JSON.parse(userData))
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/')
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Mutabakatlar', href: '/dashboard/reconciliations', icon: '📋' },
    { name: 'Yeni Mutabakat', href: '/dashboard/reconciliations/new', icon: '📝' },
    { name: 'Şirketler', href: '/dashboard/companies', icon: '🏢' },
    { name: 'Kullanıcılar', href: '/dashboard/users', icon: '👥' },
    { name: 'Raporlar', href: '/dashboard/reports', icon: '📈' },
    { name: 'Ayarlar', href: '/dashboard/settings', icon: '⚙️' },
  ]

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-white/80 lg:backdrop-blur-lg lg:shadow-xl lg:border-r lg:border-white/20">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200/50">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-white rounded-full opacity-80"></div>
                <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-white rounded-full opacity-80"></div>
                <div className="absolute bottom-1.5 left-1.5 w-1 h-1 bg-white rounded-full opacity-80"></div>
                <div className="absolute bottom-1.5 right-1.5 w-1 h-1 bg-white rounded-full opacity-80"></div>
                <svg className="w-5 h-5 text-white z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900">İletigo</h1>
              <p className="text-xs text-gray-600">Mutabakat Sistemi</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 mt-8 px-4 overflow-y-auto">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white/50 hover:text-indigo-600'
                    }`}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200/50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-lg shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Logo & Close */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900">İletigo</h1>
                <p className="text-xs text-gray-600">Mutabakat Sistemi</p>
              </div>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 mt-6 px-4 overflow-y-auto">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white/50 hover:text-indigo-600'
                    }`}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Mobile User Info */}
          <div className="p-4 border-t border-gray-200/50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 px-4 py-3 lg:px-6 lg:py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title */}
            <div className="flex-1 lg:flex-none ml-4 lg:ml-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-600 hidden sm:block">
                Hoş geldiniz, {user?.first_name}
              </p>
            </div>

            {/* Mobile User Avatar */}
            <div className="lg:hidden">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
            </div>

            {/* Desktop Date */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('tr-TR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}