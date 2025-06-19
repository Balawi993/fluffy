import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { setToken } from '../lib/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login({
        email: formData.email.trim(),
        password: formData.password
      });

      if (response.data.success) {
        console.log('Login successful, full response:', response.data);
        console.log('Token received:', response.data.data.token);
        
        // Store the JWT token
        setToken(response.data.data.token);
        
        // Verify token was stored
        const storedToken = localStorage.getItem('token');
        console.log('Token stored in localStorage:', storedToken);
        
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1E1E1E] mb-2">
            Fluffly
          </h1>
          <p className="text-gray-600">Email marketing made simple</p>
        </div>

        {/* Login Form */}
        <div className="bg-white border-2 border-[#1E1E1E] rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-6 text-center">
            Log In
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1E1E1E] mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C084FC] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1E1E1E] mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C084FC] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FEE440] hover:bg-[#FDD835] text-[#1E1E1E] font-semibold py-3 px-4 rounded-md border-2 border-[#1E1E1E] transition-colors duration-200 shadow-[2px_2px_0px_0px_#1E1E1E] hover:shadow-[1px_1px_0px_0px_#1E1E1E] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FEE440] disabled:hover:shadow-[2px_2px_0px_0px_#1E1E1E] disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1E1E1E] mr-2"></div>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-[#C084FC] hover:text-[#A855F7] font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Clear Storage Button (for debugging) */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                console.log('localStorage cleared');
                window.location.reload();
              }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear Storage & Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 