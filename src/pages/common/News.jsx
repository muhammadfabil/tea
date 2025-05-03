import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Clock, Calendar, ChevronRight, Search, RefreshCw, 
  User, Mail, Tag, ExternalLink, FileText, X, ArrowLeft
} from 'lucide-react';
import DOMPurify from 'dompurify';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API}/berita`);
      setNews(response.data);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Gagal memuat berita. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm', { locale: id });
    } catch (error) {
      return '';
    }
  };

  const handleOpenNews = (news) => {
    setSelectedNews(news);
    // Scroll ke atas saat membuka berita
    window.scrollTo(0, 0);
  };

  const handleCloseNews = () => {
    setSelectedNews(null);
  };

  // Filter news berdasarkan query dan status
  const filteredNews = news.filter(item => {
    const matchesQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesQuery && matchesStatus;
  });

  // Sanitize HTML content
  const createSafeHTML = (html) => {
    // Replace all http:// with https:// in the HTML
    const httpsHtml = html ? html.replace(/http:\/\//g, "https://") : "";
    return {
      __html: DOMPurify.sanitize(httpsHtml)
    };
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Berita & Pengumuman</h1>
          <p className="text-blue-100">Informasi terbaru untuk mahasiswa dan dosen</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
        {!selectedNews ? (
          <>
            {/* Search and filter */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cari berita..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <select
                    className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Semua Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                  
                  <button
                    onClick={fetchNews}
                    className="px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg flex items-center gap-2"
                  >
                    <RefreshCw size={18} className="text-blue-500" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* News List */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <RefreshCw size={36} className="mx-auto text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600">Memuat berita...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 rounded-xl shadow-sm p-8 text-center border border-red-100">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={fetchNews}
                  className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg inline-flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Coba Lagi
                </button>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FileText size={40} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Tidak ada berita</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery ? 'Tidak ada hasil yang ditemukan untuk pencarian Anda.' : 'Belum ada berita yang dipublikasikan.'}
                </p>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg"
                  >
                    Reset Pencarian
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((item) => (
                  <div 
                    key={item.news_id} 
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer group"
                    onClick={() => handleOpenNews(item)}
                  >
                    {item.picture_url && (
                      <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
                        <img 
                          src={item.picture_url} 
                          alt={item.picture_description || item.title} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          item.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {item.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition mb-2 line-clamp-2">{item.title}</h2>
                      {item.subtitle && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.subtitle}</p>
                      )}
                      <div className="pt-3 border-t flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-1.5 truncate max-w-[150px]">
                          <User className="w-4 h-4 text-gray-400" />
                          {item.author_name}
                        </span>
                        <button className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center gap-1 group-hover:gap-2 transition-all">
                          Baca <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* News Detail View */}
            <div className="relative">
              <button 
                className="absolute top-4 left-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-gray-700 hover:bg-white transition-all"
                onClick={handleCloseNews}
              >
                <ArrowLeft size={20} />
              </button>
              
              {/* Header content */}
              <div className="px-6 md:px-12 pt-12 pb-6">
                <div className="max-w-4xl mx-auto">
                  <div className="flex flex-wrap gap-2 items-center mb-6">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      selectedNews.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedNews.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(selectedNews.created_at)}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(selectedNews.created_at)}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{selectedNews.title}</h1>
                  {selectedNews.subtitle && (
                    <p className="text-xl text-gray-600 mb-6">{selectedNews.subtitle}</p>
                  )}
                </div>
              </div>
              
              {/* Featured Image - Full width */}
              {selectedNews.picture_url && (
                <div className="w-full overflow-hidden bg-gray-900">
                  <div className="max-w-5xl mx-auto">
                    <div className="relative">
                      <img 
                        src={selectedNews.picture_url} 
                        alt={selectedNews.picture_description || selectedNews.title} 
                        className="w-full object-contain max-h-[70vh]"
                      />
                      {selectedNews.picture_description && (
                        <div className="bg-black/70 text-white text-sm py-2 px-4 w-full text-center">
                          {selectedNews.picture_description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Author info */}
              <div className="px-6 md:px-12 pt-8">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center gap-4 py-4 mb-6 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{selectedNews.author_name}</p>
                        {selectedNews.author_email && (
                          <a 
                            href={`mailto:${selectedNews.author_email}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {selectedNews.author_email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="px-6 md:px-12 pb-12">
                <div className="max-w-4xl mx-auto">
                  {/* Custom styling for React Quill content */}
                  <div 
                    className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 
                      prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline 
                      prose-img:rounded-lg prose-img:mx-auto prose-img:shadow-sm
                      prose-strong:font-semibold prose-strong:text-gray-800
                      prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                      prose-blockquote:border-l-4 prose-blockquote:border-blue-300 prose-blockquote:bg-blue-50 prose-blockquote:p-4
                      prose-li:marker:text-gray-500"
                    dangerouslySetInnerHTML={createSafeHTML(selectedNews.content)} 
                  />
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-6 md:px-12 pb-6">
                <div className="max-w-4xl mx-auto border-t pt-6">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {selectedNews.update_at && selectedNews.update_at !== selectedNews.created_at && (
                        <div className="flex items-center gap-1.5">
                          <RefreshCw className="w-4 h-4" />
                          <span>Diperbarui pada: {formatDate(selectedNews.update_at)}</span>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={handleCloseNews}
                      className="text-blue-600 hover:text-blue-800 rounded-lg px-4 py-2.5 bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      Kembali ke Daftar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;