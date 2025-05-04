import React, { useState } from 'react';
import axios from 'axios';
import { HiOutlineMail, HiOutlineArrowSmRight, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineInboxIn } from 'react-icons/hi';
import { GrTechnology } from "react-icons/gr";
import { FaUserGraduate } from "react-icons/fa";

const ResetPassRequest = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const API = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post(
        `${API}/auth/forgot-password?email=${encodeURIComponent(email)}`,
        '',
        {
          headers: {
            'accept': 'application/json',
          }
        }
      );
      
      setStatus({ 
        type: 'success', 
        message: response.data.message || "We've sent a reset link to your email."
      });
      
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.detail || 'Failed to send reset link. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
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
              Enter your email address and we'll send you a link to reset your password
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

          {status.type === 'success' && (
            <div className="mt-4 p-5 border border-blue-100 rounded-lg bg-blue-50">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <HiOutlineInboxIn className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-md font-medium text-blue-800">Check your inbox</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Please check both your inbox and spam folder for the password reset email. If you don't see it within a few minutes, you may want to:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Check your spam/junk folder</li>
                      <li>Verify you entered the correct email address</li>
                      <li>Wait a few more minutes for the email to arrive</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiOutlineMail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || status.type === 'success'}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md disabled:opacity-70 transition-all duration-200"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <HiOutlineArrowSmRight className="h-5 w-5 text-blue-400 group-hover:text-blue-300" aria-hidden="true" />
                </span>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
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

export default ResetPassRequest;