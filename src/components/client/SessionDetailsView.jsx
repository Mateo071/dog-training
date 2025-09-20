import React from 'react';
import { Link } from 'react-router-dom';

const SessionDetailsView = ({
  sessions = [],
  getStatusColor,
  getTypeColor,
  renderHomeworkContent,
  confirmSession,
  deleteSession,
  onSessionClick,
  isAdmin = false
}) => {
  const handleSessionClick = (session, event) => {
    // Don't trigger modal if clicking on action buttons
    if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A') {
      return;
    }
    if (onSessionClick) {
      onSessionClick(session);
    }
  };

  const groupSessionsByDate = (sessions) => {
    const grouped = {};
    sessions.forEach(session => {
      const date = new Date(session.scheduled_date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });
    return grouped;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const isUpcoming = (scheduledDate) => {
    return new Date(scheduledDate) > new Date();
  };

  const groupedSessions = groupSessionsByDate(sessions);
  const sortedDates = Object.keys(groupedSessions).sort((a, b) => new Date(a) - new Date(b));

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-4xl mb-4">📅</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
        <p className="text-gray-500">No training sessions match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map(dateStr => (
        <div key={dateStr} className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <h3 className="text-lg font-medium text-gray-900">
              {formatDate(dateStr)}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {groupedSessions[dateStr].length} session{groupedSessions[dateStr].length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {groupedSessions[dateStr]
              .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
              .map(session => {
                return (
                  <div 
                    key={session.id} 
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={(e) => handleSessionClick(session, e)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium w-24 ${getTypeColor(session.session_type)}`}>
                            {session.session_type}
                          </div>
                          <div className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium w-20 ${getStatusColor(session.status)}`}>
                            {session.status}
                          </div>
                          <div className="text-sm text-gray-500">
                            {session.duration_minutes} min
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-lg font-medium text-gray-900">
                            {isAdmin ? `${session.client_name} & ${session.dog_name}` : session.dog_name}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <span>📅 {new Date(session.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isAdmin && session.client_phone && (
                              <>
                                <span className="mx-2">•</span>
                                <span>📞 {session.client_phone}</span>
                              </>
                            )}
                            {isAdmin && session.client_email && (
                              <>
                                <span className="mx-2">•</span>
                                <span>✉️ {session.client_email}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {/* Action buttons */}
                        {isAdmin ? (
                          <>
                            <Link
                              to={`/dashboard/sessions/${session.id}/edit`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(session.id);
                              }}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          session.status === 'scheduled' && isUpcoming(session.scheduled_date) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmSession(session.id);
                              }}
                              className="text-green-600 hover:text-green-900 text-sm font-medium"
                            >
                              Confirm
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Always Show Details */}
                    <div className="space-y-4">
                      {session.notes && (
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Session Notes</h5>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.notes}</p>
                        </div>
                      )}
                      
                      {session.homework_assigned && (
                        <div className="bg-blue-50 p-4 rounded-md">
                          <h5 className="text-sm font-medium text-blue-900 mb-2">Relevant Homework</h5>
                          <div className="text-blue-800">
                            {renderHomeworkContent ? renderHomeworkContent(session.homework_assigned) : (
                              <Link 
                                to={`${isAdmin ? '/dashboard' : ''}/messages?messageId=${session.homework_assigned}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm hover:underline block"
                              >
                                📝 View homework assignment
                              </Link>
                            )}
                          </div>
                        </div>
                      )}

                      {isAdmin && (
                        <div className="bg-yellow-50 p-4 rounded-md">
                          <h5 className="text-sm font-medium text-yellow-900 mb-2">Admin Details</h5>
                          <div className="text-sm text-yellow-800 space-y-1">
                            <div><strong>Session ID:</strong> {session.id}</div>
                            <div><strong>Created:</strong> {new Date(session.created_at).toLocaleString()}</div>
                            {session.updated_at !== session.created_at && (
                              <div><strong>Last Updated:</strong> {new Date(session.updated_at).toLocaleString()}</div>
                            )}
                            <div><strong>Dog Breed:</strong> {session.dog_breed}</div>
                            {session.training_goals && (
                              <div><strong>Training Goals:</strong> {session.training_goals}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      ))}
    </div>
  );
};

export default SessionDetailsView;