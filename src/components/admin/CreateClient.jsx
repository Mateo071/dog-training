import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';

const CreateClient = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    howHeardAboutUs: '',
    notes: '',
    sendInvitation: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const showMessage = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First create the user account
      const { data: authData, error: authError } = await db.supabase.auth.admin.createUser({
        email: formData.email,
        password: Math.random().toString(36).slice(-8), // Temporary password
        email_confirm: false // They'll confirm via invitation
      });

      if (authError) throw authError;

      // Create user record
      const { error: userError } = await db.supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: formData.email,
          role: 'client'
        }]);

      if (userError) throw userError;

      // Create profile
      const { data: profileData, error: profileError } = await db.supabase
        .from('profiles')
        .insert([{
          user_id: authData.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          emergency_contact: formData.emergencyContact,
          emergency_phone: formData.emergencyPhone,
          how_heard_about_us: formData.howHeardAboutUs,
          notes: formData.notes,
          profile_completed: false,
          created_from_contact_form: false
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      // Send invitation if requested
      if (formData.sendInvitation) {
        const currentUser = await db.supabase.auth.getUser();
        const { data: tokenData, error: tokenError } = await db.supabase
          .rpc('create_signup_invitation', {
            p_contact_submission_id: null,
            p_email: formData.email,
            p_created_by: currentUser.data.user.id
          });

        if (tokenError) throw tokenError;

        // Generate invitation URL
        const invitationUrl = `${window.location.origin}/signup?token=${tokenData}&email=${encodeURIComponent(formData.email)}`;
        
        // Copy to clipboard for now - in production, send via email
        navigator.clipboard.writeText(invitationUrl);
        showMessage(`Client created successfully! Invitation link copied to clipboard - send this to ${formData.firstName}.`, 'success');
      } else {
        showMessage('Client profile created successfully!', 'success');
      }

      // Redirect to client profile after 2 seconds
      setTimeout(() => {
        navigate(`/dashboard/clients/${profileData.id}`);
      }, 2000);

    } catch (err) {
      console.error('Error creating client:', err);
      showMessage(err.message || 'Failed to create client profile', 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {showAlert && (
        <Alert show={true} text={alertMessage} type={alertType} />
      )}

      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/clients')}
          className="text-brand-blue hover:underline mb-4 inline-block"
        >
          ← Back to Client List
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Client</h1>
        <p className="text-gray-600 mt-2">Add a new client to your training program</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
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
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
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
                  onChange={handleChange}
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
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  id="emergencyContact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>

              <div>
                <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  id="emergencyPhone"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="howHeardAboutUs" className="block text-sm font-medium text-gray-700 mb-1">
                  How did they hear about us?
                </label>
                <select
                  id="howHeardAboutUs"
                  name="howHeardAboutUs"
                  value={formData.howHeardAboutUs}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                >
                  <option value="">Select an option</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Referral">Referral from Friend/Family</option>
                  <option value="Vet Recommendation">Veterinarian Recommendation</option>
                  <option value="Local Advertisement">Local Advertisement</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional notes about this client..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>
            </div>
          </div>

          {/* Invitation Settings */}
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendInvitation"
                name="sendInvitation"
                checked={formData.sendInvitation}
                onChange={handleChange}
                className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
              />
              <label htmlFor="sendInvitation" className="ml-2 text-sm text-gray-700">
                Send signup invitation to client
              </label>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              If checked, an invitation link will be generated that you can send to the client to complete their account setup.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/dashboard/clients')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-brand-blue to-brand-teal text-white py-2 px-6 rounded-md hover:from-brand-blue-dark hover:to-brand-teal-dark focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Client...
                </div>
              ) : (
                'Create Client'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClient;