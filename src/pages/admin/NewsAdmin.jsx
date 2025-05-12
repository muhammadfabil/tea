import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Plus, Search, Edit, Trash, Eye, Calendar, User,
  Mail, ImageIcon, CheckCircle, XCircle, RefreshCw, Save,
  Filter, FileText, MoreVertical, ArrowLeft, Globe,
  ClipboardEdit, AlertTriangle, X, Upload
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { createClient } from "@supabase/supabase-js";
import { useDropzone } from "react-dropzone";

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API = import.meta.env.VITE_API_BASE_URL;


const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

const NewsAdmin = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState(null); // 'create', 'edit', 'view'
  const [selectedNews, setSelectedNews] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [savingForm, setSavingForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const formRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    author_name: 'Admin',
    author_email: '',
    picture_url: '',
    picture_file: null,
    picture_description: '',
    title: '',
    subtitle: '',
    content: '',
    status: 'draft'
  });

  // Load news on component mount
  useEffect(() => {
    fetchNews();
    return () => {
    toast.dismiss();
  };
  }, []);

  // Fetch news from API
  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/berita/all`);
      setNewsList(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Gagal memuat data berita');
    } finally {
      setLoading(false);
    }
  };

  // Dropzone configuration for image uploads
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFormData((prev) => ({ 
        ...prev, 
        picture_file: file,
        // Create a preview URL for the image
        picture_url: URL.createObjectURL(file)
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif']
    },
    maxFiles: 1,
    maxSize: 5242880, // 5MB
  });

  useEffect(() => {
    if (fileRejections.length > 0) {
      toast.error("File tidak valid. Hanya gambar JPG, PNG, WEBP, atau GIF yang diperbolehkan (maks. 5MB).");
    }
  }, [fileRejections]);

  // Fix createNews function to properly handle whitespace and ensure data consistency

  const createNews = async () => {
    if (!validateForm()) return;

    try {
      setSavingForm(true);

      // Prepare FormData for multipart/form-data
      const formPayload = new FormData(); // Renamed to avoid shadowing
      formPayload.append("author_name", formData.author_name || "Admin");
      formPayload.append("title", formData.title.trim());
      formPayload.append("content", formData.content.trim());
      formPayload.append("status", formData.status || "draft");

      if (formData.author_email?.trim()) {
        formPayload.append("author_email", formData.author_email.trim());
      }
      if (formData.subtitle?.trim()) {
        formPayload.append("subtitle", formData.subtitle.trim());
      }
      if (formData.picture_description?.trim()) {
        formPayload.append("picture_description", formData.picture_description.trim());
      }
      if (formData.picture_file) {
        formPayload.append("picture", formData.picture_file);
      }

      // Send the request
      const response = await axios.post(`${API}/berita/baru`, formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 10000, // 10 seconds timeout
      });

      setNewsList((prevList) => [response.data, ...prevList]);
      resetForm();
      setFormMode(null);
      toast.success("Berita berhasil dibuat");
    } catch (error) {
      console.error("Error creating news:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.detail ||
          (error.response.status === 422
            ? "Validasi data gagal. Periksa kembali isian Anda."
            : "Gagal membuat berita baru");
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error("Server tidak merespon. Silakan coba lagi.");
      } else {
        toast.error("Gagal membuat berita baru: " + error.message);
      }
    } finally {
      setSavingForm(false);
    }
  };

  // Fix updateNews function to properly handle whitespace and ensure data consistency

  const updateNews = async () => {
    if (!validateForm()) return;

    try {
      setSavingForm(true);

      // Prepare FormData for multipart/form-data
      const formPayload = new FormData();
      formPayload.append("author_name", formData.author_name || "Admin");
      formPayload.append("title", formData.title.trim());
      formPayload.append("content", formData.content.trim());
      formPayload.append("status", formData.status || "draft");

      if (formData.author_email?.trim()) {
        formPayload.append("author_email", formData.author_email.trim());
      }
      if (formData.subtitle?.trim()) {
        formPayload.append("subtitle", formData.subtitle.trim());
      }
      if (formData.picture_description?.trim()) {
        formPayload.append("picture_description", formData.picture_description.trim());
      }
      if (formData.picture_file) {
        formPayload.append("picture", formData.picture_file);
      }

      // Send the update request
      const response = await axios.put(
        `${API}/berita/${selectedNews.news_id}`, // Updated URL
        formPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      // Update the news list with the updated news item
      setNewsList((prevList) =>
        prevList.map((item) =>
          item.news_id === selectedNews.news_id ? response.data : item
        )
      );

      resetForm();
      setFormMode(null);
      setSelectedNews(null);
      toast.success("Berita berhasil diperbarui");
    } catch (error) {
      console.error("Error updating news:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.detail ||
          (error.response.status === 422
            ? "Validasi data gagal. Periksa kembali isian Anda."
            : "Gagal memperbarui berita");
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error("Server tidak merespon. Silakan coba lagi.");
      } else {
        toast.error("Gagal memperbarui berita: " + error.message);
      }
    } finally {
      setSavingForm(false);
    }
  };
  
  // Delete news
  const deleteNews = async (newsId) => {
    try {
      setLoading(true);
      await axios.delete(`${API}/berita/${newsId}`); // Updated URL
      
      setNewsList(prevList => prevList.filter(item => item.news_id !== newsId));
      setConfirmDelete(null);
      toast.success('Berita berhasil dihapus');
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('Gagal menghapus berita');
    } finally {
      setLoading(false);
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Judul berita tidak boleh kosong';
    }
    
    if (!formData.content || formData.content.trim() === '') {
      errors.content = 'Konten berita tidak boleh kosong';
    }
    
    if (formData.author_email && !/\S+@\S+\.\S+/.test(formData.author_email)) {
      errors.author_email = 'Format email tidak valid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Handle Rich Text Editor (Quill) changes
  const handleEditorChange = (content) => {
    setFormData({
      ...formData,
      content
    });
    
    // Clear error when user types
    if (formErrors.content) {
      setFormErrors({
        ...formErrors,
        content: null
      });
    }
  };

  // Remove selected image file
  const removeImageFile = () => {
    URL.revokeObjectURL(formData.picture_url); // Clean up URL object
    setFormData(prev => ({
      ...prev,
      picture_file: null,
      picture_url: '' // Clear the URL as well
    }));
  };

  // Open create form
  const handleCreateNews = () => {
    resetForm();
    setFormMode('create');
    // Scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Open edit form
  const handleEditNews = (news) => {
    setSelectedNews(news);
    setFormData({
      author_name: news.author_name || 'Admin',
      author_email: news.author_email || '',
      picture_url: news.picture_url || '',
      picture_file: null,
      picture_description: news.picture_description || '',
      title: news.title || '',
      subtitle: news.subtitle || '',
      content: news.content || '',
      status: news.status || 'draft'
    });
    setFormMode('edit');
    // Scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // View news details
  const handleViewNews = (news) => {
    setSelectedNews(news);
    setFormMode('view');
  };

  // Reset form
  const resetForm = () => {
    // Clean up any existing object URLs
    if (formData.picture_file) {
      URL.revokeObjectURL(formData.picture_url);
    }
    
    setFormData({
      author_name: 'Admin',
      author_email: '',
      picture_url: '',
      picture_file: null,
      picture_description: '',
      title: '',
      subtitle: '',
      content: '',
      status: 'draft'
    });
    setFormErrors({});
  };

  // Cancel form
  const handleCancelForm = () => {
    setFormMode(null);
    setSelectedNews(null);
    resetForm();
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy, HH:mm', { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  // Filter news list
  const filteredNews = newsList.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Quick publish/unpublish news
  const toggleNewsStatus = async (news) => {
    try {
      const newStatus = news.status === 'published' ? 'draft' : 'published';
      
      // Use JSON payload with only the required fields
      const payload = {
        status: newStatus
      };
      
      const response = await axios.put(`${API}/berita/${news.news_id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setNewsList(prevList => 
        prevList.map(item => 
          item.news_id === news.news_id ? response.data : item
        )
      );
      
      toast.success(`Berita ${newStatus === 'published' ? 'dipublikasikan' : 'dikembalikan ke draft'}`);
    } catch (error) {
      console.error('Error updating news status:', error);
      toast.error('Gagal mengubah status berita');
    }
  };

  // React Quill modules and formats configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Kelola Berita</h1>
            <p className="text-gray-600">Buat, edit, dan publikasikan berita untuk mahasiswa dan dosen</p>
          </div>
          <button
            onClick={handleCreateNews}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Berita Baru
          </button>
        </div>
      </div>

      {/* News Form */}
      {formMode && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6" ref={formRef}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {formMode === 'create' && (
                <ClipboardEdit size={22} className="text-blue-600" />
              )}
              {formMode === 'edit' && (
                <Edit size={22} className="text-amber-600" />
              )}
              {formMode === 'view' && (
                <Eye size={22} className="text-green-600" />
              )}
              
              <h2 className="text-xl font-bold text-gray-800">
                {formMode === 'create' && 'Tambah Berita Baru'}
                {formMode === 'edit' && 'Edit Berita'}
                {formMode === 'view' && 'Detail Berita'}
              </h2>
            </div>
            
            <button 
              onClick={handleCancelForm}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {formMode === 'view' ? (
            <div className="space-y-6">
              {selectedNews.picture_url && (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={selectedNews.picture_url} 
                    alt={selectedNews.picture_description || selectedNews.title}
                    className="w-full max-h-[400px] object-cover"
                  />
                  {selectedNews.picture_description && (
                    <div className="bg-gray-50 p-3 text-sm text-gray-600">
                      {selectedNews.picture_description}
                    </div>
                  )}
                </div>
              )}
              
              <div className="border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{selectedNews.title}</h1>
                {selectedNews.subtitle && (
                  <p className="text-lg text-gray-600">{selectedNews.subtitle}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-500" />
                  <span className="text-gray-700">Penulis: {selectedNews.author_name}</span>
                </div>
                
                {selectedNews.author_email && (
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-500" />
                    <span className="text-gray-700">Email: {selectedNews.author_email}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-gray-700">Dibuat: {formatDate(selectedNews.created_at)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    selectedNews.status === 'published' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedNews.status === 'published' ? (
                      <>
                        <Globe size={12} />
                        Dipublikasikan
                      </>
                    ) : (
                      <>
                        <Edit size={12} />
                        Draft
                      </>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedNews.content }} />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => handleEditNews(selectedNews)}
                  className="px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg font-medium flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit Berita
                </button>
                <button
                  onClick={() => setConfirmDelete(selectedNews.news_id)}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium flex items-center gap-2"
                >
                  <Trash size={16} />
                  Hapus
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Berita <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Masukkan judul berita"
                    className={`w-full px-4 py-2 border ${formErrors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    disabled={formMode === 'view'}
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subjudul
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="Masukkan subjudul (opsional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={formMode === 'view'}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Penulis
                  </label>
                  <input
                    type="text"
                    name="author_name"
                    value={formData.author_name}
                    onChange={handleInputChange}
                    placeholder="Nama penulis"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={formMode === 'view'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Penulis
                  </label>
                  <input
                    type="email"
                    name="author_email"
                    value={formData.author_email}
                    onChange={handleInputChange}
                    placeholder="Email penulis (opsional)"
                    className={`w-full px-4 py-2 border ${formErrors.author_email ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    disabled={formMode === 'view'}
                  />
                  {formErrors.author_email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.author_email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={formMode === 'view'}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gambar Berita
                </label>
                
                {/* Image preview if already uploaded */}
                {formData.picture_url && !formData.picture_file && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={formData.picture_url} 
                      alt={formData.picture_description || "Preview"}
                      className="w-full max-h-[300px] object-cover"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/800x400?text=Gambar+Tidak+Tersedia';
                      }}
                    />
                    {formData.picture_description && (
                      <div className="bg-gray-50 p-3 text-sm text-gray-600">
                        {formData.picture_description}
                      </div>
                    )}
                    <div className="bg-gray-50 border-t border-gray-200 p-3 flex justify-between items-center">
                      <span className="text-sm text-gray-500">Gambar saat ini</span>
                      <button
                        type="button"
                        onClick={removeImageFile}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1.5"
                      >
                        <X size={16} />
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
                
                {/* New image preview if just uploaded */}
                {formData.picture_file && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={formData.picture_url} 
                      alt={formData.picture_description || "Preview"}
                      className="w-full max-h-[300px] object-cover"
                    />
                    <div className="bg-green-50 border-t border-green-200 p-3 flex justify-between items-center">
                      <span className="text-sm text-green-700 font-medium flex items-center gap-1.5">
                        <CheckCircle size={16} />
                        {formData.picture_file.name} ({(formData.picture_file.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                      <button
                        type="button"
                        onClick={removeImageFile}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1.5"
                      >
                        <X size={16} />
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Image dropzone if no image or after removing current image */}
                {!formData.picture_url && !formData.picture_file && (
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                      isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center">
                      <div className={`p-4 rounded-full ${isDragActive ? "bg-blue-100" : "bg-gray-100"} mb-3`}>
                        <Upload className={`w-8 h-8 ${isDragActive ? "text-blue-600" : "text-gray-400"}`} />
                      </div>
                      {isDragActive ? (
                        <p className="text-blue-600 font-medium">Lepaskan gambar di sini...</p>
                      ) : (
                        <>
                          <p className="text-gray-700 font-medium">Tarik gambar ke sini atau klik untuk memilih</p>
                          <p className="text-sm text-gray-500 mt-2">JPG, PNG, WEBP, atau GIF (Maks. 5MB)</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi Gambar
                  </label>
                  <input
                    type="text"
                    name="picture_description"
                    value={formData.picture_description}
                    onChange={handleInputChange}
                    placeholder="Deskripsi gambar (opsional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={formMode === 'view'}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konten Berita <span className="text-red-500">*</span>
                </label>
                <div className={formErrors.content ? 'border border-red-300 rounded-lg' : ''}>
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={handleEditorChange}
                    modules={modules}
                    formats={formats}
                    className="bg-white rounded-lg"
                    style={{ minHeight: '200px' }}
                  />
                </div>
                {formErrors.content && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.content}</p>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={formMode === 'create' ? createNews : updateNews}
                  disabled={savingForm}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  {savingForm ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {formMode === 'create' ? 'Simpan Berita' : 'Update Berita'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
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

      {/* News list */}
      {loading && newsList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border">
          <RefreshCw size={32} className="mx-auto text-blue-400 animate-spin mb-4" />
          <p className="text-gray-500">Memuat berita...</p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="bg-gray-50 rounded-xl shadow-sm p-8 text-center border">
          <FileText size={32} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">Tidak ada berita</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || filterStatus !== 'all' 
              ? 'Tidak ada hasil yang ditemukan untuk pencarian Anda.' 
              : 'Belum ada berita yang dibuat.'}
          </p>
          {(searchQuery || filterStatus !== 'all') && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Judul
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Penulis
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dibuat
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredNews.map((item) => (
                  <tr key={item.news_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start">
                        {item.picture_url ? (
                          <div className="h-10 w-16 bg-gray-100 rounded overflow-hidden mr-3 flex-shrink-0">
                            <img 
                              src={item.picture_url} 
                              alt="" 
                              className="h-full w-full object-cover" 
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = 'https://via.placeholder.com/160x100?text=No+Image';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-16 bg-gray-100 rounded overflow-hidden mr-3 flex-shrink-0 flex items-center justify-center">
                            <ImageIcon size={16} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</div>
                          {item.subtitle && (
                            <div className="text-xs text-gray-500 line-clamp-1">{item.subtitle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.author_name || 'Admin'}</div>
                      {item.author_email && (
                        <div className="text-xs text-gray-500">{item.author_email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleNewsStatus(item)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          item.status === 'published' 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                      >
                        {item.status === 'published' ? (
                          <>
                            <CheckCircle size={12} />
                            Published
                          </>
                        ) : (
                          <>
                            <Edit size={12} />
                            Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewNews(item)}
                          className="p-1.5 text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 rounded"
                          title="Lihat"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditNews(item)}
                          className="p-1.5 text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(item.news_id)}
                          className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded"
                          title="Hapus"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-none bg-opacity-50 flex items-center justify-center z-50 p-4  backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-medium">Konfirmasi Hapus</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus berita ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium"
              >
                Batal
              </button>
              <button
                onClick={() => deleteNews(confirmDelete)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2"
              >
                <Trash size={16} />
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default NewsAdmin;