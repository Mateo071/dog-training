import React from 'react';
import { Link } from 'react-router-dom';

const SessionDetailModal = ({
  session,
  isOpen,
  onClose,
  getStatusColor,
  getTypeColor,
  renderHomeworkContent,
  confirmSession,
  deleteSession,
  isAdmin = false
}) => {
  if (!isOpen || !session) return null;

  const isUpcoming = (scheduledDate) => {
    return new Date(scheduledDate) > new Date();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Session Details
            </h2>
            <div className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium w-24 ${getTypeColor(session.session_type)}`}>
              {session.session_type}
            </div>
            <div className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium w-20 ${getStatusColor(session.status)}`}>
              {session.status}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                {isAdmin ? 'Client & Dog' : 'Dog'}
              </h3>
              <p className="text-lg font-medium text-gray-900">
                {isAdmin ? `${session.client_name} - ${session.dog_name}` : session.dog_name}
              </p>
              {session.dog_breed && (
                <p className="text-sm text-gray-500">{session.dog_breed}</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
              <p className="text-lg font-medium text-gray-900">
                {new Date(session.scheduled_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(session.scheduled_date).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })} • {session.duration_minutes} minutes
              </p>
            </div>
          </div>

          {/* Contact Info (Admin only) */}
          {isAdmin && (session.client_phone || session.client_email) && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                {session.client_phone && (
                  <div className="flex items-center text-sm text-gray-700 mb-1">
                    <span className="mr-2">📞</span>
                    <a href={`tel:${session.client_phone}`} className="hover:text-blue-600">
                      {session.client_phone}
                    </a>
                  </div>
                )}
                {session.client_email && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="mr-2">✉️</span>
                    <a href={`mailto:${session.client_email}`} className="hover:text-blue-600">
                      {session.client_email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Session Notes */}
          {session.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Session Notes</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.notes}</p>
              </div>
            </div>
          )}

          {/* Relevant Homework */}
          {session.homework_assigned && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Relevant Homework</h3>
              <div className="bg-blue-50 p-4 rounded-md">
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
            </div>
          )}

          {/* Training Goals */}
          {session.training_goals && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Training Goals</h3>
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-green-800">{session.training_goals}</p>
              </div>
            </div>
          )}

          {/* Admin Details */}
          {isAdmin && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Administrative Details</h3>
              <div className="bg-yellow-50 p-4 rounded-md">
                <div className="text-sm text-yellow-800 space-y-1">
                  <div><strong>Session ID:</strong> {session.id}</div>
                  <div><strong>Created:</strong> {new Date(session.created_at).toLocaleString()}</div>
                  {session.updated_at !== session.created_at && (
                    <div><strong>Last Updated:</strong> {new Date(session.updated_at).toLocaleString()}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex items-center space-x-2">
            {isAdmin ? (
              <>
                <Link
                  to={`/dashboard/sessions/${session.id}/edit`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Edit Session
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this session?')) {
                      deleteSession(session.id);
                      onClose();
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </>
            ) : (
              session.status === 'scheduled' && isUpcoming(session.scheduled_date) && (
                <button
                  onClick={() => {
                    confirmSession(session.id);
                    onClose();
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  Confirm Session
                </button>
              )
            )}
          </div>
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailModal;