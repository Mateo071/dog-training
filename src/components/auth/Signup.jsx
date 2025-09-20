import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';
import Alert from '../ui/Alert';

const Signup = () => {
  const { signUp, loading, error } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [dogData, setDogData] = useState({
    name: '',
    breed: '',
    birthDate: ''
  });
  const [invitationData, setInvitationData] = useState(null);
  const [loadingInvitation, setLoadingInvitation] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('danger');

  // Get token from URL params (sent via email invitation)
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    const loadInvitationData = async () => {
      if (token) {
        setLoadingInvitation(true);
        try {
          const { data: invitation, error } = await db.getSignupInvitation(token);
          if (error) {
            console.error('Error loading invitation:', error);
            setAlertMessage('Invalid or expired invitation link.');
            setAlertType('danger');
            setShowAlert(true);
            return;
          }

          console.log('Loaded invitation data:', invitation);
          setInvitationData(invitation);

          // Pre-populate form with contact submission data
          if (invitation.contact_submissions) {
            const contact = invitation.contact_submissions;
            setFormData(prev => ({
              ...prev,
              email: contact.email || email || '',
              firstName: contact.first_name || '',
              lastName: contact.last_name || '',
              phone: contact.phone || ''
            }));

            // Pre-populate dog data
            setDogData({
              name: contact.dog_name || '',
              breed: contact.dog_breed || '',
              birthDate: contact.dog_birth_date || ''
            });
          } else if (email) {
            // Fallback to email from URL if no contact submission
            setFormData(prev => ({ ...prev, email }));
          }
        } catch (err) {
          console.error('Error loading invitation:', err);
          setAlertMessage('Error loading invitation data.');
          setAlertType('danger');
          setShowAlert(true);
        } finally {
          setLoadingInvitation(false);
        }
      } else if (email) {
        setFormData(prev => ({ ...prev, email }));
      }
    };

    loadInvitationData();
  }, [token, email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDogChange = (e) => {
    const { name, value } = e.target;
    setDogData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setAlertMessage('Passwords do not match');
      setAlertType('danger');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setAlertMessage('Password must be at least 6 characters long');
      setAlertType('danger');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    const { data, error: signUpError } = await signUp(
      formData.email, 
      formData.password,
      {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        signup_token: token,
        dog_name: dogData.name,
        dog_breed: dogData.breed,
        dog_birth_date: dogData.birthDate
      }
    );
    
    if (signUpError) {
      setAlertMessage(signUpError.message);
      setAlertType('danger');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    if (data?.user) {
      setAlertMessage('Account created successfully! Please check your email to verify your account.');
      setAlertType('success');
      setShowAlert(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  // Show loading while fetching invitation data
  if (loadingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
          <p className="text-gray-600">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  // If no token provided, show message to contact admin
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-gradient-to-r from-brand-blue to-brand-teal rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">🐕</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invitation Required
            </h2>
            <p className="mt-4 text-sm text-gray-600">
              Account registration is by invitation only. Please contact us through our contact form to get started with our training programs.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/contact')}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue-dark hover:to-brand-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {invitationData?.contact_submissions ? 
              `Welcome back, ${invitationData.contact_submissions.first_name}!` : 
              'Complete your registration'
            }
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {invitationData?.contact_submissions ? 
              `Complete your account setup for ${invitationData.contact_submissions.dog_name}'s training` :
              'Create your account to access the training portal'
            }
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-brand-blue mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                  placeholder="Keanu"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-brand-blue mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                  placeholder="Reeves"
                />
              </div>
            </div>

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
                disabled={!!email}
                className="block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-gray-100"
                placeholder="youremailhere@anymail.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-brand-blue mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                placeholder="(123) 456-7890"
              />
            </div>

            {/* Dog Information Section */}
            <div className="border-t pt-4 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">🐕 Your Dog's Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="dogName" className="block text-sm font-medium text-brand-blue mb-1">
                    Dog's Name
                  </label>
                  <input
                    id="dogName"
                    name="name"
                    type="text"
                    required
                    value={dogData.name}
                    onChange={handleDogChange}
                    className="block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                    placeholder="Buddy"
                  />
                </div>

                <div>
                  <label htmlFor="dogBreed" className="block text-sm font-medium text-brand-blue mb-1">
                    Breed
                  </label>
                  <input
                    id="dogBreed"
                    name="breed"
                    type="text"
                    required
                    value={dogData.breed}
                    onChange={handleDogChange}
                    className="block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                    placeholder="Golden Retriever"
                  />
                </div>

                <div>
                  <label htmlFor="dogBirthDate" className="block text-sm font-medium text-brand-blue mb-1">
                    Date of Birth
                  </label>
                  <input
                    id="dogBirthDate"
                    name="birthDate"
                    type="date"
                    required
                    value={dogData.birthDate}
                    onChange={handleDogChange}
                    className="block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-blue mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                placeholder="Please don't make it 'password'"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-blue mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                placeholder="Same as above"
              />
            </div>
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
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;