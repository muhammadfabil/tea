import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';
import { GrTechnology } from "react-icons/gr";
import { FaUserGraduate } from "react-icons/fa";

const ResetPassPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const location = useLocation();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    // Extract token from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setStatus({
        type: 'error',
        message: 'Reset token is missing. Please use the link from your email.'
      });
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setStatus({
        type: 'error',
        message: 'Passwords do not match'
      });
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setStatus({
        type: 'error',
        message: 'Password must be at least 8 characters long'
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Using query parameters instead of JSON body
      const url = `${API}/auth/reset-password?token=${encodeURIComponent(token)}&new_password=${encodeURIComponent(password)}`;
      
      const response = await axios.post(
        url,
        '', // Empty body since we're using query params
        {
          headers: {
            'accept': 'application/json'
          }
        }
      );
      
      setStatus({ 
        type: 'success', 
        message: 'Your password has been successfully reset!' 
      });
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Reset password error:', error);
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.detail || 'Failed to reset password. The token may have expired.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* SIMANTAP Header */}
      <div className="bg-white text-blue-800 py-4 px-6 shadow-md border-b border-gray-200 flex flex-col items-center justify-center space-y-1">
        <div className="flex items-center space-x-2">
          <GrTechnology className="w-7 h-7 text-blue-700" />
          <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-blue-700 to-blue-900 text-transparent bg-clip-text">
            SIMANTAP
          </h1>
        </div>
        <p className="text-xs text-blue-600 tracking-wide font-medium text-center">
          Sistem Manajemen Layanan Administrasi dan Antrean Program Studi
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
          <div>
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                <FaUserGraduate className="text-blue-600 text-2xl" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Reset Your Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your new password below
            </p>
          </div>

          {status.type && (
            <div className={`p-4 rounded-md ${status.type === 'success' ? 'bg-blue-50 border border-blue-100' : 'bg-red-50 border border-red-100'}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {status.type === 'success' ? (
                    <HiOutlineCheckCircle className="h-5 w-5 text-blue-500" aria-hidden="true" />
                  ) : (
                    <HiOutlineExclamationCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${status.type === 'success' ? 'text-blue-800' : 'text-red-800'}`}>
                    {status.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiOutlineLockClosed className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="New password"
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <HiOutlineEyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    ) : (
                      <HiOutlineEye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiOutlineLockClosed className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <HiOutlineEyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    ) : (
                      <HiOutlineEye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !token}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md disabled:opacity-70 transition-all duration-200"
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
              Back to login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassPage;