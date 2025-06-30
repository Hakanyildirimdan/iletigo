'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Upload, Check, X, FileText, MessageSquare, Paperclip, Clock, User, Building, Calendar, DollarSign, AlertCircle } from 'lucide-react';

interface ReconciliationDetail {
  id: number;
  line_number: number;
  description: string;
  our_amount: number;
  their_amount: number;
  difference: number;
  notes: string;
}

interface Attachment {
  id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: number;
  uploaded_at: string;
}

interface Comment {
  id: number;
  user_id: number;
  content: string;
  is_internal: boolean;
  created_at: string;
  user_name: string;
}

interface Reconciliation {
  id: number;
  reference_number: string;
  title: string;
  description: string;
  our_amount: number;
  their_amount: number;
  difference: number;
  currency: string;
  status: string;
  priority: string;
  due_date: string;
  company_name: string;
  period_name: string;
  assigned_to_name: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  details: ReconciliationDetail[];
  attachments: Attachment[];
  comments: Comment[];
}

export default function ReconciliationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [reconciliation, setReconciliation] = useState<Reconciliation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    fetchReconciliation();
  }, [id]);

  const fetchReconciliation = async () => {
    try {
      const response = await fetch(`/api/reconciliations/${id}`);
      if (!response.ok) {
        throw new Error('Mutabakat bulunamadı');
      }
      const data = await response.json();
      setReconciliation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!reconciliation) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/reconciliations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Durum güncellenemedi');
      }

      setReconciliation({ ...reconciliation, status: newStatus });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncelleme hatası');
    } finally {
      setUpdating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'extract' | 'signed_pdf') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(`/api/reconciliations/${id}/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Dosya yüklenemedi');
      }

      await fetchReconciliation();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yükleme hatası');
    } finally {
      setUploading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/reconciliations/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, is_internal: true }),
      });

      if (!response.ok) {
        throw new Error('Yorum eklenemedi');
      }

      setNewComment('');
      await fetchReconciliation();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yorum ekleme hatası');
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const response = await fetch(`/api/reconciliations/${id}/pdf`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Rapor oluşturulamadı');
      }

      const htmlContent = await response.text();
      
      const newWindow = window.open('', '_blank', 'width=1024,height=768');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        newWindow.focus();
      } else {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mutabakat_${reconciliation?.reference_number}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rapor oluşturma hatası');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'matched': return 'bg-green-100 text-green-800 border-green-200';
      case 'disputed': return 'bg-red-100 text-red-800 border-red-200';
      case 'resolved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'matched': return 'Eşleşti';
      case 'disputed': return 'Uyuşmazlık';
      case 'resolved': return 'Çözüldü';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Hata</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reconciliation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Mutabakat bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri Dön
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{reconciliation.title}</h1>
              <p className="text-sm text-gray-500">Referans: {reconciliation.reference_number}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(reconciliation.status)}`}>
              {getStatusText(reconciliation.status)}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(reconciliation.priority)}`}>
              {reconciliation.priority}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Temel Bilgiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Şirket:</span>
                <span className="text-sm font-medium">{reconciliation.company_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Dönem:</span>
                <span className="text-sm font-medium">{reconciliation.period_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Atanan:</span>
                <span className="text-sm font-medium">{reconciliation.assigned_to_name || 'Atanmamış'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Son Tarih:</span>
                <span className="text-sm font-medium">
                  {reconciliation.due_date ? new Date(reconciliation.due_date).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                </span>
              </div>
            </div>
            {reconciliation.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Açıklama:</p>
                <p className="text-sm text-gray-900 mt-1">{reconciliation.description}</p>
              </div>
            )}
          </div>

          {/* Amount Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tutar Özeti</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-blue-400" />
                  <span className="ml-2 text-sm font-medium text-blue-900">Bizim Tutar</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-2">
                  {reconciliation.our_amount.toLocaleString('tr-TR')} {reconciliation.currency}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <span className="ml-2 text-sm font-medium text-green-900">Onların Tutarı</span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-2">
                  {reconciliation.their_amount.toLocaleString('tr-TR')} {reconciliation.currency}
                </p>
              </div>
              <div className={`rounded-lg p-4 ${Math.abs(reconciliation.difference) > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                <div className="flex items-center">
                  <DollarSign className={`h-5 w-5 ${Math.abs(reconciliation.difference) > 0 ? 'text-red-400' : 'text-gray-400'}`} />
                  <span className={`ml-2 text-sm font-medium ${Math.abs(reconciliation.difference) > 0 ? 'text-red-900' : 'text-gray-900'}`}>
                    Fark
                  </span>
                </div>
                <p className={`text-2xl font-bold mt-2 ${Math.abs(reconciliation.difference) > 0 ? 'text-red-900' : 'text-gray-900'}`}>
                  {reconciliation.difference.toLocaleString('tr-TR')} {reconciliation.currency}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          {reconciliation.details.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Detaylar</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Açıklama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bizim Tutar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Onların Tutarı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fark
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reconciliation.details.map((detail) => (
                      <tr key={detail.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {detail.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {detail.our_amount.toLocaleString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {detail.their_amount.toLocaleString('tr-TR')}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          Math.abs(detail.difference) > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {detail.difference.toLocaleString('tr-TR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Yorumlar</h2>
            
            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Yorum ekle..."
                    rows={3}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ekle
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {reconciliation.comments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{comment.user_name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              ))}
              {reconciliation.comments.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Henüz yorum yapılmamış.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">İşlemler</h3>
            <div className="space-y-3">
              {reconciliation.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusUpdate('matched')}
                    disabled={updating}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Onayla
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('disputed')}
                    disabled={updating}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reddet
                  </button>
                </div>
              )}
              
              <button
                onClick={handleGeneratePDF}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Rapor İndir
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dosya Yükleme</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ekstre Yükle
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.xls,.xlsx,.csv"
                    onChange={(e) => handleFileUpload(e, 'extract')}
                    className="hidden"
                    id="extract-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="extract-upload"
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Yükleniyor...' : 'Ekstre Seç'}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İmzalı PDF Yükle
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e, 'signed_pdf')}
                    className="hidden"
                    id="signed-pdf-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="signed-pdf-upload"
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {uploading ? 'Yükleniyor...' : 'İmzalı PDF Seç'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          {reconciliation.attachments.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Eklenen Dosyalar</h3>
              <div className="space-y-3">
                {reconciliation.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attachment.file_name}</p>
                        <p className="text-xs text-gray-500">
                          {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <a
                      href={attachment.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
