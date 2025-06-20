'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Company {
  id: number
  code: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  mobile_phone?: string
}

export default function NewReconciliationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [companyLoading, setCompanyLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState({
    company_code: '',
    company_name: '',
    contact_person: '',
    email: '',
    phone: '', // Şirket telefonu
    mobile_phone: '', // Cep telefonu (zorunlu değil)
    type: 'mutabakat', // mutabakat, bilgilendirme, cari_bakiye_hatirlatma
    debt_credit: 'borc', // borc, alacak
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    amount: '',
    description: '',
    due_date: '',
    reconciliation_date: new Date().toISOString().split('T')[0] // Bugünün tarihi
  })

  useEffect(() => {
    // Tarih değiştiğinde yıl ve ay otomatik güncelle
    if (formData.reconciliation_date) {
      const date = new Date(formData.reconciliation_date)
      setFormData(prev => ({
        ...prev,
        year: date.getFullYear(),
        month: date.getMonth() + 1
      }))
    }
  }, [formData.reconciliation_date])

  const handleCompanyCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase()
    setFormData(prev => ({
      ...prev,
      company_code: code
    }))

    // Eğer kod 3+ karakter ise şirket bilgilerini ara
    if (code.length >= 3) {
      setCompanyLoading(true)
      try {
        const response = await fetch(`/api/companies/search?code=${code}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.company) {
            // Şirket bulundu, bilgileri otomatik doldur
            setFormData(prev => ({
              ...prev,
              company_name: data.company.name,
              contact_person: data.company.contact_person || '',
              email: data.company.email || '',
              phone: data.company.phone || '',
              mobile_phone: data.company.mobile_phone || ''
            }))
          } else {
            // Şirket bulunamadı, sadece kodu bırak diğerlerini temizle
            setFormData(prev => ({
              ...prev,
              company_name: '',
              contact_person: '',
              email: '',
              phone: '',
              mobile_phone: ''
            }))
          }
        }
      } catch (error) {
        console.error('Error searching company:', error)
      } finally {
        setCompanyLoading(false)
      }
    } else {
      // Kod çok kısa, bilgileri temizle
      setFormData(prev => ({
        ...prev,
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        mobile_phone: ''
      }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage('')

    try {
      const response = await fetch('/api/reconciliations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      const responseData = await response.json()

      if (response.ok) {
        setSuccessMessage(`✅ ${responseData.message} - Referans: ${responseData.data.reference_number}`)
        
        // 3 saniye sonra yönlendir
        setTimeout(() => {
          router.push('/dashboard/reconciliations')
        }, 3000)
      } else {
        console.error('Mutabakat oluşturulurken hata oluştu:', responseData.error)
        alert(`Hata: ${responseData.error}`)
      }
    } catch (error) {
      console.error('Error creating reconciliation:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  const months = [
    { value: 1, label: 'Ocak' },
    { value: 2, label: 'Şubat' },
    { value: 3, label: 'Mart' },
    { value: 4, label: 'Nisan' },
    { value: 5, label: 'Mayıs' },
    { value: 6, label: 'Haziran' },
    { value: 7, label: 'Temmuz' },
    { value: 8, label: 'Ağustos' },
    { value: 9, label: 'Eylül' },
    { value: 10, label: 'Ekim' },
    { value: 11, label: 'Kasım' },
    { value: 12, label: 'Aralık' }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
              <p className="text-xs text-green-600 mt-1">Mutabakatlar sayfasına yönlendiriliyorsunuz...</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Yeni Mutabakat Oluştur
            </h1>
            <p className="text-gray-600">
              Şirket kodunu girin, bilgiler otomatik dolacaktır
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Şirket Bilgileri */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
            Şirket Bilgileri
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Şirket Kodu */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şirket Kodu *
                <span className="text-blue-600 text-xs ml-1">
                  {companyLoading ? '(Aranıyor...)' : '(3+ karakter girin, otomatik arama)'}
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="company_code"
                  value={formData.company_code}
                  onChange={handleCompanyCodeChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 uppercase tracking-wider font-mono"
                  placeholder="ABC123, XYZ-001, vb."
                  maxLength={20}
                />
                {companyLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Şirket kodu benzersiz olmalıdır. Excel aktarımında kullanılacaktır.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şirket Adı *
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="Şirket adını giriniz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yetkili Kişi
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="Yetkili kişi adı"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="email@ornek.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şirket Telefonu *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="0(212) 123 45 67"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cep Telefonu
                <span className="text-gray-400 text-xs ml-1">(İsteğe bağlı)</span>
              </label>
              <input
                type="tel"
                name="mobile_phone"
                value={formData.mobile_phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="0(555) 123 45 67"
              />
            </div>
          </div>

          {/* Şirket Durumu Bilgisi */}
          {formData.company_code.length >= 3 && (
            <div className="mt-4 p-4 rounded-xl border-l-4 border-indigo-500 bg-indigo-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {companyLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                  ) : formData.company_name ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">
                    {companyLoading ? 'Şirket aranıyor...' : 
                     formData.company_name ? `Şirket bulundu: ${formData.company_name}` :
                     'Yeni şirket oluşturulacak'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {companyLoading ? 'Lütfen bekleyin' :
                     formData.company_name ? 'Bilgiler otomatik dolduruldu' :
                     'Şirket bilgilerini manuel olarak giriniz'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mutabakat Detayları */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            Mutabakat Detayları
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İşlem Türü *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
              >
                <option value="mutabakat">Mutabakat</option>
                <option value="cari_bakiye_hatirlatma">Cari Bakiye Hatırlatma</option>
                <option value="bilgilendirme">Bilgilendirme</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Borç/Alacak Durumu *
              </label>
              <select
                name="debt_credit"
                value={formData.debt_credit}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
              >
                <option value="borc">Borç</option>
                <option value="alacak">Alacak</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tutar (₺) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mutabakat Tarihi *
              </label>
              <input
                type="date"
                name="reconciliation_date"
                value={formData.reconciliation_date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yıl (Otomatik)
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ay (Otomatik)
              </label>
              <input
                type="text"
                value={months.find(m => m.value === formData.month)?.label || ''}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vade Tarihi
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
              />
            </div>
          </div>
        </div>

        {/* Açıklama */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </span>
            Açıklama
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ek Açıklama
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
              placeholder="Mutabakat ile ilgili ek bilgiler..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Oluşturuluyor...
              </div>
            ) : (
              'Mutabakat Oluştur'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}