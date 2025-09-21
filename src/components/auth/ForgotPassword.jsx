import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await resetPassword(email);
    
    if (error) {
      setAlertMessage(error.message);
      setAlertType('danger');
    } else {
      setAlertMessage('Password reset instructions have been sent to your email address.');
      setAlertType('success');
      setEmail('');
    }
    
    setShowAlert(true);
    setLoading(false);
    setTimeout(() => setShowAlert(false), 8000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 py-12 px-4 sm:px-6 lg:px-8">
      {showAlert && (
        <Alert 
          show={true} 
          text={alertMessage} 
          type={alertType} 
        />
      )}
      
      <div className="max-w-md w-full space-y-8">        
        <div>
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-brand-blue to-brand-teal rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">🐕</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue focus:z-10 sm:text-sm"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue-dark hover:to-brand-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending instructions...
                </div>
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-brand-blue hover:text-brand-blue-dark"
            >
              ← Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;