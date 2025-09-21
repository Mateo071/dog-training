import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';

const ClientProfile = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [notes, setNotes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isAdmin && id) {
      loadClientData();
    }
  }, [id]);

  const loadClientData = async () => {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await db.getProfileWithUserData(id);

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load dogs
      const { data: dogsData, error: dogsError } = await db.supabase
        .from('dogs')
        .select(`
          *,
          training_analytics(*)
        `)
        .eq('owner_id', id);

      if (dogsError) throw dogsError;
      setDogs(dogsData || []);

      // Load notes
      const { data: notesData, error: notesError } = await db.supabase
        .from('client_notes')
        .select(`
          *,
          users!created_by(email)
        `)
        .eq('profile_id', id)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;
      setNotes(notesData || []);

      // Load recent sessions
      const { data: sessionsData, error: sessionsError } = await db.supabase
        .from('sessions')
        .select(`
          *,
          dogs!inner(name)
        `)
        .in('dog_id', dogsData?.map(d => d.id) || [])
        .order('scheduled_date', { ascending: false })
        .limit(10);

      if (sessionsError) throw sessionsError;
      setSessions(sessionsData || []);

    } catch (err) {
      console.error('Error loading client data:', err);
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

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                       (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? `, ${months} month${months !== 1 ? 's' : ''}` : ''}`;
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

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client not found</p>
        <Link to="/dashboard/clients" className="text-brand-blue hover:underline">
          ← Back to Client List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {showAlert && (
        <Alert show={true} text={alertMessage} type={alertType} />
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link to="/dashboard/clients" className="text-brand-blue hover:underline mb-2 inline-block">
              ← Back to Client List
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {profile.first_name} {profile.last_name}
            </h1>
            <div className="flex gap-2 mt-2">
              {profile.profile_completed ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Profile Complete
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  Profile Incomplete
                </span>
              )}
              {profile.users.is_active && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  Active Account
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/dashboard/clients/${id}/edit`}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Edit Profile
            </Link>
            <Link
              to={`/dashboard/messages/compose?recipient=${id}&from=/dashboard/clients/${id}`}
              className="bg-brand-teal text-white px-4 py-2 rounded-md hover:bg-brand-teal-dark transition-colors"
            >
              Send Message
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'dogs', 'sessions', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-brand-blue text-brand-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{profile.users.email}</p>
              </div>
              {profile.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{profile.phone}</p>
                </div>
              )}
              {profile.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">{profile.address}</p>
                </div>
              )}
              {profile.emergency_contact && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                  <p className="text-gray-900">{profile.emergency_contact}</p>
                  {profile.emergency_phone && (
                    <p className="text-gray-600">{profile.emergency_phone}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Account Created</label>
                <p className="text-gray-900">
                  {new Date(profile.users.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Profile Created</label>
                <p className="text-gray-900">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
              {profile.signup_completed_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Signup Completed</label>
                  <p className="text-gray-900">
                    {new Date(profile.signup_completed_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              {profile.how_heard_about_us && (
                <div>
                  <label className="text-sm font-medium text-gray-500">How They Found Us</label>
                  <p className="text-gray-900">{profile.how_heard_about_us}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dogs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Dogs ({dogs.length})</h3>
            <Link
              to={`/dashboard/clients/${id}/dogs/add`}
              className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark transition-colors"
            >
              + Add Dog
            </Link>
          </div>
          
          {dogs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">🐕</div>
              <p className="text-gray-500">No dogs added yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dogs.map((dog) => (
                <div key={dog.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{dog.name}</h4>
                      <p className="text-gray-600">{dog.breed} • {dog.sex ? dog.sex.charAt(0).toUpperCase() + dog.sex.slice(1) : 'Sex not specified'}</p>
                      <p className="text-sm text-gray-500">
                        {calculateAge(dog.birth_date)} old
                      </p>
                    </div>
                    {dog.photo_url && (
                      <img
                        src={dog.photo_url}
                        alt={dog.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                  </div>
                  
                  {dog.training_analytics && dog.training_analytics.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-md">
                      <h5 className="font-medium text-blue-900 mb-2">Training Progress</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700">Total Sessions:</span>
                          <span className="ml-1 font-medium">
                            {dog.training_analytics[0].total_sessions || 0}
                          </span>
                        </div>
                        {dog.training_analytics[0].last_session_date && (
                          <div>
                            <span className="text-blue-700">Last Session:</span>
                            <span className="ml-1 font-medium">
                              {new Date(dog.training_analytics[0].last_session_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {dog.training_goals && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-1">Training Goals</h5>
                      <p className="text-sm text-gray-600">{dog.training_goals}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      to={`/dashboard/clients/${id}/dogs/${dog.id}/edit`}
                      className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/dashboard/sessions/create?dog=${dog.id}`}
                      className="text-sm bg-brand-teal text-white px-3 py-1 rounded hover:bg-brand-teal-dark transition-colors"
                    >
                      Schedule Session
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Sessions ({sessions.length})</h3>
          
          {sessions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📅</div>
              <p className="text-gray-500">No sessions scheduled yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {session.dogs.name} - {session.session_type}
                      </h4>
                      <p className="text-gray-600">
                        {new Date(session.scheduled_date).toLocaleDateString()} at{' '}
                        {new Date(session.scheduled_date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                        session.status === 'completed' ? 'bg-green-100 text-green-800' :
                        session.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        session.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                  
                  {session.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">{session.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notes ({notes.length})</h3>
            <button className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark transition-colors">
              + Add Note
            </button>
          </div>
          
          {notes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📝</div>
              <p className="text-gray-500">No notes yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {note.title && (
                        <h4 className="font-semibold text-gray-900">{note.title}</h4>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        note.note_type === 'important' ? 'bg-red-100 text-red-800' :
                        note.note_type === 'training' ? 'bg-blue-100 text-blue-800' :
                        note.note_type === 'behavioral' ? 'bg-yellow-100 text-yellow-800' :
                        note.note_type === 'medical' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {note.note_type}
                      </span>
                      {note.is_important && (
                        <span className="text-red-500 text-sm">⚠️ Important</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientProfile;