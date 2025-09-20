import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';
import MarkdownRenderer from '../content/MarkdownRenderer';

const MessageComposer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin, profile } = useAuth();
  
  // Determine where to go back based on the 'from' parameter or default to messages
  const backPath = searchParams.get('from') || '/dashboard/messages';
  const backText = backPath.includes('clients') ? 'Back to Client Management' : 'Back to Messages';
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    recipientIds: [],
    subject: '',
    content: '',
    messageType: 'general',
    priority: 'normal',
    scheduledFor: ''
  });
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadClients();
      loadTemplates();
      
      // Pre-select recipient if provided in URL
      const recipientId = searchParams.get('recipient');
      if (recipientId) {
        setFormData(prev => ({
          ...prev,
          recipientIds: [recipientId]
        }));
      }
    }
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await db.getActiveClients();

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Error loading clients:', err);
      showMessage('Failed to load client list', 'danger');
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await db.getMessageTemplates();
      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const showMessage = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecipientChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      recipientIds: checked 
        ? [...prev.recipientIds, value]
        : prev.recipientIds.filter(id => id !== value)
    }));
  };

  const selectAllClients = () => {
    const clientsToSelect = showCompletedOnly 
      ? clients.filter(client => client.profile_completed)
      : clients;
    setFormData(prev => ({
      ...prev,
      recipientIds: clientsToSelect.map(client => client.id)
    }));
  };

  const clearAllClients = () => {
    setFormData(prev => ({
      ...prev,
      recipientIds: []
    }));
  };

  const applyTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      subject: template.subject,
      content: template.content,
      messageType: template.template_type
    }));
  };

  const personalizeContent = (content, client) => {
    return content
      .replace(/\{client_name\}/g, client.first_name)
      .replace(/\{dog_name\}/g, '{dog_name}') // This would be replaced with actual dog names in production
      .replace(/\{full_name\}/g, `${client.first_name} ${client.last_name}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.recipientIds.length === 0) {
      showMessage('Please select at least one recipient', 'danger');
      return;
    }

    if (!formData.subject.trim() || !formData.content.trim()) {
      showMessage('Subject and message content are required', 'danger');
      return;
    }

    setLoading(true);

    try {
      const sendDate = formData.scheduledFor 
        ? new Date(formData.scheduledFor).toISOString()
        : new Date().toISOString();

      // Create messages for each recipient
      const messagePromises = formData.recipientIds.map(async (recipientId) => {
        const client = clients.find(c => c.id === recipientId);
        const personalizedContent = personalizeContent(formData.content, client);
        
        const messageData = {
          recipient_id: recipientId,
          sender_id: profile.id,
          subject: formData.subject,
          content: personalizedContent,
          message_type: formData.messageType,
          priority: formData.priority,
          scheduled_for: formData.scheduledFor ? sendDate : null,
          status: formData.scheduledFor ? 'scheduled' : 'sent',
          thread_id: crypto.randomUUID(), // Generate unique thread ID
          is_read: false
        };

        const { error } = await db.createMessage(messageData);
        if (error) throw error;
      });

      await Promise.all(messagePromises);

      const recipientCount = formData.recipientIds.length;
      const isScheduled = formData.scheduledFor;
      
      showMessage(
        `${isScheduled ? 'Scheduled' : 'Sent'} ${recipientCount} message${recipientCount > 1 ? 's' : ''} successfully!`,
        'success'
      );

      // Clear form
      setFormData({
        recipientIds: [],
        subject: '',
        content: '',
        messageType: 'general',
        priority: 'normal',
        scheduledFor: ''
      });

      // Redirect back to previous page after 2 seconds
      setTimeout(() => {
        navigate(backPath);
      }, 2000);

    } catch (err) {
      console.error('Error sending messages:', err);
      showMessage('Failed to send messages. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {showAlert && (
        <Alert show={true} text={alertMessage} type={alertType} />
      )}

      <div className="mb-8">
        <button
          onClick={() => navigate(backPath)}
          className="text-brand-blue hover:underline mb-4 inline-block"
        >
          ← {backText}
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Compose Message</h1>
        <p className="text-gray-600 mt-2">Send training updates, homework, or general messages to your clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            {/* Recipients */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Recipients ({formData.recipientIds.length} selected)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllClients}
                    className="text-xs text-brand-blue hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllClients}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              
              {/* Filter Toggle */}
              <div className="mb-3 flex items-center gap-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCompletedOnly}
                    onChange={(e) => setShowCompletedOnly(e.target.checked)}
                    className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">Show only clients with completed profiles</span>
                </label>
              </div>
              
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                {(() => {
                  const displayClients = showCompletedOnly 
                    ? clients.filter(client => client.profile_completed)
                    : clients;
                  
                  if (displayClients.length === 0) {
                    return (
                      <p className="text-gray-500 text-sm">
                        {showCompletedOnly 
                          ? 'No clients with completed profiles found'
                          : 'No active clients found'
                        }
                      </p>
                    );
                  }
                  
                  return displayClients.map((client) => (
                    <label key={client.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        value={client.id}
                        checked={formData.recipientIds.includes(client.id)}
                        onChange={handleRecipientChange}
                        className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
                      />
                      <div className="flex items-center space-x-1 flex-1">
                        {client.profile_completed ? (
                          <span className="text-green-600 text-sm" title="Profile completed">
                            ✅
                          </span>
                        ) : (
                          <span className="text-orange-500 text-sm" title={`Onboarding step ${client.onboarding_step || 0}/5 - Profile incomplete`}>
                            🕐
                          </span>
                        )}
                        <span className="text-sm text-gray-900">
                          {client.first_name} {client.last_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({client.users.email})
                        </span>
                      </div>
                    </label>
                  ));
                })()}
              </div>
            </div>

            {/* Message Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="messageType" className="block text-sm font-medium text-gray-700 mb-1">
                  Message Type
                </label>
                <select
                  id="messageType"
                  name="messageType"
                  value={formData.messageType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                >
                  <option value="general">General</option>
                  <option value="feedback">Session Feedback</option>
                  <option value="homework">Homework Assignment</option>
                  <option value="appointment">Appointment Related</option>
                  <option value="welcome">Welcome Message</option>
                  <option value="onboarding_welcome">Onboarding Welcome</option>
                  <option value="onboarding_reminder">Onboarding Reminder</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Enter message subject..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Message Content *
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      !showPreview 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    ✏️ Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      showPreview 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    👁️ Preview
                  </button>
                </div>
              </div>
              
              {!showPreview ? (
                <textarea
                  id="content"
                  name="content"
                  required
                  rows="12"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your message here using Markdown formatting...

**Bold text** and *italic text*
# Headers
- Bullet points
```code blocks```
[Links](https://example.com)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue font-mono"
                />
              ) : (
                <div className="min-h-[300px] w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <div className="bg-white rounded p-4 min-h-[280px]">
                    {formData.content ? (
                      <MarkdownRenderer 
                        content={formData.content}
                        className="text-gray-800"
                      />
                    ) : (
                      <p className="text-gray-500 italic">Preview will appear here as you type...</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Supports Markdown formatting. Use placeholders: {'{client_name}'}, {'{full_name}'}, {'{dog_name}'}
                </p>
                <p className="text-xs text-gray-400">
                  {formData.content.length} characters
                </p>
              </div>
            </div>

            {/* Scheduling */}
            <div>
              <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700 mb-1">
                Schedule for Later (Optional)
              </label>
              <input
                type="datetime-local"
                id="scheduledFor"
                name="scheduledFor"
                value={formData.scheduledFor}
                onChange={handleInputChange}
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>

            {/* Warning for incomplete clients */}
            {(() => {
              const incompleteRecipients = formData.recipientIds.filter(id => {
                const client = clients.find(c => c.id === id);
                return client && !client.profile_completed;
              });
              
              if (incompleteRecipients.length > 0) {
                const incompleteNames = incompleteRecipients.map(id => {
                  const client = clients.find(c => c.id === id);
                  return `${client.first_name} ${client.last_name}`;
                }).join(', ');
                
                return (
                  <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mt-4">
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-2">⚠️</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-orange-800 mb-1">
                          Messaging Incomplete Profiles
                        </h4>
                        <p className="text-sm text-orange-700 mb-2">
                          {incompleteRecipients.length === 1 
                            ? `${incompleteNames} has not completed their profile setup` 
                            : `${incompleteRecipients.length} recipients have not completed their profile setup: ${incompleteNames}`
                          }
                        </p>
                        <p className="text-xs text-orange-600">
                          These clients may not have full access to features or may be in the onboarding process.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(backPath)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || formData.recipientIds.length === 0}
                className="flex-1 bg-gradient-to-r from-brand-blue to-brand-teal text-white py-2 px-6 rounded-md hover:from-brand-blue-dark hover:to-brand-teal-dark focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {formData.scheduledFor ? 'Scheduling...' : 'Sending...'}
                  </div>
                ) : (
                  `${formData.scheduledFor ? 'Schedule' : 'Send'} Message${formData.recipientIds.length > 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar - Templates */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Message Templates</h3>
              <button
                type="button"
                onClick={() => navigate('/admin/templates')}
                className="text-xs text-brand-blue hover:underline"
              >
                Manage
              </button>
            </div>
            {templates.length === 0 ? (
              <div>
                <p className="text-gray-500 text-sm mb-2">No templates available</p>
                <button
                  type="button"
                  onClick={() => navigate('/admin/templates')}
                  className="text-sm text-brand-blue hover:underline"
                >
                  Create your first template →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="w-full text-left p-3 border border-gray-200 rounded-md hover:border-brand-blue hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-sm text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Type: {template.template_type}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use templates to save time</li>
              <li>• Personalize messages with placeholders</li>
              <li>• Set priority for urgent messages</li>
              <li>• Schedule messages for optimal timing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageComposer;