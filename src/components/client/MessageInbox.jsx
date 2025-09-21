import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtimeMessages, useNotificationPermission } from '../../hooks/useRealtime';
import Alert from '../ui/Alert';
import MessageDetailModal from './MessageDetailModal';
import MarkdownRenderer from '../content/MarkdownRenderer';

const MessageInbox = () => {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [filter, setFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Real-time features
  const { messages: realtimeMessages, unreadCount, setUnreadCount } = useRealtimeMessages();
  const { permission, requestPermission } = useNotificationPermission();

  useEffect(() => {
    if (profile) {
      loadMessages();
    }
  }, [profile]);

  // Request notification permission on component mount
  useEffect(() => {
    if (permission === 'default') {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Update messages when real-time messages arrive
  useEffect(() => {
    if (realtimeMessages.length > 0) {
      setMessages(prev => {
        const newMessages = realtimeMessages.filter(
          newMsg => !prev.some(existingMsg => existingMsg.id === newMsg.id)
        );
        return [...newMessages, ...prev];
      });
    }
  }, [realtimeMessages]);

  // Handle messageId URL parameter to auto-open specific message
  useEffect(() => {
    const messageId = searchParams.get('messageId');
    if (messageId && messages.length > 0) {
      // Handle both UUID and numeric message IDs
      const message = messages.find(m => m.id === messageId || m.id === parseInt(messageId));
      if (message) {
        setSelectedMessage(message);
        setShowDetailModal(true);
        // Clear the URL parameter after opening
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.delete('messageId');
          return newParams;
        });
      }
    }
  }, [messages, searchParams, setSearchParams]);

  const loadMessages = async () => {
    try {
      const { data, error } = await db.supabase
        .from('messages_with_read_status')
        .select('*')
        .eq('recipient_id', profile.id)
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

  const markAsRead = async (message) => {
    // A message is truly read if it has a read receipt (the stored procedure creates this correctly)
    const isAlreadyRead = message.has_read_receipt;
    
    if (!isAlreadyRead) {
      
      try {
        const { error } = await db.markMessageAsRead(message.id, user.id);
        if (error) {
          console.error('MessageInbox: Error marking message as read:', error);
          throw error;
        }
        

        // Update local state immediately for instant UI feedback
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, has_read_receipt: true }
              : msg
          )
        );
        
        // Update global unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Error marking message as read:', err);
      }
    }
  };

  const selectMessage = (message) => {
    setSelectedMessage(message);
    markAsRead(message);
  };

  const openDetailModal = (message) => {
    setSelectedMessage(message);
    setShowDetailModal(true);
    markAsRead(message);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'feedback': return '📝';
      case 'homework': return '📚';
      case 'appointment': return '📅';
      case 'welcome': return '👋';
      case 'onboarding_welcome': return '🎯';
      case 'onboarding_reminder': return '⏰';
      default: return '💬';
    }
  };


  const exportToPDF = async (message) => {
    // Create a simple PDF export by opening a print dialog
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Message - ${message.subject}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
            .message-content { line-height: 1.6; }
            .meta { color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${message.subject}</h1>
            <div class="meta">
              <strong>From:</strong> ${message.sender_name}<br>
              <strong>Date:</strong> ${new Date(message.created_at).toLocaleString()}<br>
              <strong>Type:</strong> ${message.message_type}
            </div>
          </div>
          <div class="message-content">
            ${message.content.replace(/\n/g, '<br>')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !msg.has_read_receipt;
    if (filter === 'read') return msg.has_read_receipt;
    return msg.message_type === filter;
  });

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
        <Link
          to="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-brand-blue transition-colors duration-200 mb-4 font-medium"
        >
          ← Back to Dashboard
        </Link>
        
        {/* Onboarding Banner for Incomplete Profiles */}
        {!profile?.profile_completed && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-blue-500 text-lg mr-3">🎯</span>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  Complete Your Profile Setup
                </h3>
                <p className="text-sm text-blue-700 mb-2">
                  You're currently on step {profile?.onboarding_step || 0} of 5. Complete your profile to unlock all features and get the most out of your training program.
                </p>
                <Link
                  to="/onboarding"
                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                >
                  Continue Setup →
                </Link>
              </div>
            </div>
          </div>
        )}
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Messages
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {unreadCount} unread
            </span>
          )}
        </h1>
        <p className="text-gray-600">Training updates and communications from your trainer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          {/* Filter Controls */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === 'all' 
                    ? 'bg-brand-blue text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({messages.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === 'unread' 
                    ? 'bg-brand-blue text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('feedback')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === 'feedback' 
                    ? 'bg-brand-blue text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Feedback
              </button>
              <button
                onClick={() => setFilter('homework')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === 'homework' 
                    ? 'bg-brand-blue text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Homework
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <div className="text-gray-400 text-4xl mb-4">📭</div>
                <p className="text-gray-500">No messages found</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => selectMessage(message)}
                  className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${selectedMessage?.id === message.id ? 'ring-2 ring-brand-blue border-brand-blue' : ''
                  } ${!message.has_read_receipt ? 'border-l-4 border-l-brand-blue bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getMessageTypeIcon(message.message_type)}</span>
                      {!message.has_read_receipt && (
                        <span className="w-2 h-2 bg-brand-blue rounded-full"></span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {message.priority !== 'normal' && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {message.subject}
                  </h3>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {message.content}
                  </p>
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t">
                    <span className="text-xs text-gray-500">
                      From: {message.sender_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailModal(message);
                        }}
                        className="text-xs px-2 py-1 bg-brand-blue text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${message.message_type === 'feedback' ? 'bg-green-100 text-green-800' : 
                        message.message_type === 'homework' ? 'bg-blue-100 text-blue-800' : 
                        message.message_type === 'appointment' ? 'bg-purple-100 text-purple-800' : 
                        message.message_type === 'welcome' ? 'bg-yellow-100 text-yellow-800' : 
                        message.message_type === 'onboarding_welcome' ? 'bg-teal-100 text-teal-800' : 
                        message.message_type === 'onboarding_reminder' ? 'bg-orange-100 text-orange-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {message.message_type}
                      </span>
                    </div>
                  </div>
                </div>
              )) 
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Message Header */}
              <div className="border-b p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>From: <strong>{selectedMessage.sender_name}</strong></span>
                      <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                      {selectedMessage.priority !== 'normal' && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedMessage.priority)}`}>
                          {selectedMessage.priority} priority
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetailModal(selectedMessage)}
                      className="text-sm bg-brand-blue text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      🔍 View Details
                    </button>
                    <button
                      onClick={() => exportToPDF(selectedMessage)}
                      className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                    >
                      📄 Export PDF
                    </button>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${selectedMessage.message_type === 'feedback' ? 'bg-green-100 text-green-800' : 
                      selectedMessage.message_type === 'homework' ? 'bg-blue-100 text-blue-800' : 
                      selectedMessage.message_type === 'appointment' ? 'bg-purple-100 text-purple-800' : 
                      selectedMessage.message_type === 'welcome' ? 'bg-yellow-100 text-yellow-800' : 
                      selectedMessage.message_type === 'onboarding_welcome' ? 'bg-teal-100 text-teal-800' : 
                      selectedMessage.message_type === 'onboarding_reminder' ? 'bg-orange-100 text-orange-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getMessageTypeIcon(selectedMessage.message_type)} {selectedMessage.message_type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-6">
                <MarkdownRenderer 
                  content={selectedMessage.content}
                  className="text-gray-800 leading-relaxed"
                />
                
                {((selectedMessage.has_read_receipt && selectedMessage.read_at) || selectedMessage.is_read) && selectedMessage.read_at && (
                  <div className="mt-6 pt-4 border-t text-xs text-gray-500">
                    Read on {new Date(selectedMessage.read_at).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📨</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a message</h3>
              <p className="text-gray-600">Choose a message from the list to view its contents</p>
            </div>
          )}
        </div>
      </div>

      <MessageDetailModal
        message={selectedMessage}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
};

export default MessageInbox;
