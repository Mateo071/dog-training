import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';

const EditClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  
  // Determine where to go back based on the 'from' parameter or default to profile
  const backPath = searchParams.get('from') || `/dashboard/clients/${id}`;
  const backText = backPath.includes('/dashboard/clients') && !backPath.includes(`/${id}`) 
    ? 'Back to Client Management' 
    : 'Back to Profile';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    how_heard_about_us: '',
    notes: '',
    email: ''
  });

  useEffect(() => {
    if (isAdmin && id) {
      loadProfileData();
    }
  }, [isAdmin, id]);

  const loadProfileData = async () => {
    try {
      const { data, error } = await db.getProfileWithUserData(id);

      if (error) throw error;
      
      if (data) {
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          address: data.address || '',
          emergency_contact: data.emergency_contact || '',
          emergency_phone: data.emergency_phone || '',
          how_heard_about_us: data.how_heard_about_us || '',
          notes: data.notes || '',
          email: data.users?.email || ''
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      showMessage('Error loading profile data', 'danger');
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
    
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      showMessage('First name and last name are required', 'danger');
      return;
    }

    setSaving(true);

    try {
      // Update profile data (excluding email as it's in users table)
      const profileUpdates = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        emergency_contact: formData.emergency_contact.trim() || null,
        emergency_phone: formData.emergency_phone.trim() || null,
        how_heard_about_us: formData.how_heard_about_us.trim() || null,
        notes: formData.notes.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await db.supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', id);

      if (profileError) throw profileError;

      // Note: Email updates require special handling through Supabase Auth
      // For now, we'll just update the profile fields
      
      showMessage('Profile updated successfully!', 'success');
      
      // Redirect back after 2 seconds
      setTimeout(() => {
        navigate(backPath);
      }, 2000);

    } catch (err) {
      console.error('Error updating profile:', err);
      showMessage('Failed to update profile. Please try again.', 'danger');
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
          ← {backText}
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Client Profile</h1>
        <p className="text-gray-600 mt-2">Update client information and contact details</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed here. Contact system administrator if email needs to be updated.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>

              <div>
                <label htmlFor="how_heard_about_us" className="block text-sm font-medium text-gray-700 mb-1">
                  How They Found Us
                </label>
                <select
                  id="how_heard_about_us"
                  name="how_heard_about_us"
                  value={formData.how_heard_about_us}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                >
                  <option value="">Select an option</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Referral">Referral from Friend/Family</option>
                  <option value="Vet Recommendation">Veterinarian Recommendation</option>
                  <option value="Yelp">Yelp</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows="2"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St, City, State, ZIP"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Name
              </label>
              <input
                type="text"
                id="emergency_contact"
                name="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleInputChange}
                placeholder="Contact person name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>

            <div>
              <label htmlFor="emergency_phone" className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                id="emergency_phone"
                name="emergency_phone"
                value={formData.emergency_phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Internal Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="4"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Internal notes about this client..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            />
            <p className="text-xs text-gray-500 mt-1">
              These notes are only visible to administrators and will not be shared with the client.
            </p>
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
            disabled={saving || !formData.first_name.trim() || !formData.last_name.trim()}
            className="flex-1 bg-gradient-to-r from-brand-blue to-brand-teal text-white py-2 px-6 rounded-md hover:from-brand-blue-dark hover:to-brand-teal-dark focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditClientProfile;