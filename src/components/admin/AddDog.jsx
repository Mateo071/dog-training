import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';

const AddDog = () => {
  const { clientId } = useParams(); // The client's profile ID
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  
  // Determine where to go back - default to client profile
  const backPath = searchParams.get('from') || `/dashboard/clients/${clientId}`;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [clientName, setClientName] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    birth_date: '',
    sex: '',
    behavioral_notes: '',
    medical_notes: '',
    training_goals: ''
  });

  useEffect(() => {
    if (isAdmin && clientId) {
      loadClientInfo();
    }
  }, [isAdmin, clientId]);

  const loadClientInfo = async () => {
    try {
      // Load basic client info to show who we're adding a dog for
      const { data, error } = await db.getProfileWithUserData(clientId);

      if (error) throw error;
      
      if (data) {
        setClientName(`${data.first_name} ${data.last_name}`);
      }
    } catch (err) {
      console.error('Error loading client info:', err);
      showMessage('Error loading client information', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.breed.trim() || !formData.birth_date) {
      showMessage('Name, breed, and birth date are required', 'danger');
      return;
    }

    // Validate birth date is not in the future
    const birthDate = new Date(formData.birth_date);
    const today = new Date();
    if (birthDate > today) {
      showMessage('Birth date cannot be in the future', 'danger');
      return;
    }

    setSaving(true);

    try {
      const dogData = {
        owner_id: clientId,
        name: formData.name.trim(),
        breed: formData.breed.trim(),
        birth_date: formData.birth_date,
        sex: formData.sex || null,
        behavioral_notes: formData.behavioral_notes.trim() || null,
        medical_notes: formData.medical_notes.trim() || null,
        training_goals: formData.training_goals.trim() || null
      };

      const { error } = await db.createDog(dogData);

      if (error) throw error;

      showMessage(`${formData.name} has been added successfully!`, 'success');
      
      // Redirect back after 2 seconds
      setTimeout(() => {
        navigate(backPath);
      }, 2000);

    } catch (err) {
      console.error('Error adding dog:', err);
      showMessage('Failed to add dog. Please try again.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {showAlert && (
        <Alert show={true} text={alertMessage} type={alertType} />
      )}

      <div className="mb-8">
        <button
          onClick={() => navigate(backPath)}
          className="text-brand-blue hover:underline mb-4 inline-block"
        >
          ← Back to {clientName}'s Profile
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Dog</h1>
        <p className="text-gray-600 mt-2">Adding a new dog for <strong>{clientName}</strong></p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Dog Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Buddy"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>

            <div>
              <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
                Breed *
              </label>
              <input
                type="text"
                id="breed"
                name="breed"
                required
                value={formData.breed}
                onChange={handleInputChange}
                placeholder="e.g., Golden Retriever"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>

            <div>
              <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">
                Birth Date *
              </label>
              <input
                type="date"
                id="birth_date"
                name="birth_date"
                required
                value={formData.birth_date}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]} // Prevent future dates
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>

            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-1">
                Sex
              </label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              >
                <option value="">Select sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* Training Goals */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Information</h3>
          <div>
            <label htmlFor="training_goals" className="block text-sm font-medium text-gray-700 mb-1">
              Training Goals
            </label>
            <textarea
              id="training_goals"
              name="training_goals"
              rows="3"
              value={formData.training_goals}
              onChange={handleInputChange}
              placeholder="What specific behaviors or skills would you like to work on?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>
        </div>

        {/* Behavioral Notes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="behavioral_notes" className="block text-sm font-medium text-gray-700 mb-1">
                Behavioral Notes
              </label>
              <textarea
                id="behavioral_notes"
                name="behavioral_notes"
                rows="3"
                value={formData.behavioral_notes}
                onChange={handleInputChange}
                placeholder="Any behavioral concerns, quirks, or personality traits?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>

            <div>
              <label htmlFor="medical_notes" className="block text-sm font-medium text-gray-700 mb-1">
                Medical Notes
              </label>
              <textarea
                id="medical_notes"
                name="medical_notes"
                rows="3"
                value={formData.medical_notes}
                onChange={handleInputChange}
                placeholder="Any medical conditions, allergies, or physical limitations?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !formData.name.trim() || !formData.breed.trim() || !formData.birth_date}
            className="flex-1 bg-gradient-to-r from-brand-blue to-brand-teal text-white py-2 px-6 rounded-md hover:from-brand-blue-dark hover:to-brand-teal-dark focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding Dog...
              </div>
            ) : (
              'Add Dog'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDog;