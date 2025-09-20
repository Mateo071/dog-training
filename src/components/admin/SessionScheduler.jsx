import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';

const SessionScheduler = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  
  const [clients, setClients] = useState([]);
  const [selectedClientDogs, setSelectedClientDogs] = useState([]);
  const [clientMessages, setClientMessages] = useState([]);
  const [messagesByType, setMessagesByType] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    clientId: '',
    dogId: '',
    sessionType: 'training',
    scheduledDate: '',
    scheduledTime: '',
    durationMinutes: 60,
    notes: '',
    relevantHomework: ''
  });

  useEffect(() => {
    if (isAdmin) {
      loadClients();
      if (id) {
        setIsEditing(true);
        loadSession(id);
      }
    }
  }, [id]);

  const loadClients = async () => {
    try {
      const { data, error } = await db.supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          dogs(id, name, breed)
        `)
        .eq('role', 'client')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      showAlertMessage('Failed to load clients', 'error');
    }
  };

  const loadClientMessages = async (clientId) => {
    try {
      const { data, error } = await db.supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', clientId)
        .eq('status', 'sent')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setClientMessages(data || []);
      
      // Organize messages by type
      const messageTypes = {};
      (data || []).forEach(message => {
        const type = message.message_type || 'general';
        if (!messageTypes[type]) {
          messageTypes[type] = [];
        }
        messageTypes[type].push(message);
      });
      
      setMessagesByType(messageTypes);
    } catch (error) {
      console.error('Error loading client messages:', error);
      // Don't show error to user as this is supplementary functionality
    }
  };

  const loadSession = async (sessionId) => {
    try {
      setLoading(true);
      const { data, error } = await db.supabase
        .from('sessions_with_details')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      if (data) {
        const sessionDate = new Date(data.scheduled_date);
        setFormData({
          clientId: data.client_id,
          dogId: data.dog_id,
          sessionType: data.session_type,
          scheduledDate: sessionDate.toISOString().split('T')[0],
          scheduledTime: sessionDate.toTimeString().slice(0, 5),
          durationMinutes: data.duration_minutes,
          notes: data.notes || '',
          relevantHomework: data.homework_assigned || ''
        });

        // Load dogs for the selected client
        handleClientChange(data.client_id);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      showAlertMessage('Failed to load session details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (clientId) => {
    setFormData(prev => ({ ...prev, clientId, dogId: '', relevantHomework: '' }));
    
    const selectedClient = clients.find(c => c.id === clientId);
    if (selectedClient) {
      setSelectedClientDogs(selectedClient.dogs || []);
      loadClientMessages(clientId);
    } else {
      setSelectedClientDogs([]);
      setClientMessages([]);
      setMessagesByType({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.dogId || !formData.scheduledDate || !formData.scheduledTime) {
      showAlertMessage('Please fill in all required fields', 'error');
      return;
    }

    try {
      setSaving(true);

      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      const sessionData = {
        dog_id: formData.dogId,
        scheduled_date: scheduledDateTime.toISOString(),
        duration_minutes: parseInt(formData.durationMinutes),
        session_type: formData.sessionType,
        notes: formData.notes,
        homework_assigned: formData.relevantHomework,
        updated_at: new Date().toISOString()
      };

      let result;
      if (isEditing) {
        result = await db.supabase
          .from('sessions')
          .update(sessionData)
          .eq('id', id);
      } else {
        sessionData.status = 'scheduled';
        result = await db.supabase
          .from('sessions')
          .insert([sessionData]);
      }

      if (result.error) throw result.error;

      showAlertMessage(
        `Session ${isEditing ? 'updated' : 'scheduled'} successfully!`, 
        'success'
      );

      // Send email notification to client
      await sendSessionNotification(formData.clientId, sessionData, isEditing);

      setTimeout(() => {
        navigate('/dashboard/sessions');
      }, 2000);

    } catch (error) {
      console.error('Error saving session:', error);
      showAlertMessage(`Failed to ${isEditing ? 'update' : 'schedule'} session`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const sendSessionNotification = async (clientId, sessionData, isUpdate = false) => {
    try {
      // Get current user (admin) info
      const { data: { user } } = await db.supabase.auth.getUser();
      if (!user) return;

      // Get admin profile info (we need the profile ID, not user ID for foreign key)
      const { data: adminProfile } = await db.supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!adminProfile) {
        console.error('Admin profile not found for user:', user.id);
        return;
      }

      // Get client info
      const { data: clientData } = await db.supabase
        .from('profiles')
        .select('first_name, users(email)')
        .eq('id', clientId)
        .single();

      if (!clientData?.users?.email) return;

      // Get dog info
      const { data: dogData } = await db.supabase
        .from('dogs')
        .select('name')
        .eq('id', formData.dogId)
        .single();

      const sessionDate = new Date(sessionData.scheduled_date);
      const subject = isUpdate 
        ? `Training Session Updated - ${dogData?.name}`
        : `Training Session Scheduled - ${dogData?.name}`;

      const content = `Hi ${clientData.first_name},

${isUpdate ? 'Your training session has been updated:' : 'A new training session has been scheduled:'}

**Session Details:**
- Dog: ${dogData?.name}
- Type: ${sessionData.session_type}
- Date: ${sessionDate.toLocaleDateString()}
- Time: ${sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
- Duration: ${sessionData.duration_minutes} minutes

${sessionData.notes ? `**Notes:** ${sessionData.notes}` : ''}

Please log into your client portal to view more details or contact us if you need to reschedule.

Best regards,
Flores Dog Training`;

      // Generate a simple UUID alternative if crypto.randomUUID is not available
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const messageData = {
        recipient_id: clientId,
        sender_id: adminProfile.id, // Use admin profile ID instead of user ID
        subject,
        content,
        message_type: 'appointment',
        priority: 'normal',
        scheduled_for: null,
        status: 'sent',
        thread_id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : generateUUID(),
        is_read: false
      };

      console.log('Inserting message data:', messageData);

      const { error } = await db.supabase
        .from('messages')
        .insert([messageData]);

      if (error) {
        console.error('Message insertion error:', error);
        throw error;
      }

    } catch (error) {
      console.error('Error sending session notification:', error);
      // Don't throw the error to prevent session creation from failing
    }
  };

  const showAlertMessage = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const getMessageTypeDisplayName = (type) => {
    const typeNames = {
      general: 'General',
      feedback: 'Session Feedback',
      homework: 'Homework Assignment',
      appointment: 'Appointment Related',
      welcome: 'Welcome Message',
      onboarding_welcome: 'Onboarding Welcome',
      onboarding_reminder: 'Onboarding Reminder',
      reminder: 'Reminder'
    };
    return typeNames[type] || type;
  };

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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showAlert && (
        <Alert
          message={alertMessage}
          type={alertType}
          onClose={() => setShowAlert(false)}
        />
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {isEditing ? 'Edit Training Session' : 'Schedule New Training Session'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Selection */}
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700">
                Client *
              </label>
              <select
                id="client"
                value={formData.clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dog Selection */}
            <div>
              <label htmlFor="dog" className="block text-sm font-medium text-gray-700">
                Dog *
              </label>
              <select
                id="dog"
                value={formData.dogId}
                onChange={(e) => setFormData(prev => ({ ...prev, dogId: e.target.value }))}
                required
                disabled={!formData.clientId}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select a dog</option>
                {selectedClientDogs.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name} ({dog.breed})
                  </option>
                ))}
              </select>
            </div>

            {/* Session Type */}
            <div>
              <label htmlFor="sessionType" className="block text-sm font-medium text-gray-700">
                Session Type *
              </label>
              <select
                id="sessionType"
                value={formData.sessionType}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionType: e.target.value }))}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="evaluation">Initial Evaluation</option>
                <option value="training">Training Session</option>
                <option value="follow-up">Follow-up Session</option>
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  Time *
                </label>
                <input
                  type="time"
                  id="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration (minutes)
              </label>
              <select
                id="duration"
                value={formData.durationMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Session Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any specific notes or preparation instructions for this session..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Relevant Homework */}
            <div>
              <label htmlFor="relevantHomework" className="block text-sm font-medium text-gray-700">
                Relevant Homework
              </label>
              <select
                id="relevantHomework"
                value={formData.relevantHomework}
                onChange={(e) => setFormData(prev => ({ ...prev, relevantHomework: e.target.value }))}
                disabled={!formData.clientId}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">
                  {!formData.clientId 
                    ? 'Select a client first...' 
                    : clientMessages.length === 0 
                      ? 'No messages found for this client'
                      : 'Select relevant homework/message...'
                  }
                </option>
                {Object.entries(messagesByType)
                  .sort(([a], [b]) => {
                    // Prioritize homework messages, then other types alphabetically
                    if (a === 'homework' && b !== 'homework') return -1;
                    if (b === 'homework' && a !== 'homework') return 1;
                    return getMessageTypeDisplayName(a).localeCompare(getMessageTypeDisplayName(b));
                  })
                  .map(([messageType, messages]) => (
                    <optgroup key={messageType} label={getMessageTypeDisplayName(messageType)}>
                      {messages.map((message) => (
                        <option key={message.id} value={message.id}>
                          {new Date(message.created_at).toLocaleDateString()} - {message.subject}
                        </option>
                      ))}
                    </optgroup>
                  ))
                }
              </select>
              {formData.relevantHomework && (() => {
                const selectedMessage = clientMessages.find(m => m.id === formData.relevantHomework);
                return selectedMessage && (
                  <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="text-xs text-gray-500 mb-1">
                      <strong>Selected Message Preview:</strong>
                    </div>
                    <div className="text-sm text-gray-700">
                      <div className="font-medium mb-1">{selectedMessage.subject}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        {getMessageTypeDisplayName(selectedMessage.message_type)} • {new Date(selectedMessage.created_at).toLocaleString()}
                      </div>
                      <div className="max-h-20 overflow-y-auto text-xs">
                        {selectedMessage.content.substring(0, 200)}
                        {selectedMessage.content.length > 200 && '...'}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard/sessions')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : (isEditing ? 'Update Session' : 'Schedule Session')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SessionScheduler;