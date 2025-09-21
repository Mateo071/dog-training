import React, { useState, useEffect } from 'react';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../ui/Alert';
import MarkdownRenderer from '../content/MarkdownRenderer';
import BackToDashboard from '../ui/BackToDashboard';

const MessageTemplates = () => {
  const { isAdmin } = useAuth();
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    template_type: 'general',
    is_active: true
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadTemplates();
    }
  }, [isAdmin]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await db.getAllMessageTemplates();
      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
      showMessage('Failed to load templates', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      template_type: template.template_type,
      is_active: template.is_active
    });
    setShowForm(true);
  };

  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;

    try {
      const { error } = await db.deleteMessageTemplate(templateToDelete.id);
      if (error) throw error;
      showMessage('Template deleted successfully', 'success');
      loadTemplates();
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    } catch (err) {
      console.error('Error deleting template:', err);
      showMessage('Failed to delete template', 'danger');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.subject.trim() || !formData.content.trim()) {
      showMessage('Name, subject, and content are required', 'danger');
      return;
    }

    try {
      const templateData = {
        name: formData.name,
        subject: formData.subject,
        content: formData.content,
        template_type: formData.template_type,
        is_active: formData.is_active
      };

      if (editingTemplate) {
        const { error } = await db.updateMessageTemplate(editingTemplate.id, templateData);
        if (error) throw error;
        showMessage('Template updated successfully', 'success');
      } else {
        const { error } = await db.createMessageTemplate(templateData);
        if (error) throw error;
        showMessage('Template created successfully', 'success');
      }

      setShowForm(false);
      setEditingTemplate(null);
      resetForm();
      loadTemplates();
    } catch (err) {
      console.error('Error saving template:', err);
      showMessage('Failed to save template', 'danger');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      template_type: 'general',
      is_active: true
    });
    setEditingTemplate(null);
  };

  const cancelEdit = () => {
    setShowForm(false);
    resetForm();
  };

  const toggleActive = async (template) => {
    try {
      const { error } = await db.updateMessageTemplate(template.id, {
        is_active: !template.is_active
      });
      if (error) throw error;
      showMessage(`Template ${template.is_active ? 'deactivated' : 'activated'} successfully`, 'success');
      loadTemplates();
    } catch (err) {
      console.error('Error toggling template status:', err);
      showMessage('Failed to update template status', 'danger');
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
    <div className="max-w-6xl mx-auto py-8 px-4">
      {showAlert && (
        <Alert show={true} text={alertMessage} type={alertType} />
      )}

      <div className="mb-8">
        <BackToDashboard />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Message Templates</h1>
            <p className="text-gray-600 mt-2">Create and manage reusable message templates</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-brand-blue to-brand-teal text-white px-6 py-2 rounded-md hover:from-brand-blue-dark hover:to-brand-teal-dark focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 font-medium"
            >
              + New Template
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Welcome Message, Session Reminder"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>

              <div>
                <label htmlFor="template_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Template Type
                </label>
                <select
                  id="template_type"
                  name="template_type"
                  value={formData.template_type}
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
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject Line *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Enter subject line..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>

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
                  rows="10"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your template message here using Markdown formatting...

**Bold text** and *italic text*
# Headers
- Bullet points
```code blocks```
[Links](https://example.com)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue font-mono"
                />
              ) : (
                <div className="min-h-[250px] w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <div className="bg-white rounded p-4 min-h-[230px]">
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

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Template is active
              </label>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-brand-blue to-brand-teal text-white py-2 px-6 rounded-md hover:from-brand-blue-dark hover:to-brand-teal-dark focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 font-medium"
              >
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No templates created yet</p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="text-brand-blue hover:underline"
                >
                  Create your first template
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {template.template_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {template.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(template)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            template.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          } cursor-pointer hover:opacity-80`}
                        >
                          {template.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-brand-blue hover:text-brand-blue-dark mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(template)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && templateToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              ⚠️ Delete Message Template?
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the template "<strong>{templateToDelete.name}</strong>"?
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• <strong>This action cannot be undone</strong></li>
              <li>• The template will be permanently removed</li>
              <li>• You'll need to recreate it if needed in the future</li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTemplateToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium"
              >
                Delete Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageTemplates;