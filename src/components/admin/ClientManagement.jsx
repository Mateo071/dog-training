import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/supabase';
import BackToDashboard from '../ui/BackToDashboard';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';

const ClientManagement = () => {
  const { isAdmin } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  useEffect(() => {
    if (isAdmin) {
      loadProfiles();
    }
  }, [isAdmin]);

  const loadProfiles = async () => {
    try {
      const { data, error } = await db.getAllProfilesWithUserData();

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error loading profiles:', err);
      showMessage('Error loading client profiles', 'danger');
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

  const sendSignupInvitation = async (profile) => {
    try {
      // Get current user for created_by field
      const { data: { user: currentUser }, error: currentUserError } = await db.supabase.auth.getUser();
      if (currentUserError || !currentUser) throw new Error('Must be authenticated as admin');

      // Generate invitation token and expiry
      const invitationToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      // Create signup invitation using database helper
      const { error: invitationError } = await db.createSignupInvitation({
        contact_submission_id: null, // No associated contact submission
        email: profile.users.email,
        invitation_token: invitationToken,
        expires_at: expiresAt.toISOString(),
        created_by: currentUser.id
      });

      if (invitationError) throw invitationError;

      // Create the invitation URL
      const invitationUrl = `${window.location.origin}/signup?token=${invitationToken}&email=${encodeURIComponent(profile.users.email)}`;

      // Copy to clipboard with improved error handling
      try {
        await navigator.clipboard.writeText(invitationUrl);
        const clientName = `${profile.first_name} ${profile.last_name}`;
        showMessage(`Signup link copied to clipboard for ${clientName}!`, 'success');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        const clientName = `${profile.first_name} ${profile.last_name}`;
        showMessage(`Signup link created for ${clientName}! Manual copy: ${invitationUrl}`, 'success');
      }

    } catch (err) {
      console.error('Error creating invitation:', err);
      showMessage('Failed to create signup invitation. Please try again.', 'danger');
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const searchMatch = 
      profile.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.phone?.includes(searchTerm);

    const statusMatch = 
      filterStatus === 'all' ||
      (filterStatus === 'completed' && profile.profile_completed) ||
      (filterStatus === 'incomplete' && !profile.profile_completed) ||
      (filterStatus === 'active' && profile.users?.is_active);

    return searchMatch && statusMatch;
  });

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
    <div className="max-w-7xl mx-auto py-8 px-4">
      {showAlert && (
        <Alert show={true} text={alertMessage} type={alertType} />
      )}

      <div className="mb-8">
        <BackToDashboard />
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600">Manage client profiles and training programs</p>
          </div>
          <Link
            to="/dashboard/clients/create"
            className="bg-gradient-to-r from-brand-blue to-brand-teal text-white px-6 py-2 rounded-md hover:from-brand-blue-dark hover:to-brand-teal-dark focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 font-medium"
          >
            + Add New Client
          </Link>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search clients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              >
                <option value="all">All Clients</option>
                <option value="active">Active</option>
                <option value="completed">Profile Complete</option>
                <option value="incomplete">Profile Incomplete</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="space-y-4">
        {filteredProfiles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">👥</div>
            <p className="text-gray-500">No clients found</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your search terms
              </p>
            )}
          </div>
        ) : (
          filteredProfiles.map((profile) => (
            <div key={profile.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {profile.first_name} {profile.last_name}
                      </h3>
                      <div className="flex gap-2">
                        {profile.profile_completed ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Complete
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Incomplete
                          </span>
                        )}
                        {profile.users?.is_active && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          📧 {profile.users?.email}
                        </p>
                        {profile.phone && (
                          <p className="text-sm text-gray-600">
                            📞 {profile.phone}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          Joined {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        {profile.dogs && profile.dogs.length > 0 ? (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Dogs:</p>
                            {profile.dogs.map((dog, index) => (
                              <span key={dog.id} className="text-sm text-gray-600">
                                {dog.name} ({dog.breed})
                                {index < profile.dogs.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No dogs added yet</p>
                        )}

                        {profile.training_analytics && profile.training_analytics.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              Sessions: {profile.training_analytics[0].total_sessions || 0}
                            </p>
                            {profile.training_analytics[0].last_session_date && (
                              <p className="text-sm text-gray-600">
                                Last: {new Date(profile.training_analytics[0].last_session_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}

                        {profile.referrals && profile.referrals.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">Referral Code:</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">
                                {profile.referrals[0].referral_code}
                              </p>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(profile.referrals[0].referral_code)
                                    .then(() => showMessage(`Referral code copied for ${profile.first_name}!`, 'success'))
                                    .catch(() => showMessage('Failed to copy referral code', 'danger'));
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                                title="Copy referral code"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {profile.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">{profile.notes}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Link
                    to={`/dashboard/clients/${profile.id}`}
                    className="text-sm bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark transition-colors"
                  >
                    View Details
                  </Link>
                  
                  <Link
                    to={`/dashboard/clients/${profile.id}/edit?from=/dashboard/clients`}
                    className="text-sm bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Edit Profile
                  </Link>
                  
                  <Link
                    to={`/dashboard/messages/compose?recipient=${profile.id}&from=/dashboard/clients`}
                    className="text-sm bg-brand-teal text-white px-4 py-2 rounded-md hover:bg-brand-teal-dark transition-colors"
                  >
                    Send Message
                  </Link>

                  {!profile.profile_completed && (
                    <button
                      onClick={() => sendSignupInvitation(profile)}
                      className="text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Get Signup Link
                    </button>
                  )}
                  
                  <a
                    href={`mailto:${profile.users?.email}?subject=Your Training Program&body=Hi ${profile.first_name},%0D%0A%0D%0A`}
                    className="text-sm bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Email
                  </a>
                  
                  {profile.phone && (
                    <a
                      href={`tel:${profile.phone}`}
                      className="text-sm bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientManagement;