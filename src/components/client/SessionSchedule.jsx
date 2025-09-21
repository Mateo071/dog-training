import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';
import ViewSelector from '../ui/ViewSelector';
import SessionCalendarView from './SessionCalendarView';
import SessionListView from './SessionListView';
import SessionDetailsView from './SessionDetailsView';
import SessionDetailModal from './SessionDetailModal';
import { createHomeworkRenderer } from '../content/HomeworkRenderer';
import { updateCompletedSessions, processSessionsForAutoCompletion } from '../../lib/sessionUtils';

const SessionSchedule = () => {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [homeworkMessages, setHomeworkMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [filter, setFilter] = useState('all');
  const [currentView, setCurrentView] = useState('list');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (profile) {
      loadSessions();
      loadDogs();
    }
  }, [profile]);

  useEffect(() => {
    if (sessions.length > 0) {
      loadHomeworkMessages();
    }
  }, [sessions]);

  // Auto-refresh sessions every 5 minutes to catch newly completed sessions
  useEffect(() => {
    if (!profile) return;

    const interval = setInterval(async () => {
      console.log('Checking for sessions to auto-complete...');
      const updatedCount = await updateCompletedSessions(sessions);
      if (updatedCount > 0) {
        // Reload sessions to get updated data
        loadSessions();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [sessions, profile]);

  const loadSessions = async () => {
    try {
      const { data, error } = await db.supabase
        .from('sessions_with_details')
        .select('*')
        .eq('client_id', profile.id);

      if (error) throw error;
      
      const rawSessions = data || [];
      
      // Auto-complete sessions that have passed their end time
      const updatedCount = await updateCompletedSessions(rawSessions);
      if (updatedCount > 0) {
        console.log(`Auto-completed ${updatedCount} sessions`);
      }
      
      // Process sessions for local state (in case database update hasn't propagated yet)
      const processedSessions = processSessionsForAutoCompletion(rawSessions);
      
      // Sort sessions: upcoming first, then past/completed at bottom
      const sortedSessions = processedSessions.sort((a, b) => {
        const now = new Date();
        const dateA = new Date(a.scheduled_date);
        const dateB = new Date(b.scheduled_date);
        
        const isUpcomingA = dateA > now && (a.status === 'scheduled' || a.status === 'confirmed');
        const isUpcomingB = dateB > now && (b.status === 'scheduled' || b.status === 'confirmed');
        const isCompletedA = a.status === 'completed' || dateA < now;
        const isCompletedB = b.status === 'completed' || dateB < now;
        
        // Upcoming sessions first
        if (isUpcomingA && !isUpcomingB) return -1;
        if (!isUpcomingA && isUpcomingB) return 1;
        
        // Completed/past sessions last
        if (isCompletedA && !isCompletedB) return 1;
        if (!isCompletedA && isCompletedB) return -1;
        
        // Within same category, sort by date (upcoming: earliest first, completed: latest first)
        if (isUpcomingA && isUpcomingB) return dateA - dateB;
        if (isCompletedA && isCompletedB) return dateB - dateA;
        
        // Default: sort by date
        return dateA - dateB;
      });
      
      setSessions(sortedSessions);
      
    } catch (error) {
      console.error('Error loading sessions:', error);
      showAlertMessage('Failed to load sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDogs = async () => {
    try {
      const { data, error } = await db.supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', profile.id);

      if (error) throw error;
      setDogs(data || []);
    } catch (error) {
      console.error('Error loading dogs:', error);
    }
  };

  const loadHomeworkMessages = async () => {
    try {
      // Get all unique homework message IDs from sessions (handle both UUIDs and integers)
      const homeworkIds = sessions
        .filter(session => session.homework_assigned && session.homework_assigned.trim() !== '')
        .map(session => session.homework_assigned.trim())
        .filter((id, index, arr) => arr.indexOf(id) === index); // Remove duplicates

      if (homeworkIds.length === 0) return;

      const { data, error } = await db.supabase
        .from('messages_with_read_status')
        .select('id, subject, content, message_type, created_at, recipient_id')
        .in('id', homeworkIds);


      if (error) throw error;

      // Filter messages for this user and create lookup object
      const userMessages = (data || []).filter(msg => msg.recipient_id === profile.id);
      
      const homeworkLookup = {};
      userMessages.forEach(message => {
        homeworkLookup[message.id] = message;
      });
      setHomeworkMessages(homeworkLookup);
    } catch (error) {
      console.error('Error loading homework messages:', error);
    }
  };

  const confirmSession = async (sessionId) => {
    try {
      const { error } = await db.supabase
        .from('sessions')
        .update({ 
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.map(session =>
        session.id === sessionId 
          ? { ...session, status: 'confirmed' }
          : session
      ));

      showAlertMessage('Session confirmed successfully!', 'success');
    } catch (error) {
      console.error('Error confirming session:', error);
      showAlertMessage('Failed to confirm session', 'error');
    }
  };

  const showAlertMessage = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSession(null);
  };

  const renderHomeworkContent = createHomeworkRenderer(false, homeworkMessages);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'evaluation': return 'bg-purple-100 text-purple-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'follow_up':
      case 'follow-up': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isUpcoming = (scheduledDate) => {
    return new Date(scheduledDate) > new Date();
  };

  const isPast = (scheduledDate) => {
    return new Date(scheduledDate) < new Date();
  };

  const filteredSessions = sessions.filter(session => {
    switch (filter) {
      case 'upcoming':
        return isUpcoming(session.scheduled_date) && 
               (session.status === 'scheduled' || session.status === 'confirmed');
      case 'past':
        return isPast(session.scheduled_date) || session.status === 'completed';
      case 'scheduled':
        return session.status === 'scheduled';
      case 'confirmed':
        return session.status === 'confirmed';
      case 'completed':
        return session.status === 'completed';
      default:
        return true;
    }
  });

  const upcomingSessions = sessions.filter(s => 
    isUpcoming(s.scheduled_date) && (s.status === 'scheduled' || s.status === 'confirmed')
  ).length;

  const completedSessions = sessions.filter(s => s.status === 'completed').length;

  const nextSession = sessions
    .filter(s => isUpcoming(s.scheduled_date) && (s.status === 'scheduled' || s.status === 'confirmed'))
    .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))[0];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showAlert && (
        <Alert
          message={alertMessage}
          type={alertType}
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Training Sessions</h1>
        <p className="mt-2 text-sm text-gray-700">
          View and manage your scheduled training sessions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{upcomingSessions}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Sessions</dt>
                  <dd className="text-lg font-medium text-gray-900">{upcomingSessions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{completedSessions}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Sessions</dt>
                  <dd className="text-lg font-medium text-gray-900">{completedSessions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{dogs.length}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Dogs in Training</dt>
                  <dd className="text-lg font-medium text-gray-900">{dogs.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Session Card */}
      {nextSession && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <h3 className="text-lg font-medium mb-2">Next Training Session</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-1">
                {nextSession.dog_name} • {nextSession.session_type}
              </p>
              <p className="text-xl font-semibold">
                {new Date(nextSession.scheduled_date).toLocaleDateString()} at{' '}
                {new Date(nextSession.scheduled_date).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
              <p className="text-blue-100 mt-1">
                Duration: {nextSession.duration_minutes} minutes
              </p>
            </div>
            {nextSession.status === 'scheduled' && (
              <button
                onClick={() => confirmSession(nextSession.id)}
                className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
              >
                Confirm Session
              </button>
            )}
          </div>
          {(nextSession.notes || nextSession.homework_assigned) && (
            <div className="mt-4 space-y-3">
              {nextSession.notes && (
                <div className="p-3 bg-blue-400 bg-opacity-50 rounded-md">
                  <p className="text-sm">
                    <strong>Notes:</strong> {nextSession.notes}
                  </p>
                </div>
              )}
              {nextSession.homework_assigned && (
                <div className="p-3 bg-blue-400 bg-opacity-50 rounded-md">
                  <div className="text-sm">
                    <div className="font-medium mb-1 text-white">Relevant Homework:</div>
                    <div className="text-white">
                      {renderHomeworkContent(nextSession.homework_assigned)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filters and View Selector */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Sessions' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'past', label: 'Past' },
              { key: 'scheduled', label: 'Scheduled' },
              { key: 'confirmed', label: 'Confirmed' },
              { key: 'completed', label: 'Completed' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="border-t pt-4">
            <ViewSelector 
              currentView={currentView} 
              onViewChange={setCurrentView} 
            />
          </div>
        </div>
      </div>

      {/* Sessions Views */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? "You don't have any training sessions scheduled yet."
              : `No sessions found with the selected filter: ${filter}`
            }
          </p>
        </div>
      ) : (
        <>
          {currentView === 'list' && (
            <SessionListView 
              sessions={filteredSessions}
              getStatusColor={getStatusColor}
              getTypeColor={getTypeColor}
              onSessionClick={handleSessionClick}
              renderHomeworkContent={renderHomeworkContent}
              confirmSession={confirmSession}
              isAdmin={false}
            />
          )}
          
          {currentView === 'calendar' && (
            <SessionCalendarView 
              sessions={filteredSessions}
              getStatusColor={getStatusColor}
              getTypeColor={getTypeColor}
              onSessionClick={handleSessionClick}
            />
          )}
          
          {currentView === 'details' && (
            <SessionDetailsView 
              sessions={filteredSessions}
              getStatusColor={getStatusColor}
              getTypeColor={getTypeColor}
              onSessionClick={handleSessionClick}
              renderHomeworkContent={renderHomeworkContent}
              confirmSession={confirmSession}
              isAdmin={false}
            />
          )}
        </>
      )}

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        isOpen={showModal}
        onClose={closeModal}
        getStatusColor={getStatusColor}
        getTypeColor={getTypeColor}
        renderHomeworkContent={renderHomeworkContent}
        confirmSession={confirmSession}
        isAdmin={false}
      />
    </div>
  );
};

export default SessionSchedule;