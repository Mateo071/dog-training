import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';
import ViewSelector from '../ui/ViewSelector';
import SessionCalendarView from '../client/SessionCalendarView';
import SessionListView from '../client/SessionListView';
import SessionDetailsView from '../client/SessionDetailsView';
import SessionDetailModal from '../client/SessionDetailModal';
import { createHomeworkRenderer } from '../content/HomeworkRenderer';
import { updateCompletedSessions, processSessionsForAutoCompletion } from '../../lib/sessionUtils';
import BackToDashboard from '../ui/BackToDashboard';

const SessionManagement = () => {
  const { isAdmin } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('list');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadSessions();
      loadClients();
    }
  }, []);

  // Auto-refresh sessions every 5 minutes to catch newly completed sessions
  useEffect(() => {
    if (!isAdmin) return;

    const interval = setInterval(async () => {
      console.log('Checking for sessions to auto-complete...');
      const updatedCount = await updateCompletedSessions(sessions);
      if (updatedCount > 0) {
        // Reload sessions to get updated data
        loadSessions();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [sessions, isAdmin]);

  const loadSessions = async () => {
    try {
      const { data, error } = await db.supabase
        .from('sessions_with_details')
        .select('*');

      if (error) throw error;
      
      const rawSessions = data || [];
      
      // Auto-complete sessions that have passed their end time
      const updatedCount = await updateCompletedSessions(rawSessions);
      
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

  const loadClients = async () => {
    try {
      const { data, error } = await db.supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          dogs(id, name)
        `)
        .eq('role', 'client')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const updateSessionStatus = async (sessionId, newStatus) => {
    try {
      const { error } = await db.supabase
        .from('sessions')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.map(session =>
        session.id === sessionId 
          ? { ...session, status: newStatus }
          : session
      ));

      showAlertMessage(`Session ${newStatus} successfully`, 'success');
    } catch (error) {
      console.error('Error updating session:', error);
      showAlertMessage('Failed to update session status', 'error');
    }
  };

  const deleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      const { error } = await db.supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(session => session.id !== sessionId));
      showAlertMessage('Session deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting session:', error);
      showAlertMessage('Failed to delete session', 'error');
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

  const renderHomeworkContent = createHomeworkRenderer(true);

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

  const filteredSessions = sessions.filter(session => {
    const matchesFilter = filter === 'all' || session.status === filter;
    const matchesSearch = searchTerm === '' || 
      session.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.dog_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const upcomingSessions = sessions.filter(s => {
    const sessionDate = new Date(s.scheduled_date);
    const now = new Date();
    return (s.status === 'scheduled' || s.status === 'confirmed') && sessionDate > now;
  }).length;

  const todaySessions = sessions.filter(s => {
    const today = new Date().toDateString();
    const sessionDate = new Date(s.scheduled_date).toDateString();
    return sessionDate === today && (s.status === 'scheduled' || s.status === 'confirmed');
  }).length;

  if (!isAdmin) {
    return <div className="text-center py-8">Access denied. Admin privileges required.</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showAlert && (
        <Alert
          message={alertMessage}
          type={alertType}
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <BackToDashboard />
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Schedule and manage training sessions for your clients
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/dashboard/sessions/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Schedule Session
          </Link>
        </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{sessions.length}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Sessions</dt>
                  <dd className="text-lg font-medium text-gray-900">{sessions.length}</dd>
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
                  <span className="text-white text-sm font-medium">{upcomingSessions}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Upcoming</dt>
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
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{todaySessions}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Today</dt>
                  <dd className="text-lg font-medium text-gray-900">{todaySessions}</dd>
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
                  <span className="text-white text-sm font-medium">{clients.length}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Clients</dt>
                  <dd className="text-lg font-medium text-gray-900">{clients.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Selector */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by client or dog name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sessions</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
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
              ? "Get started by scheduling your first session."
              : `No sessions found with status: ${filter}`
            }
          </p>
          <div className="mt-6">
            <Link
              to="/dashboard/sessions/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Schedule First Session
            </Link>
          </div>
        </div>
      ) : (
        <>
          {currentView === 'list' && (
            <SessionListView 
              sessions={filteredSessions}
              getStatusColor={getStatusColor}
              getTypeColor={getTypeColor}
              onSessionClick={handleSessionClick}
              updateSessionStatus={updateSessionStatus}
              deleteSession={deleteSession}
              isAdmin={true}
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
              renderHomeworkContent={renderHomeworkContent}
              onSessionClick={handleSessionClick}
              updateSessionStatus={updateSessionStatus}
              deleteSession={deleteSession}
              isAdmin={true}
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
        updateSessionStatus={updateSessionStatus}
        deleteSession={deleteSession}
        isAdmin={true}
      />
    </div>
  );
};

export default SessionManagement;