import React, { useState, useEffect } from 'react';
import { db } from '../../lib/supabase';

// Image Upload Component with deferred upload
const DeferredImageUploadField = ({ value, onChange, sectionKey, fieldKey }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  // Check if current value is a pending upload (JSON stringified object)
  const isPendingUpload = value && (() => {
    try {
      const parsed = JSON.parse(value);
      return parsed.type === 'pending_upload';
    } catch {
      return false;
    }
  })();
  
  // const isExistingUrl = value && !isPendingUpload;

  // Set preview URL for pending uploads
  useEffect(() => {
    if (isPendingUpload) {
      try {
        const parsed = JSON.parse(value);
        setPreviewUrl(parsed.base64);
      } catch {
        setPreviewUrl(null);
      }
    } else {
      setPreviewUrl(null);
    }
  }, [value, isPendingUpload]);

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
      // Store file data for later upload and create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target.result;
        // Store metadata with the base64 data for later upload
        const fileData = {
          type: 'pending_upload',
          base64: base64Data,
          fileName: `${fieldKey.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.${fileExt}`,
          mimeType: file.type,
          sectionKey,
          fieldKey
        };
        onChange(JSON.stringify(fileData));
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('File preparation failed:', error);
      alert('Failed to prepare file: ' + (error.message || 'Unknown error'));
    }
  };

  const handleUrlChange = (e) => {
    onChange(e.target.value);
  };

  const clearImage = () => {
    onChange('');
    setPreviewUrl(null);
  };

  const displayValue = isPendingUpload ? '' : (value || '');
  const showPreview = isPendingUpload ? previewUrl : value;

  return (
    <div className="space-y-3">
      {/* URL Input */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Image URL
        </label>
        <input
          type="url"
          value={displayValue}
          onChange={handleUrlChange}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm"
          disabled={isPendingUpload}
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
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-blue-700"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Max file size: 10MB. Supported: JPG, PNG, WebP, SVG
        </p>
        {isPendingUpload && (
          <p className="text-xs text-amber-600 mt-1">
            📁 File ready for upload. Click "Save Content" to upload to Supabase.
          </p>
        )}
      </div>

      {/* Image Preview */}
      {showPreview && (
        <DeferredImagePreview 
          src={showPreview} 
          onRemove={clearImage}
          isPending={isPendingUpload}
        />
      )}
    </div>
  );
};

// Enhanced Image Preview Component for deferred uploads
const DeferredImagePreview = ({ src, onRemove, isPending = false }) => {
  const [imageState, setImageState] = useState('loading');

  useEffect(() => {
    setImageState('loading');
    
    if (src) {
      const img = new Image();
      img.onload = () => setImageState('loaded');
      img.onerror = () => setImageState('error');
      img.src = src;
    }
  }, [src]);

  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Preview {isPending && <span className="text-amber-600">(Pending Upload)</span>}
        </span>
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

      {imageState === 'loaded' && (
        <img 
          src={src}
          alt="Preview" 
          className="max-w-full max-h-48 rounded border mx-auto block"
        />
      )}

      {imageState === 'error' && (
        <div className="text-center text-gray-500 text-sm py-8">
          <div className="mb-2">⚠️ Preview not available</div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2 break-all">
        {isPending ? 'Local file ready for upload' : `URL: ${src}`}
      </p>
    </div>
  );
};

// Function to handle actual upload of pending files
export const uploadPendingImages = async (fields) => {
  const uploadedFields = { ...fields };
  const uploadPromises = [];
  
  for (const [fieldKey, fieldData] of Object.entries(fields)) {
    if (fieldData.value) {
      try {
        const parsed = JSON.parse(fieldData.value);
        if (parsed.type === 'pending_upload') {
          // This is a pending upload
          const uploadPromise = uploadSingleImage(parsed).then(publicUrl => {
            uploadedFields[fieldKey] = {
              ...fieldData,
              value: publicUrl
            };
          });
          uploadPromises.push(uploadPromise);
        }
      } catch {
        // Not a JSON value, leave as is
      }
    }
  }
  
  // Wait for all uploads to complete
  await Promise.all(uploadPromises);
  
  return uploadedFields;
};

// Helper function to upload a single image
const uploadSingleImage = async (fileData) => {
  const { base64, fileName, sectionKey } = fileData;
  
  // Convert base64 to ArrayBuffer
  const base64Data = base64.split(',')[1];
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Upload to Supabase
  const { error } = await db.uploadPublicMedia(bytes.buffer, sectionKey, fileName);
  
  if (error) {
    console.error('Upload error:', error);
    throw new Error('Upload failed: ' + error.message);
  }
  
  // Get the public URL
  const { data: urlData } = await db.getPublicMediaUrl(sectionKey, fileName);
  
  if (urlData?.publicUrl) {
    return urlData.publicUrl;
  } else {
    // Fallback URL generation
    const directUrl = db.supabase.storage.from('public-media').getPublicUrl(`website/${sectionKey}/${fileName}`);
    return directUrl?.data?.publicUrl;
  }
};

export default DeferredImageUploadField;