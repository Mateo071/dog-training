import React from 'react';
import { Link } from 'react-router-dom';

const SessionListView = ({
  sessions = [],
  getStatusColor,
  getTypeColor,
  onSessionClick,
  confirmSession,
  deleteSession,
  isAdmin = false
}) => {
  const isUpcoming = (scheduledDate) => {
    return new Date(scheduledDate) > new Date();
  };

  const handleSessionClick = (session, event) => {
    // Don't trigger modal if clicking on action buttons
    if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A') {
      return;
    }
    if (onSessionClick) {
      onSessionClick(session);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
        <p className="text-gray-500">No training sessions match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {sessions.map((session) => (
          <li key={session.id}>
            <div 
              className="px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={(e) => handleSessionClick(session, e)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium w-24 ${getTypeColor(session.session_type)}`}>
                      {session.session_type}
                    </div>
                    <div className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium w-20 ${getStatusColor(session.status)}`}>
                      {session.status}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {isAdmin ? `${session.client_name} & ${session.dog_name}` : session.dog_name}
                        </p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <span>{new Date(session.scheduled_date).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(session.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SessionListView;