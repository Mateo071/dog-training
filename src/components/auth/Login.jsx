import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';

const Login = () => {
  const { signIn, loading, error, user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showAlert, setShowAlert] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  // Navigate to dashboard when user is fully authenticated and profile is loaded
  useEffect(() => {
    if (user && profile && isSigningIn && !loading) {
      navigate(from, { replace: true });
      setIsSigningIn(false);
    }
  }, [user, profile, isSigningIn, loading, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSigningIn(true);
    
    const { data, error: signInError } = await signIn(formData.email, formData.password);
    
    if (signInError) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      setIsSigningIn(false);
      return;
    }

    // Navigation will be handled by useEffect when profile is loaded
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 py-12 px-4 sm:px-6 lg:px-8">
      {showAlert && error && (
        <Alert 
          show={true} 
          text={error} 
          type="danger" 
        />
      )}
      
      <div className="max-w-md w-full space-y-8">        
        <div>
          <Link to="/" className="block">
            <div className="mx-auto h-12 w-12 bg-gradient-to-r from-brand-blue to-brand-teal rounded-full flex items-center justify-center hover:scale-105 transition-transform">
              <span className="text-white font-bold text-xl">🐕</span>
            </div>
            <h1 className="mt-4 text-center text-lg font-bold text-brand-blue hover:text-brand-blue-dark transition-colors">
              Flores Dog Training
            </h1>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your dog training portal
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-blue mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-blue mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-brand-blue hover:text-brand-blue-dark"
            >
              Forgot your password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || isSigningIn}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue-dark hover:to-brand-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(loading || isSigningIn) ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/contact" className="font-medium text-brand-blue hover:text-brand-blue-dark">
                Contact us to get started
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;