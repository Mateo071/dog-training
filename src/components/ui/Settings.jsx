import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const Settings = () => {
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile settings state
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    email_notifications: true,
    session_reminders: true,
    theme: 'light',
  });

  // Client settings state
  const [clientSettings, setClientSettings] = useState({
    training_goals: '',
    preferred_session_time: 'morning',
    communication_preference: 'email',
  });

  // Admin settings state
  const [adminSettings, setAdminSettings] = useState({
    business_name: '',
    business_phone: '',
    business_email: '',
    default_session_duration: 60,
    hourly_rate: '',
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const tabs = useMemo(() => {
    const baseTabs = [
      { id: 'profile', label: 'Profile & Account', icon: '👤' },
      { id: 'general', label: 'General', icon: '⚙️' }
    ];

    if (isAdmin) {
      return [
        ...baseTabs,
        { id: 'business', label: 'Business', icon: '🏢' },
        { id: 'integrations', label: 'Integrations', icon: '🔗' }
      ];
    } else {
      return [
        ...baseTabs,
        { id: 'training', label: 'Training Preferences', icon: '🐕' }
      ];
    }
  }, [isAdmin]);

  const handleProfileSave = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profileData.first_name, profileData.last_name, profileData.phone, profile?.id]);

  const ProfileSettings = useMemo(() => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={profileData.first_name}
              onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={profileData.last_name}
              onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email changes require account verification</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
        </div>
        <button
          onClick={handleProfileSave}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
        <button
          onClick={() => navigate('/forgot-password')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
        >
          Change Password
        </button>
      </div>
    </div>
  ), [profileData, loading, handleProfileSave, navigate]);

  const GeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={generalSettings.email_notifications}
              onChange={(e) => setGeneralSettings({...generalSettings, email_notifications: e.target.checked})}
              className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            <span className="ml-2 text-sm text-gray-700">Email notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={generalSettings.session_reminders}
              onChange={(e) => setGeneralSettings({...generalSettings, session_reminders: e.target.checked})}
              className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            <span className="ml-2 text-sm text-gray-700">Session reminders</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy & Data</h3>
        <div className="space-y-2">
          <button className="block text-sm text-brand-blue hover:text-brand-blue-dark">
            Download my data
          </button>
          <button className="block text-sm text-red-600 hover:text-red-700">
            Delete my account
          </button>
        </div>
      </div>
    </div>
  );

  const ClientSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Training Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Training Goals
            </label>
            <textarea
              value={clientSettings.training_goals}
              onChange={(e) => setClientSettings({...clientSettings, training_goals: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="Describe your training goals for your dog..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Session Time
            </label>
            <select
              value={clientSettings.preferred_session_time}
              onChange={(e) => setClientSettings({...clientSettings, preferred_session_time: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="morning">Morning (8AM - 12PM)</option>
              <option value="afternoon">Afternoon (12PM - 5PM)</option>
              <option value="evening">Evening (5PM - 8PM)</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Communication Preference
            </label>
            <select
              value={clientSettings.communication_preference}
              onChange={(e) => setClientSettings({...clientSettings, communication_preference: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="text">Text messages</option>
              <option value="app">In-app messages only</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Dog Management</h3>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
        >
          Manage Dogs
        </Link>
      </div>
    </div>
  );

  const BusinessSettings = useMemo(() => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={adminSettings.business_name}
              onChange={(e) => setAdminSettings({...adminSettings, business_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="Flores Dog Training"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Phone
            </label>
            <input
              type="tel"
              value={adminSettings.business_phone}
              onChange={(e) => setAdminSettings({...adminSettings, business_phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Email
            </label>
            <input
              type="email"
              value={adminSettings.business_email}
              onChange={(e) => setAdminSettings({...adminSettings, business_email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Default Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Session Duration (minutes)
            </label>
            <input
              type="number"
              value={adminSettings.default_session_duration}
              onChange={(e) => setAdminSettings({...adminSettings, default_session_duration: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
              min="15"
              max="180"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Rate ($)
            </label>
            <input
              type="number"
              value={adminSettings.hourly_rate}
              onChange={(e) => setAdminSettings({...adminSettings, hourly_rate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>
    </div>
  ), [adminSettings, setAdminSettings]);

  const IntegrationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Integration</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900">Stripe Integration</h4>
            <p className="text-sm text-gray-600 mt-1">Connect your Stripe account for payment processing</p>
            <button className="mt-2 px-4 py-2 bg-brand-teal text-white rounded-md hover:bg-brand-teal-dark">
              Configure Stripe
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Calendar Integration</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900">Google Calendar</h4>
            <p className="text-sm text-gray-600 mt-1">Sync sessions with your Google Calendar</p>
            <button className="mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              Connect Google Calendar
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Referral Program</h3>
        <Link
          to="/dashboard/referrals"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
        >
          Manage Referral Settings
        </Link>
      </div>
    </div>
  );

  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'profile':
        return ProfileSettings;
      case 'general':
        return <GeneralSettings />;
      case 'training':
        return <ClientSettings />;
      case 'business':
        return BusinessSettings;
      case 'integrations':
        return <IntegrationSettings />;
      default:
        return ProfileSettings;
    }
  }, [activeTab, ProfileSettings, BusinessSettings]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="flex items-center text-gray-500 hover:text-brand-blue transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="flex">
              {/* Sidebar Navigation */}
              <div className="w-64 bg-gray-50 rounded-l-lg">
                <nav className="mt-5 px-2 space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-brand-blue text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6">
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    {success}
                  </div>
                )}
                
                {renderTabContent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;