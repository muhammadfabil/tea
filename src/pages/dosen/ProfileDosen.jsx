import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiUser,
  FiMail,
  FiEdit,
  FiSave,
  FiX,
  FiCheckCircle,
  FiRefreshCw,
  FiLoader,
  FiInfo
} from 'react-icons/fi';

const ProfileDosen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nomor_induk: '',
    keterangan: '',
    status_kehadiran: true
  });
  const [saving, setSaving] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;
  
  // Get alias dosen from localStorage
  const getAliasDosen = () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      return auth?.user?.profile?.alias;
    } catch (error) {
      console.error('Error getting alias from localStorage:', error);
      return null;
    }
  };

  const alias = getAliasDosen();

  // Jika endpoint memerlukan authorization, tambahkan kode ini
  const getToken = () => {
    const authData = localStorage.getItem("auth");
    return authData ? JSON.parse(authData).token : null;
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!alias) {
        setError('Inisial dosen tidak ditemukan. Silakan login ulang.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API}/dosen/${alias}`);
        
        // Data dosen berada di dalam properti "dosen" dari respons
        const dosenData = response.data.dosen;
        setProfile(dosenData);
        
        setFormData({
          name: dosenData.name || '',
          email: dosenData.email || '',
          nomor_induk: dosenData.nomor_induk || '',
          keterangan: dosenData.keterangan || '',
          status_kehadiran: dosenData.status_kehadiran !== undefined ? dosenData.status_kehadiran : true
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Gagal mengambil data profil. Silakan coba lagi nanti.');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [alias, API]);

  useEffect(() => {
    return () => {
      toast.dismiss(); // Clear all toasts when the component unmounts
    };
  }, [API]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox change for status kehadiran
  const handleCheckboxChange = (e) => {
    setFormData(prev => ({
      ...prev,
      status_kehadiran: e.target.checked
    }));
  };

  // Save profile data
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Pastikan status_kehadiran adalah boolean yang tepat
      const updateData = {
        nomor_induk: formData.nomor_induk,
        name: formData.name,
        alias: profile.alias, // Gunakan alias yang ada dari profile
        email: formData.email,
        keterangan: formData.keterangan,
        status_kehadiran: Boolean(formData.status_kehadiran)
      };

      // Send request to backend
      const response = await axios.put(
        `${API}/dosen/${alias}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      if (response.status === 200) {
        // Extrak data dosen dari respons
        // Berdasarkan struktur respons, data dosen ada di response.data.data
        const updatedDosenData = response.data.data;
        
        if (updatedDosenData) {
          setProfile(updatedDosenData);
          setFormData({
            name: updatedDosenData.name || '',
            email: updatedDosenData.email || '',
            nomor_induk: updatedDosenData.nomor_induk || '',
            keterangan: updatedDosenData.keterangan || '',
            status_kehadiran: updatedDosenData.status_kehadiran !== undefined ? updatedDosenData.status_kehadiran : true
          });
          
          toast.success('Profil berhasil diperbarui');
        } else {
          // Fallback jika tidak ada data di response.data.data
          console.warn("Data tidak lengkap dalam respons API:", response.data);
          toast.success('Profil berhasil diperbarui, refresh halaman untuk melihat perubahan');
        }
        setEditing(false);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      
      // Tampilkan pesan error yang lebih spesifik
      if (err.response?.data?.detail) {
        toast.error(`Gagal memperbarui: ${err.response.data.detail}`);
      } else {
        toast.error('Gagal memperbarui profil');
      }
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      nomor_induk: profile.nomor_induk || '',
      keterangan: profile.keterangan || '',
      status_kehadiran: profile.status_kehadiran !== undefined ? profile.status_kehadiran : true
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-blue-500 mb-4">
          <FiLoader size={40} />
        </div>
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white relative">
          <div className="flex flex-col items-center text-center">
            {/* Profile Info */}
            <div>
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <p className="text-blue-200 flex items-center justify-center gap-2 mt-2">
                <FiUser size={16} />
                <span>Inisial: {profile.alias}</span>
              </p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className={`${profile.status_kehadiran ? 'bg-green-500' : 'bg-red-500'} bg-opacity-75 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1`}>
                  <FiCheckCircle size={12} />
                  {profile.status_kehadiran ? 'Hadir' : 'Tidak Hadir'}
                </span>
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
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <FiUser size={18} />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
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
                
                {/* Nomor Induk */}
                <div className="space-y-2">
                  <label htmlFor="nomor_induk" className="block text-sm font-medium text-gray-700">
                    Nomor Induk
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <FiInfo size={18} />
                    </div>
                    <input
                      type="text"
                      id="nomor_induk"
                      name="nomor_induk"
                      value={formData.nomor_induk}
                      onChange={handleChange}
                      className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2.5 px-4 transition-all bg-white"
                      required
                    />
                  </div>
                </div>
                
                {/* Status Kehadiran */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Status Kehadiran
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.status_kehadiran}
                        onChange={handleCheckboxChange}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Hadir di Kampus</span>
                    </label>
                  </div>
                </div>
                
                {/* Keterangan */}
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="keterangan" className="block text-sm font-medium text-gray-700">
                    Keterangan
                  </label>
                  <textarea
                    id="keterangan"
                    name="keterangan"
                    value={formData.keterangan || ''}
                    onChange={handleChange}
                    rows="3"
                    className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2.5 px-4 transition-all bg-white"
                    placeholder="Tambahkan keterangan status kehadiran (opsional)"
                  ></textarea>
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
                
                {/* Nomor Induk */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <FiInfo size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nomor Induk</p>
                      <p className="text-gray-800 font-medium">{profile.nomor_induk}</p>
                    </div>
                  </div>
                </div>
                
                {/* Status Kehadiran */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <FiCheckCircle size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status Kehadiran</p>
                      <p className="text-gray-800 font-medium">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.status_kehadiran ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {profile.status_kehadiran ? 'Hadir' : 'Tidak Hadir'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Keterangan */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <FiInfo size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Keterangan</p>
                      <p className="text-gray-800 font-medium">
                        {profile.keterangan || 'Tidak ada keterangan'}
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

export default ProfileDosen;