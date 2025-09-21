import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';
import MessageDetailModal from '../client/MessageDetailModal';
import BackToDashboard from '../ui/BackToDashboard';

const MessagesList = () => {
  const { isAdmin } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadMessages();
    }
  }, [isAdmin]);

  const loadMessages = async () => {
    try {
      const { data, error } = await db.supabase
        .from('messages_with_read_status')
        .select('*')
        .eq('status', 'sent')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      showMessage('Failed to load messages', 'danger');
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

  const filteredMessages = messages.filter(msg => {
    const searchMatch = 
      msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.content?.toLowerCase().includes(searchTerm.toLowerCase());

    const typeMatch = 
      filter === 'all' ||
      (filter === 'unread' && !msg.is_read_by_recipient) ||
      (filter === 'read' && msg.is_read_by_recipient) ||
      msg.message_type === filter;

    return searchMatch && typeMatch;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'feedback': return '📝';
      case 'homework': return '📚';
      case 'appointment': return '📅';
      default: return '💬';
    }
  };

  const getStatusColor = (isRead) => {
    return isRead ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const openDetailModal = (message) => {
    setSelectedMessage(message);
    setShowDetailModal(true);
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
    <div className="max-w-7xl mx-auto py-8 px-4">
      {showAlert && (
        <Alert show={true} text={alertMessage} type={alertType} />
      )}

      <div className="mb-8">
        <BackToDashboard />
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">Track all sent messages and their read status</p>
          </div>
          <Link
            to="/dashboard/messages/compose"
            className="bg-gradient-to-r from-brand-blue to-brand-teal text-white px-6 py-2 rounded-md hover:from-brand-blue-dark hover:to-brand-teal-dark focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 font-medium"
          >
            + Compose Message
          </Link>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search messages by subject, recipient, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${ 
                  filter === 'all' 
                    ? 'bg-brand-blue text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({messages.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${ 
                  filter === 'unread' 
                    ? 'bg-brand-blue text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unread ({messages.filter(m => !m.is_read_by_recipient).length})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${ 
                  filter === 'read' 
                    ? 'bg-brand-blue text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Read ({messages.filter(m => m.is_read_by_recipient).length})
              </button>
              <button
                onClick={() => setFilter('feedback')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${ 
                  filter === 'feedback' 
                    ? 'bg-brand-blue text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Feedback
              </button>
              <button
                onClick={() => setFilter('homework')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${ 
                  filter === 'homework' 
                    ? 'bg-brand-blue text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Homework
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📨</div>
            <p className="text-gray-500">No messages found</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your search terms
              </p>
            )}
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div key={message.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{getMessageTypeIcon(message.message_type)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {message.subject}
                      </h3>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.is_read_by_recipient)}`}>
                          {message.is_read_by_recipient ? 'Read' : 'Unread'}
                        </span>
                        {message.priority !== 'normal' && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>To:</strong> {message.recipient_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Type:</strong> {message.message_type}
                        </p>
                        <p className="text-sm text-gray-500">
                          Sent: {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        {message.is_read_by_recipient && message.read_at && (
                          <p className="text-sm text-gray-600">
                            <strong>Read:</strong> {new Date(message.read_at).toLocaleString()}
                          </p>
                        )}
                        {message.scheduled_for && (
                          <p className="text-sm text-gray-600">
                            <strong>Scheduled:</strong> {new Date(message.scheduled_for).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => openDetailModal(message)}
                    className="text-sm bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    🔍 View Details
                  </button>
                  
                  <Link
                    to={`/dashboard/messages/compose?recipient=${message.recipient_id}&subject=Re: ${encodeURIComponent(message.subject)}`}
                    className="text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Reply
                  </Link>
                  
                  <button
                    onClick={() => {
                      const content = `Subject: ${message.subject}\nTo: ${message.recipient_name}\nSent: ${new Date(message.created_at).toLocaleString()}\n\n${message.content}`;
                      navigator.clipboard.writeText(content);
                      showMessage('Message copied to clipboard', 'success');
                    }}
                    className="text-sm bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <MessageDetailModal
        message={selectedMessage}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
};

export default MessagesList;
