import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiUser,
  FiMail,
  FiBookOpen,
  FiCalendar,
  FiEdit,
  FiSave,
  FiX,
  FiCheck,
  FiRefreshCw,
  FiLoader
} from 'react-icons/fi';

const ProfileMahasiswa = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    topik_penelitian: '',
    semester_saat_ini: '',
    status_mahasiswa: 'Aktif'
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Get nimMahasiswa from localStorage
  const getNimMahasiswa = () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      return auth?.user?.profile?.nim;
    } catch (error) {
      console.error('Error getting NIM from localStorage:', error);
      return null;
    }
  };

  const nim = getNimMahasiswa();

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!nim) {
        setError('NIM tidak ditemukan. Silakan login ulang.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/mahasiswa/${nim}`);
        setProfile(response.data);
        setFormData({
          nama: response.data.nama || '',
          email: response.data.email || '',
          topik_penelitian: response.data.topik_penelitian || '',
          semester_saat_ini: response.data.semester_saat_ini || '',
          status_mahasiswa: response.data.status_mahasiswa || 'Aktif'
        });
        setAvatarPreview(response.data.avatar_url);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Gagal mengambil data profil. Silakan coba lagi nanti.');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [nim]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Save profile data
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare form data
      const updateData = new FormData();
      updateData.append('nama', formData.nama);
      updateData.append('email', formData.email);
      
      // Only append these if they have values
      if (formData.topik_penelitian) {
        updateData.append('topik_penelitian', formData.topik_penelitian);
      }
      
      if (formData.semester_saat_ini) {
        updateData.append('semester_saat_ini', parseInt(formData.semester_saat_ini));
      }
      
      updateData.append('status_mahasiswa', formData.status_mahasiswa);
      
      // Only append avatar if a new file was selected
      if (avatarFile) {
        updateData.append('avatar', avatarFile);
      }

      // Send request to backend
      const response = await axios.put(
        `http://127.0.0.1:8000/mahasiswa/${nim}`,
        updateData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status === 200) {
        setProfile(prev => ({
          ...prev,
          ...formData,
          avatar_url: response.data.avatar_url || avatarPreview 
        }));
        toast.success('Profil berhasil diperbarui');
        setEditing(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.detail || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      nama: profile.nama || '',
      email: profile.email || '',
      topik_penelitian: profile.topik_penelitian || '',
      semester_saat_ini: profile.semester_saat_ini || '',
      status_mahasiswa: profile.status_mahasiswa || 'Aktif'
    });
    setAvatarPreview(profile.avatar_url);
    setAvatarFile(null);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="text-blue-500 mb-4"
        >
          <FiLoader size={40} />
        </motion.div>
        <p className="text-gray-600 font-medium">Memuat data profil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 max-w-md text-center">
          <FiX className="text-red-500 mx-auto mb-4" size={40} />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw size={16} />
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6 sm:px-8 sm:py-8 text-white relative">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-white shadow-md border-4 border-white"
              >
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                    <FiUser size={48} className="text-blue-500" />
                  </div>
                )}
              </motion.div>
              
              {editing && (
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 p-2 rounded-full shadow-lg cursor-pointer transition-colors"
                >
                  <FiEdit size={16} className="text-white" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">{profile.nama}</h1>
              <p className="text-blue-200 flex items-center justify-center sm:justify-start gap-2 mt-2">
                <FiUser size={16} />
                <span>NIM: {profile.nim}</span>
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
                <span className="bg-blue-800 bg-opacity-50 text-xs font-medium px-2.5 py-1 rounded-full">
                  {profile.status_mahasiswa || 'Aktif'}
                </span>
                {profile.semester_saat_ini && (
                  <span className="bg-blue-800 bg-opacity-50 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                    <FiCalendar size={12} />
                    Semester {profile.semester_saat_ini}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Edit Button */}
          <div className="absolute top-6 right-6">
            {!editing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditing(true)}
                className="bg-white text-blue-600 hover:text-blue-700 font-medium py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 text-sm"
              >
                <FiEdit size={16} />
                Edit Profil
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="bg-white text-gray-600 hover:text-gray-700 font-medium py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 text-sm"
              >
                <FiX size={16} />
                Batal
              </motion.button>
            )}
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="p-6 sm:p-8">
          {editing ? (
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSave}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama */}
                <div className="space-y-2">
                  <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <FiUser size={18} />
                    </div>
                    <input
                      type="text"
                      id="nama"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2.5 px-4 transition-all bg-white"
                      required
                    />
                  </div>
                </div>
                
                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <FiMail size={18} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2.5 px-4 transition-all bg-white"
                      required
                    />
                  </div>
                </div>
                
                {/* Topik Penelitian */}
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="topik_penelitian" className="block text-sm font-medium text-gray-700">
                    Topik Penelitian
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <FiBookOpen size={18} />
                    </div>
                    <input
                      type="text"
                      id="topik_penelitian"
                      name="topik_penelitian"
                      value={formData.topik_penelitian || ''}
                      onChange={handleChange}
                      className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2.5 px-4 transition-all bg-white"
                      placeholder="Masukkan topik penelitian Anda (opsional)"
                    />
                  </div>
                </div>
                
                {/* Semester */}
                <div className="space-y-2">
                  <label htmlFor="semester_saat_ini" className="block text-sm font-medium text-gray-700">
                    Semester Saat Ini
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <FiCalendar size={18} />
                    </div>
                    <input
                      type="number"
                      id="semester_saat_ini"
                      name="semester_saat_ini"
                      min="1"
                      max="14"
                      value={formData.semester_saat_ini || ''}
                      onChange={handleChange}
                      className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2.5 px-4 transition-all bg-white"
                      placeholder="Masukkan semester saat ini"
                    />
                  </div>
                </div>
                
                {/* Status */}
                <div className="space-y-2">
                  <label htmlFor="status_mahasiswa" className="block text-sm font-medium text-gray-700">
                    Status Mahasiswa
                  </label>
                  <select
                    id="status_mahasiswa"
                    name="status_mahasiswa"
                    value={formData.status_mahasiswa || 'Aktif'}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2.5 px-4 transition-all bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Drop Out">Drop Out</option>
                    <option value="Lulus">Lulus</option>
                  </select>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 px-5 rounded-lg font-medium transition-colors flex items-center gap-2"
                  disabled={saving}
                >
                  <FiX size={16} />
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FiRefreshCw size={16} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <FiSave size={16} />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* Email */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <FiMail size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-800 font-medium break-all">{profile.email}</p>
                    </div>
                  </div>
                </div>
                
                {/* NIM */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <FiUser size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">NIM</p>
                      <p className="text-gray-800 font-medium">{profile.nim}</p>
                    </div>
                  </div>
                </div>
                
                {/* Status Mahasiswa */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <FiCheck size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status Mahasiswa</p>
                      <p className="text-gray-800 font-medium">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.status_mahasiswa === 'Aktif' ? 'bg-green-100 text-green-800' :
                          profile.status_mahasiswa === 'Cuti' ? 'bg-yellow-100 text-yellow-800' :
                          profile.status_mahasiswa === 'Lulus' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {profile.status_mahasiswa || 'Aktif'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Semester */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <FiCalendar size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Semester Saat Ini</p>
                      <p className="text-gray-800 font-medium">
                        {profile.semester_saat_ini ? `Semester ${profile.semester_saat_ini}` : 'Belum diatur'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Topik Penelitian */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 md:col-span-2">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <FiBookOpen size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Topik Penelitian</p>
                      <p className="text-gray-800 font-medium">
                        {profile.topik_penelitian || 'Belum ada topik penelitian'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditing(true)}
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 py-2.5 px-5 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  <FiEdit size={16} />
                  Edit Profil
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ProfileMahasiswa;