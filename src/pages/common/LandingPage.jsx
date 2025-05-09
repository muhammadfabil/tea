import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Users, FileText, Calendar, Shield, ArrowRight, CheckCircle, BookOpen, Clock, Layout } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const LandingPage = () => {
  useEffect(() => {
    // Inisialisasi AOS (Animation on Scroll)
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
      offset: 100 // Add offset to trigger animations earlier
    });
    
    // Trigger AOS refresh when page is fully loaded
    window.addEventListener('load', () => {
      AOS.refresh();
    });
    
    return () => {
      window.removeEventListener('load', () => {
        AOS.refresh();
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-r from-blue-700 to-blue-500 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-blue-900 opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-blue-800/70 to-blue-900/80"></div>
          <img
            src="/bg.jpg"
            alt="Background Kampus"
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-20">
            {/* Navigation */}
            <nav className="flex items-center justify-between mb-16">
              {/* Logo */}
              <div className="flex items-center" data-aos="fade-right">
                <div className="bg-white p-2 rounded-lg shadow-md">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                </div>
                <span className="ml-3 text-white text-xl font-bold">SIMANTAP</span>
              </div>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6" data-aos="fade-down" data-aos-delay="100">
                <a href="#features" className="text-white hover:text-blue-100 transition-all font-medium">Fitur</a>
                <a href="#benefits" className="text-white hover:text-blue-100 transition-all font-medium">Manfaat</a>
                <a href="#about" className="text-white hover:text-blue-100 transition-all font-medium">Tentang</a>
              </div>
              
              {/* Login Button */}
              <Link
                to="/login"
                className="bg-white text-blue-600 font-semibold px-5 py-2 rounded-lg shadow hover:bg-gray-50 transition duration-200"
                data-aos="fade-left"
              >
                Masuk
              </Link>
            </nav>
            
            {/* Hero Content */}
            <div className="flex flex-col lg:flex-row items-center justify-between">
              {/* Hero Text */}
              <div className="w-full lg:w-1/2 mb-12 lg:mb-0" data-aos="fade-up">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                  Sistem Manajemen Layanan Administrasi dan Antrean Program Studi
                </h1>
                <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl">
                  SIMANTAP menyediakan layanan terintegrasi untuk administrasi dan pelayanan kampus yang efisien bagi mahasiswa, dosen, dan admin.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/login"
                    className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-50 transition duration-200 flex items-center justify-center gap-2"
                  >
                    <span>Masuk Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/status-dosen"
                    className="bg-transparent border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition duration-200 flex items-center justify-center gap-2"
                  >
                    <span>Lihat Status Kehadiran Dosen</span>
                    <Clock className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              
              {/* Hero Image */}
              <div className="w-full lg:w-1/2 lg:pl-8" data-aos="fade-left" data-aos-delay="300">
                <div className="bg-white p-6 rounded-2xl shadow-xl overflow-hidden">
                  <img 
                    src="/image.png" 
                    alt="Dashboard Preview" 
                    className="rounded-lg shadow-sm w-full"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/600x400/e4f1fe/1277C9?text=SIMANTAP+Dashboard+Preview";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Fitur Utama</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              SIMANTAP menawarkan berbagai fitur untuk memudahkan proses administrasi dan pelayanan di lingkungan kampus.
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Layanan Administrasi</h3>
              <p className="text-slate-600">
                Akses berbagai layanan administrasi secara online, termasuk pengajuan surat dan dokumen penting lainnya.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all" data-aos="fade-up" data-aos-delay="200">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Sistem Antrean</h3>
              <p className="text-slate-600">
                Melihat dan mendaftar antrean bimbingan dosen dengan mudah, tanpa perlu hadir secara fisik.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all" data-aos="fade-up" data-aos-delay="300">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Manajemen Pengguna</h3>
              <p className="text-slate-600">
                Portal terpadu untuk mahasiswa, dosen, dan staf administrasi dengan hak akses yang sesuai.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all" data-aos="fade-up" data-aos-delay="400">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Penjadwalan</h3>
              <p className="text-slate-600">
                Kelola jadwal pertemuan, konsultasi, dan kegiatan penting lainnya secara efisien.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all" data-aos="fade-up" data-aos-delay="500">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Layout className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Dashboard Informatif</h3>
              <p className="text-slate-600">
                Dapatkan ikhtisar data penting dan informasi terkini dalam tampilan dashboard yang intuitif.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Benefits Image */}
            <div className="w-full lg:w-1/2" data-aos="fade-right">
              <img 
                src="/benefits-image.jpg" 
                alt="Benefits" 
                className="rounded-2xl shadow-lg w-full"
                onError={(e) => {
                  e.target.src = "https://placehold.co/600x400/e4f1fe/1277C9?text=SIMANTAP+Benefits";
                }}
              />
            </div>
            
            {/* Benefits Content */}
            <div className="w-full lg:w-1/2" data-aos="fade-left">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Manfaat Menggunakan SIMANTAP</h2>
              <p className="text-slate-600 mb-8">
                Sistem kami dirancang untuk memberikan kemudahan dan efisiensi dalam proses administrasi kampus.
              </p>
              <div className="space-y-4">
                {/* Benefit 1 */}
                <div className="flex items-start gap-3" data-aos="fade-up" data-aos-delay="100">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Efisiensi Waktu</h3>
                    <p className="text-slate-600">Mengurangi waktu tunggu dan proses administrasi yang panjang</p>
                  </div>
                </div>
                
                {/* Benefit 2 */}
                <div className="flex items-start gap-3" data-aos="fade-up" data-aos-delay="200">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Transparansi</h3>
                    <p className="text-slate-600">Informasi dan status layanan tersedia secara transparan</p>
                  </div>
                </div>
                
                {/* Benefit 3 */}
                <div className="flex items-start gap-3" data-aos="fade-up" data-aos-delay="300">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Aksesibilitas</h3>
                    <p className="text-slate-600">Akses layanan dari mana saja dan kapan saja</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* About Content */}
          <div className="text-center max-w-3xl mx-auto" data-aos="fade-up">
            <h2 className="text-3xl font-bold mb-6">Tentang SIMANTAP</h2>
            <p className="text-slate-300 mb-8">
              SIMANTAP adalah sistem informasi manajemen administrasi dan pelayanan terpadu yang dikembangkan untuk memudahkan proses administratif di lingkungan kampus. Sistem ini menyediakan berbagai layanan digital untuk mahasiswa, dosen, dan staf administrasi.
            </p>
            <p className="text-slate-300 mb-10">
              Dengan antarmuka yang intuitif dan fitur yang komprehensif, SIMANTAP dirancang untuk meningkatkan efisiensi dan kualitas layanan administrasi kampus.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4" data-aos="fade-up" data-aos-delay="200">
              <Link
                to="/login"
                className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/status-dosen"
                className="bg-transparent border-2 border-blue-400 text-blue-300 font-semibold px-6 py-3 rounded-lg hover:bg-blue-900/30 transition duration-200 flex items-center justify-center gap-2"
              >
                <span>Lihat Status Kehadiran Dosen</span>
                <Clock className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Logo */}
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white p-2 rounded-lg shadow-md">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <span className="ml-3 text-white text-lg font-bold">SIMANTAP</span>
            </div>
            
            {/* Footer Navigation */}
            <div className="flex flex-col md:flex-row items-center md:gap-8">
              <a href="#features" className="hover:text-white transition-all mb-2 md:mb-0">Fitur</a>
              <a href="#benefits" className="hover:text-white transition-all mb-2 md:mb-0">Manfaat</a>
              <a href="#about" className="hover:text-white transition-all mb-2 md:mb-0">Tentang</a>
            </div>
            
            {/* Copyright */}
            <div className="mt-4 md:mt-0 text-center md:text-right">
              <p className="mb-1">© 2025 SIMANTAP. All rights reserved.</p>
              <p className="text-sm text-slate-500">Developed by <span className="text-slate-300">Muhammad Fabil | Andreas Gumarang Sihotang</span></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;