import React, { useState, useEffect } from 'react';
import { db } from '../../lib/supabase';
import BackToDashboard from '../ui/BackToDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtimeContactSubmissions, useNotificationPermission } from '../../hooks/useRealtime';
import Alert from '../ui/Alert';

const ContactSubmissions = () => {
  const { isAdmin } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ERROR, setError] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState(['new']);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteClientData, setDeleteClientData] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [clientProfileExists, setClientProfileExists] = useState(false);
  
  // Real-time features
  const { newSubmissions } = useRealtimeContactSubmissions();
  const { permission, requestPermission } = useNotificationPermission();

  useEffect(() => {
    if (isAdmin) {
      loadSubmissions();
    }
  }, [isAdmin]);

  // Request notification permission
  useEffect(() => {
    if (permission === 'default' && isAdmin) {
      requestPermission();
    }
  }, [permission, requestPermission, isAdmin]);

  // Handle new real-time submissions
  useEffect(() => {
    if (newSubmissions.length > 0) {
      setSubmissions(prev => {
        const newSubs = newSubmissions.filter(
          newSub => !prev.some(existingSub => existingSub.id === newSub.id)
        );
        return [...newSubs, ...prev];
      });
    }
  }, [newSubmissions]);

  const loadSubmissions = async () => {
    try {
      const { data, error } = await db.getContactSubmissions();
      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (submission, newStatus) => {
    console.log('handleStatusChange called:', { submissionId: submission.id, currentStatus: submission.status, newStatus });
    
    if (newStatus === 'converted') {
      setSelectedSubmission(submission);
      setShowConvertModal(true);
    } else if (submission.status === 'converted' && newStatus !== 'converted') {
      // Converting FROM converted to something else - check if client profile exists
      try {
        const { data: profileCheck, error } = await db.checkContactHasClientProfile(submission.id);
        if (error) throw error;
        
        console.log('Profile check result:', profileCheck);
        
        if (profileCheck.hasProfile) {
          // Show deactivation modal with client data deletion option
          setSelectedSubmission({ ...submission, newStatus, profileData: profileCheck.profileData });
          setClientProfileExists(true);
          setShowDeactivateModal(true);
        } else {
          // Show simple invitation cancellation modal
          setSelectedSubmission({ ...submission, newStatus });
          setClientProfileExists(false);
          setShowInvitationModal(true);
        }
      } catch (err) {
        console.error('Error checking client profile:', err);
        // Fallback to simple status update
        updateSubmissionStatus(submission.id, newStatus);
      }
    } else {
      updateSubmissionStatus(submission.id, newStatus);
    }
  };

  const confirmConversion = async () => {
    if (!selectedSubmission) return;
    
    setShowConvertModal(false);
    await updateSubmissionStatus(selectedSubmission.id, 'converted');
    setSelectedSubmission(null);
  };

  const confirmDeactivation = async () => {
    if (!selectedSubmission) return;
    
    setShowDeactivateModal(false);
    
    if (deleteClientData) {
      // Permanently delete the client and all their data
      await deleteClientCompletely(selectedSubmission.email);
      setAlertMessage('Client and all associated data have been permanently deleted.');
    } else {
      // Just deactivate the client
      await deactivateClient(selectedSubmission.email);
      setAlertMessage('Client has been deactivated and removed from Client Management.');
    }
    
    await updateSubmissionStatus(selectedSubmission.id, selectedSubmission.newStatus);
    setSelectedSubmission(null);
    setDeleteClientData(false); // Reset the checkbox
    setClientProfileExists(false);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const confirmInvitationCancellation = async () => {
    if (!selectedSubmission) return;
    
    setShowInvitationModal(false);
    // Simply update the status - no client data to worry about
    await updateSubmissionStatus(selectedSubmission.id, selectedSubmission.newStatus);
    setSelectedSubmission(null);
    setAlertMessage('Contact status updated. Signup invitation remains valid until expiration.');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const deactivateClient = async (email) => {
    try {
      const { error } = await db.deactivateClientByEmail(email);
      if (error) throw error;
    } catch (err) {
      console.error('Error deactivating client:', err);
      setError(err.message);
    }
  };

  const deleteClientCompletely = async (email) => {
    try {
      console.log('deleteClientCompletely called with:', { email, submission: selectedSubmission });
      const { error } = await db.deleteClientCompletely(email);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting client:', err);
      setError(err.message);
    }
  };

  const updateSubmissionStatus = async (id, status) => {
    console.log('updateSubmissionStatus called:', { id, status });
    
    try {
      // If converting to client, immediately create the client account
      if (status === 'converted') {
        console.log('Converting contact to client, ID:', id);
        const response = await db.convertContactToClient(id);
        console.log('Conversion response:', response);
        
        if (response.error) throw response.error;
        
        // Handle the response - it might be wrapped differently
        const clientData = response.data || response;
        console.log('Client data:', clientData);
        
        if (clientData && clientData.tempPassword) {
          const clientName = clientData.submissionData 
            ? `${clientData.submissionData.first_name} ${clientData.submissionData.last_name}`
            : 'the client';
          
          // Check if this was an existing user
          if (clientData.tempPassword === 'User already exists - password not changed') {
            setAlertMessage(
              `✅ Contact submission linked to existing client account for ${clientName}!

` +
              `The existing client account for ${clientData.email} has been linked to this contact submission.
` +
              `The client can use their existing login credentials.`
            );
          } else {
            // Create login credentials message for new user
            const loginCredentials = `Email: ${clientData.email}\nPassword: ${clientData.tempPassword}\nLogin URL: ${clientData.loginUrl}`;
            
            try {
              await navigator.clipboard.writeText(loginCredentials);
              setAlertMessage(
                `✅ Client account created immediately for ${clientName}!

` +
                `Login credentials have been copied to your clipboard:
` +
                `Email: ${clientData.email}
` +
                `Temporary Password: ${clientData.tempPassword}

` +
                `The client will appear in Client Management with an incomplete profile status. ` +
                `They can log in and complete their onboarding process.`
              );
            } catch (clipboardError) {
              console.error('Clipboard error:', clipboardError);
              setAlertMessage(
                `✅ Client account created immediately for ${clientName}!

` +
                `Login credentials:
` +
                `Email: ${clientData.email}
` +
                `Temporary Password: ${clientData.tempPassword}
` +
                `Login URL: ${clientData.loginUrl}

` +
                `The client will appear in Client Management with an incomplete profile status.`
              );
            }
          }
        } else {
          console.warn('No tempPassword in response:', clientData);
          const clientName = clientData && clientData.submissionData 
            ? `${clientData.submissionData.first_name} ${clientData.submissionData.last_name}`
            : 'the client';
          setAlertMessage(`Client account processed for ${clientName}. They will appear in Client Management.`);
        }
        
        // Update the local state to reflect the converted status
        setSubmissions(prev => 
          prev.map(sub => sub.id === id ? { ...sub, status: 'converted' } : sub)
        );
        
        // Reload submissions to ensure we have the latest data
        loadSubmissions();
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 10000); // Show for longer due to more info
        return;
      } else if (status === 'removed') {
        setAlertMessage('Submission has been removed');
      } else {
        setAlertMessage('Status updated successfully');
      }
      
      console.log('About to call db.updateContactSubmission:', { id, status });
      const { error } = await db.updateContactSubmission(id, { status });
      console.log('db.updateContactSubmission result:', { error });
      
      if (error) throw error;
      
      setSubmissions(prev => 
        prev.map(sub => sub.id === id ? { ...sub, status } : sub)
      );
      
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } catch (err) {
      console.error('Error updating submission status:', err);
      setError(err.message);
    }
  };

  const handleSelectForDeletion = (submissionId, isSelected) => {
    if (isSelected) {
      setSelectedForDeletion(prev => [...prev, submissionId]);
    } else {
      setSelectedForDeletion(prev => prev.filter(id => id !== submissionId));
    }
  };


  const handlePermanentDelete = async () => {
    try {
      const { error } = await db.deleteContactSubmissions(selectedForDeletion);
      if (error) throw error;
      
      setSubmissions(prev => 
        prev.filter(sub => !selectedForDeletion.includes(sub.id))
      );
      
      setSelectedForDeletion([]);
      setShowDeleteModal(false);
      setAlertMessage(`${selectedForDeletion.length} submission${selectedForDeletion.length > 1 ? 's' : ''} permanently deleted`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } catch (err) {
      console.error('Error deleting submissions:', err);
      setError(err.message);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    return selectedFilters.includes(sub.status);
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'removed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {showAlert && (
        <Alert show={true} text={alertMessage} type="success" />
      )}
      
      <div className="mb-8">
        <BackToDashboard />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Submissions</h1>
        <p className="text-gray-600">Manage incoming evaluation requests and client inquiries</p>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap gap-2">
            {['new', 'contacted'].map((status) => {
              const isSelected = selectedFilters.includes(status);
              const count = submissions.filter(s => s.status === status).length;
              
              return (
                <button
                  key={status}
                  onClick={() => {
                    // If clicking converted or removed tab, deselect others first
                    if (selectedFilters.includes('converted') || selectedFilters.includes('removed')) {
                      setSelectedFilters([status]);
                    } else {
                      if (isSelected) {
                        setSelectedFilters(prev => prev.filter(f => f !== status));
                      } else {
                        setSelectedFilters(prev => [...prev, status]);
                      }
                    }
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${ 
                    isSelected 
                      ? 'bg-brand-blue text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </button>
              );
            })}
          </div>
          
          <div className="flex gap-2">
            {(() => {
              const isSelected = selectedFilters.includes('converted');
              const count = submissions.filter(s => s.status === 'converted').length;
              
              return (
                <button
                  onClick={() => {
                    if (isSelected) {
                      setSelectedFilters(['new']);
                    } else {
                      setSelectedFilters(['converted']);
                    }
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${ 
                    isSelected 
                      ? 'bg-brand-teal text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Converted ({count})
                </button>
              );
            })()}
            
            {(() => {
              const isSelected = selectedFilters.includes('removed');
              const count = submissions.filter(s => s.status === 'removed').length;
              
              return (
                <button
                  onClick={() => {
                    if (isSelected) {
                      setSelectedFilters(['new']);
                    } else {
                      setSelectedFilters(['removed']);
                    }
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${ 
                    isSelected 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Removed ({count})
                </button>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Delete Selected Button - Only show in removed tab when selections exist */}
      {selectedFilters.includes('removed') && selectedFilters.length === 1 && selectedForDeletion.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {selectedForDeletion.length} submission{selectedForDeletion.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Permanently Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📝</div>
            <p className="text-gray-500">No submissions found</p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => {
            const isRemovedTab = selectedFilters.includes('removed') && selectedFilters.length === 1;
            const isSelected = selectedForDeletion.includes(submission.id);
            
            return (
              <div key={submission.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      {/* Checkbox for removed tab only */}
                      {isRemovedTab && submission.status === 'removed' && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectForDeletion(submission.id, e.target.checked)}
                          className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {submission.first_name} {submission.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Submitted {new Date(submission.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📧 {submission.email}</p>
                      <p>📞 {submission.phone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">🐕 Dog Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {submission.dog_name}</p>
                      <p><strong>Breed:</strong> {submission.dog_breed}</p>
                      <p><strong>Sex:</strong> {submission.dog_sex ? submission.dog_sex.charAt(0).toUpperCase() + submission.dog_sex.slice(1) : 'Not specified'}</p>
                      <p><strong>Age:</strong> {calculateAge(submission.dog_birth_date)}</p>
                    </div>
                  </div>
                </div>

                {submission.message && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                      {submission.message}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <select
                    value={submission.status}
                    onChange={(e) => handleStatusChange(submission, e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    disabled={submission.status === 'removed'}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                  </select>
                  
                  <a
                    href={`mailto:${submission.email}?subject=Re: Your Dog Training Inquiry&body=Hi ${submission.first_name},%0D%0A%0D%0AThank you for your interest in our training programs for ${submission.dog_name}!`}
                    className="text-sm bg-brand-blue text-white px-4 py-1 rounded-md hover:bg-brand-blue-dark transition-colors"
                  >
                    Email
                  </a>
                  
                  <a
                    href={`tel:${submission.phone}`}
                    className="text-sm bg-brand-teal text-white px-4 py-1 rounded-md hover:bg-brand-teal-dark transition-colors"
                  >
                    Call
                  </a>
                  
                  <div className="ml-auto">
                    {submission.status === 'removed' ? (
                      <button
                        onClick={() => handleStatusChange(submission, 'new')}
                        className="text-sm bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(submission, 'removed')}
                        className="text-sm bg-red-600 text-white px-4 py-1 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Conversion Confirmation Modal */}
      {showConvertModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Convert to Client?
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to convert <strong>{selectedSubmission.first_name} {selectedSubmission.last_name}</strong> to a client? 
              This will:
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• Immediately create a client account with temporary password</li>
              <li>• Client will appear in Client Management as "Incomplete"</li>
              <li>• Copy login credentials to your clipboard to send to them</li>
              <li>• Client can log in and complete their profile setup</li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConvertModal(false);
                  setSelectedSubmission(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmConversion}
                className="flex-1 bg-gradient-to-r from-brand-blue to-brand-teal text-white px-4 py-2 rounded-md hover:from-brand-blue-dark hover:to-brand-teal-dark focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 font-medium"
              >
                Convert to Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivation Confirmation Modal */}
      {showDeactivateModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              ⚠️ Deactivate Client?
            </h3>
            <p className="text-gray-600 mb-4">
              Changing <strong>{selectedSubmission.first_name} {selectedSubmission.last_name}</strong> from "Converted" will:
            </p>
            
            {/* Only show delete option if client profile exists */}
            {clientProfileExists && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={deleteClientData}
                    onChange={(e) => setDeleteClientData(e.target.checked)}
                    className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <div className="text-sm">
                    <span className="font-medium text-red-600">Permanently delete all client data</span>
                    <p className="text-gray-600 mt-1">
                      This will permanently delete their profile, dogs, sessions, messages, and all associated data. This action cannot be undone.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {clientProfileExists ? (
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                {deleteClientData ? (
                  <>
                    <li>• <strong className="text-red-600">Permanently delete client account and all data</strong></li>
                    <li>• <strong className="text-red-600">Delete all dogs, sessions, messages, and training history</strong></li>
                    <li>• <strong className="text-red-600">This action cannot be undone</strong></li>
                  </>
                ) : (
                  <>
                    <li>• <strong>Deactivate their client account</strong></li>
                    <li>• Remove them from Client Management</li>
                    <li>• Preserve all client data and training history</li>
                    <li>• This will require manual reactivation if needed</li>
                  </>
                )}
                <li>• Change contact status to "{selectedSubmission.newStatus}"</li>
              </ul>
            ) : (
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>• This contact has not completed signup yet</li>
                <li>• No client profile exists to deactivate</li>
                <li>• Signup invitation will remain valid until expiration</li>
                <li>• Change contact status to "{selectedSubmission.newStatus}"</li>
              </ul>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  setSelectedSubmission(null);
                  setDeleteClientData(false); // Reset checkbox
                  setClientProfileExists(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeactivation}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium"
              >
                {deleteClientData ? 'Delete Client Data' : 'Deactivate Client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              ⚠️ Permanently Delete Submissions?
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to permanently delete {selectedForDeletion.length} submission{selectedForDeletion.length > 1 ? 's' : ''}?
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• <strong>This action cannot be undone</strong></li>
              <li>• All submission data will be permanently removed</li>
              <li>• Contact information and messages will be lost forever</li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedForDeletion([]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invitation Cancellation Modal (for contacts without client profiles) */}
      {showInvitationModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Change Contact Status?
            </h3>
            <p className="text-gray-600 mb-4">
              <strong>{selectedSubmission.first_name} {selectedSubmission.last_name}</strong> was marked as converted but hasn\'t completed their signup yet.
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• No client profile has been created yet</li>
              <li>• Their signup invitation will remain active until expiration</li>
              <li>• Contact status will change to "{selectedSubmission.newStatus}"</li>
              <li>• They can still use the signup link if they have it</li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInvitationModal(false);
                  setSelectedSubmission(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmInvitationCancellation}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
              >
                Change Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactSubmissions;
