import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';
import RichTextEditor from '../forms/RichTextEditor';
import DeferredImageUploadField, { uploadPendingImages } from './DeferredImageUpload';
import BackToDashboard from '../ui/BackToDashboard';

const WebsiteConfiguration = () => {
  const { isAdmin } = useAuth();
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingContent, setEditingContent] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    loadSections();
  }, [isAdmin]);

  const loadSections = async () => {
    try {
      const { data, error } = await db.getWebsiteSections();
      if (error) throw error;
      setSections(data || []);
      
      // Auto-select first section
      if (data && data.length > 0) {
        setSelectedSection(data[0]);
        loadSectionContent(data[0].id);
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSectionContent = async (sectionId) => {
    try {
      setLoading(true);
      const { data, error } = await db.getWebsiteContentWithFields(sectionId);
      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setShowEditor(false);
    setEditingContent(null);
    loadSectionContent(section.id);
  };

  const handleCreateContent = () => {
    if (!selectedSection) return;
    
    const newContent = {
      id: null,
      title: selectedSection.section_type === 'single' ? selectedSection.display_name : '',
      status: 'published',
      sort_order: content.length,
      website_content_fields: []
    };
    
    setEditingContent(newContent);
    setShowEditor(true);
  };

  const handleEditContent = (contentItem) => {
    setEditingContent(contentItem);
    setShowEditor(true);
  };

  const handleDeleteContent = async (contentId) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      setSaving(true);
      const { error } = await db.deleteWebsiteContent(contentId);
      if (error) throw error;
      
      await loadSectionContent(selectedSection.id);
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Error deleting content');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading && !selectedSection) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <BackToDashboard />
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Website Configuration</h1>
            <p className="text-gray-600">Manage your website content and settings</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sections Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Sections</h3>
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionSelect(section)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedSection?.id === section.id
                      ? 'bg-brand-blue text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{section.display_name}</div>
                  <div className="text-sm opacity-75">
                    {section.section_type === 'single' ? 'Single Item' : 'Collection'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {!showEditor ? (
            <SectionContentList
              section={selectedSection}
              content={content}
              loading={loading}
              onCreateContent={handleCreateContent}
              onEditContent={handleEditContent}
              onDeleteContent={handleDeleteContent}
            />
          ) : (
            <ContentEditor
              section={selectedSection}
              content={editingContent}
              saving={saving}
              onSave={async (contentData, fields) => {
                try {
                  setSaving(true);
                  
                  // Process features for programs section - convert textarea to JSON
                  if (selectedSection.section_key === 'programs' && fields.features) {
                    const featuresText = fields.features.value || '';
                    const featuresArray = featuresText
                      .split('\n')
                      .map(line => line.trim())
                      .filter(line => line.length > 0);
                    
                    fields.features = {
                      ...fields.features,
                      type: 'json',
                      value: JSON.stringify(featuresArray)
                    };
                  }
                  
                  // Upload any pending images first
                  const fieldsWithUploadedImages = await uploadPendingImages(fields);
                  
                  // For single sections, auto-set the title
                  const finalContentData = {
                    ...contentData,
                    title: selectedSection.section_type === 'single' 
                      ? selectedSection.display_name 
                      : contentData.title
                  };
                  
                  if (editingContent.id) {
                    // Update existing content
                    await db.updateWebsiteContentWithFields(editingContent.id, finalContentData, fieldsWithUploadedImages);
                  } else {
                    // Create new content
                    await db.createWebsiteContentWithFields({
                      ...finalContentData,
                      section_id: selectedSection.id
                    }, fieldsWithUploadedImages);
                  }
                  
                  setShowEditor(false);
                  setEditingContent(null);
                  await loadSectionContent(selectedSection.id);
                } catch (error) {
                  console.error('Error saving content:', error);
                  alert('Error saving content: ' + (error.message || 'Unknown error'));
                } finally {
                  setSaving(false);
                }
              }}
              onCancel={() => {
                setShowEditor(false);
                setEditingContent(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Component for displaying content list
const SectionContentList = ({ section, content, loading, onCreateContent, onEditContent, onDeleteContent }) => {
  if (!section) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-semibold mb-2">Select a Section</h3>
          <p>Choose a content section from the sidebar to manage its content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{section.display_name}</h2>
            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
          </div>
          {section.section_type === 'collection' && (
            <button
              onClick={onCreateContent}
              className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Add New
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue"></div>
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-lg font-medium mb-2">No content yet</p>
            <p className="text-sm">
              {section.section_type === 'single' 
                ? 'Create the content for this section'
                : 'Add your first content item to get started'
              }
            </p>
            <button
              onClick={onCreateContent}
              className="mt-4 bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Content
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {content.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {item.website_content_fields.length} fields configured
                    </div>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'published' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                      {/* Hide sort order for tips - they should be ordered by date */}
                      {section?.section_key !== 'tips' && (
                        <span className="text-xs text-gray-500">
                          Order: {item.sort_order}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditContent(item)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteContent(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Content Editor Component
const ContentEditor = ({ section, content, saving, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    status: content?.status || 'published',
    sort_order: content?.sort_order || 0
  });
  
  const [fields, setFields] = useState(() => {
    const fieldsObj = {};
    if (content?.website_content_fields) {
      content.website_content_fields.forEach(field => {
        let fieldValue = field.field_value;
        
        // Special handling for features field in programs - convert JSON back to textarea format
        if (section.section_key === 'programs' && field.field_key === 'features' && field.field_type === 'json') {
          try {
            const featuresArray = JSON.parse(fieldValue);
            if (Array.isArray(featuresArray)) {
              fieldValue = featuresArray.join('\n');
            }
          } catch (e) {
            console.warn('Failed to parse features JSON:', e);
          }
        }
        
        fieldsObj[field.field_key] = {
          type: field.field_type,
          value: fieldValue,
          data: field.field_data
        };
      });
    }
    return fieldsObj;
  });

  // Field templates based on section type
  const getFieldTemplates = () => {
    switch (section.section_key) {
      case 'hero':
        return [
          { key: 'heading', label: 'Heading', type: 'text', required: true },
          { key: 'subheading', label: 'Subheading', type: 'text', required: true },
          { key: 'heading_color', label: 'Heading Color', type: 'color' },
          { key: 'subheading_color', label: 'Subheading Color', type: 'color' },
          { key: 'background_image', label: 'Background Image', type: 'image' }
        ];
      case 'testimonials':
        return [
          { key: 'client_name', label: 'Client Name', type: 'text', required: true },
          { key: 'testimonial_text', label: 'Testimonial', type: 'rich_text', required: true },
          { key: 'photo', label: 'Photo', type: 'image' },
          { key: 'location', label: 'Location', type: 'text' }
        ];
      case 'programs':
        return [
          { key: 'program_title', label: 'Program Title', type: 'text', required: true },
          { key: 'description', label: 'Description', type: 'rich_text', required: true },
          { key: 'features', label: 'Features (one per line)', type: 'textarea', required: true },
          { key: 'color', label: 'Theme Color', type: 'color' },
          { key: 'price', label: 'Price', type: 'text' },
          { key: 'duration', label: 'Duration', type: 'text' }
        ];
      case 'about_us':
        return [
          { key: 'hero_image', label: 'Hero Image', type: 'image', required: true },
          { key: 'main_heading', label: 'Main Heading', type: 'text', required: true },
          { key: 'subheading', label: 'Subheading', type: 'text', required: true },
          { key: 'left_heading', label: 'Left Column Heading', type: 'text', required: true },
          { key: 'left_content', label: 'Left Column Content', type: 'rich_text', required: true },
          { key: 'left_block_heading', label: 'Left Sidebar Block Heading', type: 'text' },
          { key: 'left_block_bullets', label: 'Left Block Bullet Points (one per line)', type: 'rich_text' },
          { key: 'right_heading', label: 'Right Column Heading', type: 'text', required: true },
          { key: 'right_content', label: 'Right Column Content', type: 'rich_text', required: true },
          { key: 'mission', label: 'Mission Statement', type: 'rich_text', required: true }
        ];
      case 'tips':
        return [
          { key: 'title', label: 'Article Title', type: 'text', required: true },
          { key: 'excerpt', label: 'Excerpt/Summary', type: 'text', required: true },
          { key: 'content', label: 'Article Content', type: 'rich_text', required: true },
          { key: 'featured_image', label: 'Featured Image', type: 'image' },
          { key: 'publish_date', label: 'Publish Date', type: 'date', required: true },
          { key: 'author', label: 'Author', type: 'text' },
          { key: 'category', label: 'Category', type: 'text' },
          { key: 'tags', label: 'Tags (comma separated)', type: 'text' },
          { key: 'reading_time', label: 'Estimated Reading Time', type: 'text' },
          { key: 'meta_description', label: 'Meta Description (SEO)', type: 'text' }
        ];
      case 'success_stories':
        return [
          { key: 'dog_name', label: 'Dog Name', type: 'text', required: true },
          { key: 'breed', label: 'Breed', type: 'text', required: true },
          { key: 'image', label: 'Dog Image', type: 'image', required: true },
          { key: 'challenge', label: 'Training Challenge', type: 'text', required: true },
          { key: 'achievement', label: 'Achievement/Result', type: 'text', required: true },
          { key: 'duration', label: 'Training Duration', type: 'text', required: true },
          { key: 'story_content', label: 'Full Story (Optional)', type: 'rich_text' },
          { key: 'video_url', label: 'Video URL (Optional)', type: 'text' }
        ];
      default:
        return [
          { key: 'content', label: 'Content', type: 'rich_text' }
        ];
    }
  };

  const fieldTemplates = getFieldTemplates();

  // Initialize fields if they don't exist
  useEffect(() => {
    const newFields = { ...fields };
    let hasChanges = false;

    fieldTemplates.forEach(template => {
      if (!newFields[template.key]) {
        // Set default value based on field type
        let defaultValue = '';
        if (template.type === 'date') {
          // Default to today's date for date fields
          const today = new Date();
          defaultValue = today.toISOString().split('T')[0];
        }
        
        newFields[template.key] = {
          type: template.type,
          value: defaultValue,
          data: {}
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setFields(newFields);
    }
  }, [section]);

  const handleFieldChange = (fieldKey, value, data = {}) => {
    setFields(prev => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        value,
        data: { ...prev[fieldKey]?.data, ...data }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, fields);
  };

  const renderField = (template) => {
    const field = fields[template.key] || { value: '', data: {} };

    switch (template.type) {
      case 'text':
        return (
          <input
            type="text"
            value={field.value}
            onChange={(e) => handleFieldChange(template.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
            required={template.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={field.value}
            onChange={(e) => handleFieldChange(template.key, e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
            placeholder="Enter each feature on a new line..."
            required={template.required}
          />
        );

      case 'rich_text':
        return (
          <RichTextEditor
            value={field.value}
            onChange={(value) => handleFieldChange(template.key, value)}
            placeholder="Enter your content here..."
            required={template.required}
          />
        );

      case 'color':
        return (
          <div className="flex space-x-2">
            <input
              type="color"
              value={field.value || '#000000'}
              onChange={(e) => handleFieldChange(template.key, e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={field.value}
              onChange={(e) => handleFieldChange(template.key, e.target.value)}
              placeholder="#000000"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={field.value}
            onChange={(e) => handleFieldChange(template.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
            required={template.required}
          />
        );

      case 'date':
        // Use field.value if it exists, otherwise use empty string and let the input handle its own default
        return (
          <input
            type="date"
            value={field.value || ''}
            onChange={(e) => handleFieldChange(template.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
            required={template.required}
          />
        );

      case 'image':
        return (
          <DeferredImageUploadField
            value={field.value}
            onChange={(url) => handleFieldChange(template.key, url)}
            sectionKey={section.section_key}
            fieldKey={template.key}
          />
        );

      default:
        return (
          <input
            type="text"
            value={field.value}
            onChange={(e) => handleFieldChange(template.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {content?.id ? 'Edit' : 'Create'} {section.display_name} Content
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Fields - Only show for collection types */}
        {section.section_type === 'collection' && (
          <div className={`grid grid-cols-1 ${section?.section_key === 'tips' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4 pb-6 border-b`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                placeholder="Enter a descriptive title for this item..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Hide sort order for tips - they should be ordered by date */}
            {section?.section_key !== 'tips' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            )}
          </div>
        )}

        {/* Single type status control */}
        {section.section_type === 'single' && (
          <div className="pb-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Content Status</h3>
                <p className="text-sm text-gray-600">Control whether this content is visible on your website</p>
              </div>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        )}

        {/* Dynamic Fields */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Content Fields</h3>
          <div className="space-y-4">
            {fieldTemplates.map((template) => (
              <div key={template.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {template.label}
                  {template.required && <span className="text-red-500">*</span>}
                </label>
                {renderField(template)}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Uploading & Saving...' : 'Save Content'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Image Upload Component
const ImageUploadField = ({ value, onChange, sectionKey, fieldKey }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;


    // Validate file type - check both MIME type and extension
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (!validImageTypes.includes(file.type) && !validExtensions.includes(fileExt)) {
      alert('Please select a valid image file (JPG, PNG, WebP, or SVG)');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Generate unique filename with proper extension
      const timestamp = Date.now();
      const cleanName = fieldKey.replace(/[^a-zA-Z0-9]/g, '-');
      const fileName = `${cleanName}-${timestamp}.${fileExt}`;


      // Always create a new File object with the correct MIME type based on extension
      // This fixes issues where browsers incorrectly detect MIME types
      let mimeType = 'image/jpeg'; // default for jpg/jpeg
      if (fileExt === 'png') mimeType = 'image/png';
      else if (fileExt === 'webp') mimeType = 'image/webp';
      else if (fileExt === 'svg') mimeType = 'image/svg+xml';
      else if (fileExt === 'gif') mimeType = 'image/gif';
      
      // Convert to ArrayBuffer for clean binary upload
      const arrayBuffer = await file.arrayBuffer();
      

      // Validate file before upload
      if (arrayBuffer.byteLength === 0) {
        throw new Error('File appears to be empty');
      }


      // Upload to appropriate section folder
      const { data, error } = await db.uploadPublicMedia(arrayBuffer, sectionKey, fileName);
      
      if (error) {
        console.error('Upload error details:', error);
        throw error;
      }


      // Verify the upload by checking if we can fetch it immediately
      try {
        const verifyResponse = await fetch(`https://mofdwymoqkkgbsdwbbcv.supabase.co/storage/v1/object/public/public-media/${data.path}`, {
          method: 'HEAD'
        });
        
        if (verifyResponse.status !== 200) {
          throw new Error(`Upload verification failed: ${verifyResponse.status}`);
        }
        
        const contentLength = verifyResponse.headers.get('content-length');
        if (contentLength === '0' || contentLength === null) {
          throw new Error('Uploaded file appears to be empty');
        }
        
      } catch (verifyError) {
        console.error('Upload verification failed:', verifyError);
        // Don't throw here, just warn
      }

      // Get the public URL - try different approaches
      let publicUrl = null;
      
      // Method 1: Use our helper function
      const { data: urlData } = await db.getPublicMediaUrl(sectionKey, fileName);
      
      if (urlData?.publicUrl) {
        publicUrl = urlData.publicUrl;
      } else {
        // Method 2: Try direct Supabase URL generation
        const directUrl = db.supabase.storage.from('public-media').getPublicUrl(`website/${sectionKey}/${fileName}`);
        
        if (directUrl?.data?.publicUrl) {
          publicUrl = directUrl.data.publicUrl;
        } else {
          // Method 3: Use the actual uploaded path
          if (data?.path) {
            const pathUrl = db.supabase.storage.from('public-media').getPublicUrl(data.path);
            publicUrl = pathUrl?.data?.publicUrl;
          }
        }
      }
      
      
      if (publicUrl) {
        // Test if the URL is accessible
        try {
          const testResponse = await fetch(publicUrl, { method: 'HEAD' });
          if (testResponse.ok) {
            onChange(publicUrl);
          } else {
            throw new Error(`Image URL not accessible (status: ${testResponse.status})`);
          }
        } catch (fetchError) {
          console.warn('URL test failed:', fetchError);
          // Still use the URL, maybe it's a CORS issue
          onChange(publicUrl);
        }
      } else {
        throw new Error('Failed to generate public URL for uploaded file');
      }

      setUploadProgress(100);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUrlChange = (e) => {
    onChange(e.target.value);
  };

  const clearImage = () => {
    onChange('');
  };

  return (
    <div className="space-y-3">
      {/* URL Input */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Image URL
        </label>
        <input
          type="url"
          value={value}
          onChange={handleUrlChange}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm"
        />
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Or upload file
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-blue-700 disabled:opacity-50"
          />
          {uploading && (
            <div className="text-sm text-blue-600">
              Uploading... {uploadProgress}%
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Max file size: 10MB. Supported: JPG, PNG, WebP, SVG
        </p>
      </div>

      {/* Image Preview */}
      {value && (
        <ImagePreview 
          src={value} 
          onRemove={clearImage}
        />
      )}
    </div>
  );
};

// Enhanced Image Preview Component with better error handling
const ImagePreview = ({ src, onRemove }) => {
  const [imageState, setImageState] = useState('loading');
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    // Prevent infinite loops
    if (!src || imageState === 'loaded' || imageState === 'loaded-blob' || imageState === 'error') {
      return;
    }

    // Try to load the image with authentication headers
    const loadImageWithAuth = async () => {
      try {
        setImageState('loading');
        
        // First try: Direct image load
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        const loadPromise = new Promise((resolve, reject) => {
          img.onload = () => {
            setImageState('loaded');
            resolve();
          };
          img.onerror = (e) => {
            reject(e);
          };
        });
        
        img.src = src;
        
        // Give it 5 seconds to load
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Direct load timeout')), 5000)
        );
        
        await Promise.race([loadPromise, timeoutPromise]);
        
      } catch (error) {
        
        // Fallback: Fetch the image as blob and create object URL
        try {
          const response = await fetch(src);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const blob = await response.blob();
          
          if (blob.size === 0) {
            throw new Error('Empty blob - file might be corrupted');
          }
          
          const objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
          setImageState('loaded-blob');
          
        } catch (fetchError) {
          console.error('Both image loading methods failed:', fetchError);
          setImageState('error');
        }
      }
    };

    loadImageWithAuth();
  }, [src]); // Remove blobUrl from dependencies to prevent infinite loop

  // Separate cleanup effect
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const displaySrc = imageState === 'loaded-blob' ? blobUrl : src;

  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Preview</span>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Remove
        </button>
      </div>

      {imageState === 'loading' && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading preview...</p>
        </div>
      )}

      {(imageState === 'loaded' || imageState === 'loaded-blob') && (
        <img 
          src={displaySrc}
          alt="Preview" 
          className="max-w-full max-h-48 rounded border mx-auto block"
          onError={() => {
            console.error('Image preview failed even with blob method');
            setImageState('error');
          }}
        />
      )}

      {imageState === 'error' && (
        <div className="text-center text-gray-500 text-sm py-8">
          <div className="mb-2">⚠️ Preview not available</div>
          <div className="text-xs mb-3">Image uploaded successfully but preview failed to load</div>
          <div className="space-y-2">
            <a 
              href={src} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block text-blue-600 hover:text-blue-800 underline text-xs"
            >
              Open image in new tab
            </a>
            <div className="text-xs text-gray-400">
              This is likely a CORS issue. The image should work fine on your website.
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2 break-all">
        URL: {src}
      </p>
      
      {imageState === 'loaded-blob' && (
        <p className="text-xs text-green-600 mt-1">
          ✓ Loaded via fallback method
        </p>
      )}
    </div>
  );
};

export default WebsiteConfiguration;
