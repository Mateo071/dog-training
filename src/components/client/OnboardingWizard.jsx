import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, signOut } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [onboardingDataLoaded, setOnboardingDataLoaded] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  const [formData, setFormData] = useState({
    // Personal Information
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    howHeardAboutUs: '',
    
    // Dog Information
    dogs: [{
      name: '',
      breed: '',
      birthDate: '',
      sex: '',
      behavioralNotes: '',
      medicalNotes: '',
      trainingGoals: ''
    }]
  });

  useEffect(() => {
    // Load saved onboarding data and restore progress
    const loadOnboardingData = async () => {
      if (user?.id) {
        try {
          const { data: onboardingData, error } = await db.getOnboardingData(user.id);
          
          if (!error && onboardingData) {
            console.log('Loading saved onboarding data:', onboardingData);
            // Restore current step
            if (onboardingData.onboarding_step > 0) {
              setCurrentStep(onboardingData.onboarding_step);
            }
            
            // Restore form data if it exists
            if (onboardingData.onboarding_data) {
              setFormData(prev => ({
                ...prev,
                ...onboardingData.onboarding_data
              }));
            }
          }
          // Mark onboarding data as loaded (whether we found data or not)
          setOnboardingDataLoaded(true);
        } catch (err) {
          console.error('Error loading onboarding data:', err);
          setOnboardingDataLoaded(true);
        }
      }
    };

    // Pre-fill with existing profile data if any
    if (profile) {
      setFormData(prev => ({
        ...prev,
        address: profile.address || '',
        emergencyContact: profile.emergency_contact || '',
        emergencyPhone: profile.emergency_phone || '',
        howHeardAboutUs: profile.how_heard_about_us || ''
      }));
      
      // Only load saved data if profile is not completed
      if (!profile.profile_completed) {
        loadOnboardingData();
      } else {
        setOnboardingDataLoaded(true);
      }
    }
  }, [profile, user?.id]);

  useEffect(() => {
    // Fetch and pre-populate dog information from contact submission
    const fetchContactSubmission = async () => {
      if (user?.email) {
        try {
          console.log('Fetching contact submission for:', user.email);
          const { data: contactSubmission, error } = await db.getContactSubmissionByEmail(user.email);
          
          console.log('Contact submission result:', { contactSubmission, error });
          
          if (!error && contactSubmission) {
            console.log('Pre-populating dog information from contact submission:', contactSubmission);
            // Pre-populate dog information from contact submission, preserving existing data
            setFormData(prev => ({
              ...prev,
              dogs: [{
                name: contactSubmission.dog_name || prev.dogs[0]?.name || '',
                breed: contactSubmission.dog_breed || prev.dogs[0]?.breed || '',
                birthDate: contactSubmission.dog_birth_date || prev.dogs[0]?.birthDate || '',
                sex: contactSubmission.dog_sex || prev.dogs[0]?.sex || '',
                // Preserve existing user-entered data for these fields, only use contact submission as fallback
                behavioralNotes: prev.dogs[0]?.behavioralNotes || contactSubmission.message || '',
                medicalNotes: prev.dogs[0]?.medicalNotes || '',
                trainingGoals: prev.dogs[0]?.trainingGoals || ''
              }]
            }));
          } else {
            console.log('No contact submission found for email:', user.email);
          }
        } catch (err) {
          console.error('Error fetching contact submission:', err);
          // Don't show error to user, just continue with empty form
        }
      }
    };

    // Only fetch contact submission if:
    // 1. Onboarding data has been loaded (to avoid overriding saved data)
    // 2. The first dog has no name (meaning no saved data was found)
    if (onboardingDataLoaded && user?.email && formData.dogs.length === 1 && !formData.dogs[0].name) {
      fetchContactSubmission();
    }
  }, [user?.email, onboardingDataLoaded, formData.dogs]);

  useEffect(() => {
    // Redirect to dashboard if profile is already completed
    if (profile?.profile_completed) {
      navigate('/dashboard');
    }
  }, [profile?.profile_completed, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDogChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      dogs: prev.dogs.map((dog, i) => 
        i === index ? { ...dog, [field]: value } : dog
      )
    }));
  };

  const addDog = () => {
    setFormData(prev => ({
      ...prev,
      dogs: [...prev.dogs, {
        name: '',
        breed: '',
        birthDate: '',
        sex: '',
        behavioralNotes: '',
        medicalNotes: '',
        trainingGoals: ''
      }]
    }));
  };

  const removeDog = (index) => {
    setFormData(prev => ({
      ...prev,
      dogs: prev.dogs.filter((_, i) => i !== index)
    }));
  };

  const showMessage = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  const autoSaveData = async (step) => {
    if (!user?.id) return;
    
    try {
      setAutoSaving(true);
      await db.saveOnboardingData(user.id, step, formData);
      console.log('Auto-saved onboarding data for step:', step);
    } catch (error) {
      console.error('Failed to auto-save onboarding data:', error);
      // Don't show error to user as this is background functionality
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      showMessage('Failed to sign out. Please try again.', 'danger');
    }
  };

  const nextStep = async () => {
    if (currentStep < 3) {
      // Auto-save current data before moving to next step
      await autoSaveData(currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = async () => {
    if (currentStep > 1) {
      // Auto-save current data before moving to previous step
      await autoSaveData(currentStep - 1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Update profile and clear onboarding data
      const { error: profileError } = await updateProfile({
        address: formData.address,
        emergency_contact: formData.emergencyContact,
        emergency_phone: formData.emergencyPhone,
        how_heard_about_us: formData.howHeardAboutUs,
        profile_completed: true,
        signup_completed_at: new Date().toISOString(),
        onboarding_step: 3,
        onboarding_data: null // Clear saved data after completion
      });

      if (profileError) throw profileError;

      // Create dog profiles
      const dogPromises = formData.dogs.map(async (dog) => {
        if (dog.name && dog.breed && dog.birthDate) {
          const { error } = await db.createDog({
            owner_id: profile.id,
            name: dog.name,
            breed: dog.breed,
            birth_date: dog.birthDate,
            sex: dog.sex,
            behavioral_notes: dog.behavioralNotes,
            medical_notes: dog.medicalNotes,
            training_goals: dog.trainingGoals
          });
          if (error) throw error;
        }
      });

      await Promise.all(dogPromises);

      showMessage('Profile completed successfully! Welcome to your training portal.', 'success');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Error completing onboarding:', err);
      showMessage('Failed to complete profile setup. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to complete your profile.</p>
      </div>
    );
  }

  // Early return for completed profiles - navigation is handled in useEffect
  if (profile?.profile_completed) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {showAlert && (
          <Alert show={true} text={alertMessage} type={alertType} />
        )}

        {/* User Info and Sign Out */}
        <div className="mb-6 flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">
            Currently logged in as <span className="font-medium text-gray-900">{user?.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-brand-blue hover:text-brand-blue-dark underline"
          >
            Not you? Sign out
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
            <div className="flex items-center space-x-3">
              {autoSaving && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-brand-blue mr-1"></div>
                  Saving...
                </div>
              )}
              <span className="text-sm text-gray-500">Step {currentStep} of 3</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-brand-blue to-brand-teal h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Home Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your full address..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      id="emergencyContact"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      placeholder="Full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      id="emergencyPhone"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleInputChange}
                      placeholder="(123) 456-7890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="howHeardAboutUs" className="block text-sm font-medium text-gray-700 mb-2">
                    How did you hear about us?
                  </label>
                  <select
                    id="howHeardAboutUs"
                    name="howHeardAboutUs"
                    value={formData.howHeardAboutUs}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  >
                    <option value="">Select an option</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Social Media">Social Media (Facebook, Instagram, etc.)</option>
                    <option value="Referral">Referral from Friend or Family</option>
                    <option value="Vet Recommendation">Veterinarian Recommendation</option>
                    <option value="Local Advertisement">Local Advertisement</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Dog Information */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Your Dog(s)</h2>
                <button
                  type="button"
                  onClick={addDog}
                  className="text-sm bg-brand-teal text-white px-4 py-2 rounded-md hover:bg-brand-teal-dark transition-colors"
                >
                  + Add Another Dog
                </button>
              </div>

              {formData.dogs.length === 1 && formData.dogs[0].name && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-blue-600 mr-2">ℹ️</div>
                    <p className="text-sm text-blue-800">
                      We've pre-filled some information from your initial contact form to save you time. 
                      Please review and update as needed.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-8">
                {formData.dogs.map((dog, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Dog {index + 1}
                      </h3>
                      {formData.dogs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDog(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dog's Name *
                        </label>
                        <input
                          type="text"
                          value={dog.name}
                          onChange={(e) => handleDogChange(index, 'name', e.target.value)}
                          placeholder="Enter dog's name"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Breed *
                        </label>
                        <input
                          type="text"
                          value={dog.breed}
                          onChange={(e) => handleDogChange(index, 'breed', e.target.value)}
                          placeholder="Enter breed or mix"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Birth Date *
                        </label>
                        <input
                          type="date"
                          value={dog.birthDate}
                          onChange={(e) => handleDogChange(index, 'birthDate', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sex *
                        </label>
                        <select
                          value={dog.sex}
                          onChange={(e) => handleDogChange(index, 'sex', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                        >
                          <option value="">Select sex</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Training Goals
                        </label>
                        <textarea
                          rows="2"
                          value={dog.trainingGoals}
                          onChange={(e) => handleDogChange(index, 'trainingGoals', e.target.value)}
                          placeholder="What would you like to work on with your dog?"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Behavioral Notes
                        </label>
                        <textarea
                          rows="2"
                          value={dog.behavioralNotes}
                          onChange={(e) => handleDogChange(index, 'behavioralNotes', e.target.value)}
                          placeholder="Any behavioral concerns or notes..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Medical Notes
                        </label>
                        <textarea
                          rows="2"
                          value={dog.medicalNotes}
                          onChange={(e) => handleDogChange(index, 'medicalNotes', e.target.value)}
                          placeholder="Any medical conditions or special needs..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Review & Complete */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Review & Complete</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Personal Information</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Address:</strong> {formData.address || 'Not provided'}</p>
                    <p><strong>Emergency Contact:</strong> {formData.emergencyContact || 'Not provided'}</p>
                    <p><strong>Emergency Phone:</strong> {formData.emergencyPhone || 'Not provided'}</p>
                    <p><strong>How you heard about us:</strong> {formData.howHeardAboutUs || 'Not provided'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Your Dogs ({formData.dogs.length})</h3>
                  {formData.dogs.map((dog, index) => (
                    dog.name && (
                      <div key={index} className="text-sm text-gray-600 mb-3 last:mb-0">
                        <p><strong>{dog.name}</strong> - {dog.breed} ({dog.sex || 'Sex not specified'})</p>
                        <p>Born: {dog.birthDate ? new Date(dog.birthDate).toLocaleDateString() : 'Not provided'}</p>
                        {dog.trainingGoals && <p>Goals: {dog.trainingGoals}</p>}
                      </div>
                    )
                  ))}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">🎉 You're all set!</h3>
                  <p className="text-sm text-blue-700">
                    Once you complete your profile, you'll have access to your training portal where you can:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• View messages from your trainer</li>
                    <li>• See your upcoming training sessions</li>
                    <li>• Track your dog's progress</li>
                    <li>• Access training resources</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1 || autoSaving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {autoSaving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Previous'
              )}
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={autoSaving}
                className="px-6 py-2 bg-gradient-to-r from-brand-blue to-brand-teal text-white rounded-md hover:from-brand-blue-dark hover:to-brand-teal-dark focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {autoSaving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Next'
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-2 bg-gradient-to-r from-brand-blue to-brand-teal text-white rounded-md hover:from-brand-blue-dark hover:to-brand-teal-dark focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Completing...
                  </div>
                ) : (
                  'Complete Profile'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;