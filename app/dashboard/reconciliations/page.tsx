'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Reconciliation {
  id: number
  reference_number: string
  title: string
  company_name: string
  our_amount: number
  their_amount: number
  difference: number
  currency: string
  status: string
  priority: string
  due_date: string
  assigned_to: string
  created_at: string
  updated_at: string
}

interface ReconciliationResponse {
  data: Reconciliation[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
  filters: {
    status: string | null
    priority: string | null
    search: string | null
  }
}

export default function ReconciliationsPage() {
  const [reconciliations, setReconciliations] = useState<ReconciliationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
    page: 1
  })

  useEffect(() => {
    fetchReconciliations()
  }, [filters])

  const fetchReconciliations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: '10',
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.priority !== 'all' && { priority: filters.priority }),
        ...(filters.search && { search: filters.search })
      })
      
      const response = await fetch(`/api/reconciliations?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReconciliations(data)
      }
    } catch (error) {
      console.error('Error fetching reconciliations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      disputed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    
    const labels = {
      pending: 'Beklemede',
      resolved: 'Cozuldu',
      disputed: 'Itilafli',
      cancelled: 'Iptal'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-purple-100 text-purple-800',
      urgent: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      low: 'Dusuk',
      medium: 'Orta',
      high: 'Yuksek',
      urgent: 'Acil'
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${styles[priority as keyof typeof styles] || styles.medium}`}>
        {labels[priority as keyof typeof labels] || priority}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const isOverdue = (dueDateString: string, status: string) => {
    if (status === 'resolved') return false
    const dueDate = new Date(dueDateString)
    const today = new Date()
    return dueDate < today
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mutabakat Kayitlari</h1>
          <p className="text-gray-600">Tum mutabakat kayitlarini goruntuleyin ve yonetin</p>
        </div>
        <Link
          href="/dashboard/reconciliations/new"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Mutabakat
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
            <input
              type="text"
              placeholder="Baslik, sirket veya referans..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Tum Durumlar</option>
              <option value="pending">Beklemede</option>
              <option value="resolved">Cozuldu</option>
              <option value="disputed">Itilafli</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Oncelik</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Tum Oncelikler</option>
              <option value="low">Dusuk</option>
              <option value="medium">Orta</option>
              <option value="high">Yuksek</option>
              <option value="urgent">Acil</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: 'all', priority: 'all', search: '', page: 1 })}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {reconciliations && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <span className="font-semibold">{reconciliations.pagination.total}</span> mutabakat kaydi bulundu
            {filters.search && (
              <span> - "{filters.search}" icin arama sonuclari</span>
            )}
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referans / Baslik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sirket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutarlar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oncelik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Islemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/30 divide-y divide-gray-200">
              {reconciliations?.data.map((reconciliation) => (
                <tr key={reconciliation.id} className="hover:bg-white/50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {reconciliation.reference_number}
                      </div>
                      <div className="text-sm text-gray-600">
                        {reconciliation.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{reconciliation.company_name}</div>
                    <div className="text-sm text-gray-500">Atanan: {reconciliation.assigned_to}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900">Bizim: {formatCurrency(reconciliation.our_amount)}</div>
                      <div className="text-gray-600">Onlarin: {formatCurrency(reconciliation.their_amount)}</div>
                      <div className={`font-medium ${
                        reconciliation.difference > 0 ? 'text-green-600' :
                        reconciliation.difference < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        Fark: {formatCurrency(reconciliation.difference)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(reconciliation.status)}
                  </td>
                  <td className="px-6 py-4">
                    {getPriorityBadge(reconciliation.priority)}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${
                      isOverdue(reconciliation.due_date, reconciliation.status) ? 'text-red-600 font-medium' : 'text-gray-900'
                    }`}>
                      {formatDate(reconciliation.due_date)}
                      {isOverdue(reconciliation.due_date, reconciliation.status) && (
                        <div className="text-xs text-red-500">Gecikti!</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/reconciliations/${reconciliation.id}`}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Goruntule
                      </Link>
                      <span className="text-gray-300">|</span>
                      <Link
                        href={`/dashboard/reconciliations/${reconciliation.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Duzenle
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {reconciliations && reconciliations.pagination.total_pages > 1 && (
          <div className="bg-white/50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{(reconciliations.pagination.current_page - 1) * reconciliations.pagination.per_page + 1}</span>
                {' '}-{' '}
                <span className="font-medium">
                  {Math.min(reconciliations.pagination.current_page * reconciliations.pagination.per_page, reconciliations.pagination.total)}
                </span>
                {' '}arasi, toplam{' '}
                <span className="font-medium">{reconciliations.pagination.total}</span> kayit
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                  disabled={reconciliations.pagination.current_page <= 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Onceki
                </button>
                <span className="text-sm text-gray-700">
                  Sayfa {reconciliations.pagination.current_page} / {reconciliations.pagination.total_pages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: Math.min(reconciliations.pagination.total_pages, filters.page + 1) })}
                  disabled={reconciliations.pagination.current_page >= reconciliations.pagination.total_pages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sonraki
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {reconciliations && reconciliations.data.length === 0 && (
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Mutabakat kaydi bulunamadi</h3>
          <p className="text-gray-600 mb-6">Filtreleri degistirerek tekrar deneyin veya yeni bir mutabakat olusturun.</p>
          <Link
            href="/dashboard/reconciliations/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Mutabakat Olustur
          </Link>
        </div>
      )}
    </div>
  )
}