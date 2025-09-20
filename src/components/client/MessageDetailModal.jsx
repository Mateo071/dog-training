import React, { useState } from 'react';
import MarkdownRenderer from '../content/MarkdownRenderer';
import Alert from '../ui/Alert';

const MessageDetailModal = ({ message, isOpen, onClose }) => {
  const [alert, setAlert] = useState({ show: false, text: '', type: 'success' });

  if (!isOpen || !message) return null;

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
      default: return '💬';
    }
  };

  const formatContent = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.replace(urlRegex, '<a href="$1" target="_blank" class="text-brand-blue hover:underline">$1</a>');
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Message - ${message.subject}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 40px;
              line-height: 1.6;
              color: #333;
            }
            .header { 
              border-bottom: 2px solid #e5e7eb; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            h1 { 
              color: #111827;
              font-size: 28px;
              margin-bottom: 15px;
            }
            .meta { 
              color: #6b7280; 
              font-size: 14px;
              line-height: 1.8;
            }
            .meta-item {
              margin-bottom: 5px;
            }
            .priority {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
              margin-left: 10px;
            }
            .priority-urgent {
              background: #fee2e2;
              color: #dc2626;
            }
            .priority-high {
              background: #fed7aa;
              color: #ea580c;
            }
            .priority-normal {
              background: #dbeafe;
              color: #2563eb;
            }
            .priority-low {
              background: #f3f4f6;
              color: #4b5563;
            }
            .message-content { 
              font-size: 16px;
              line-height: 1.8;
              color: #374151;
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #9ca3af;
            }
            a {
              color: #2563eb;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${message.subject}</h1>
            <div class="meta">
              <div class="meta-item">
                <strong>From:</strong> ${message.sender_name}
                ${message.priority !== 'normal' ? `<span class="priority priority-${message.priority}">${message.priority.toUpperCase()} PRIORITY</span>` : ''}
              </div>
              <div class="meta-item"><strong>Date:</strong> ${new Date(message.created_at).toLocaleString()}</div>
              <div class="meta-item"><strong>Type:</strong> ${getMessageTypeIcon(message.message_type)} ${message.message_type.charAt(0).toUpperCase() + message.message_type.slice(1)}</div>
              ${message.has_read_receipt && message.read_at ? `<div class="meta-item"><strong>Read:</strong> ${new Date(message.read_at).toLocaleString()}</div>` : ''}
            </div>
          </div>
          <div class="message-content">
            ${message.content}
          </div>
          <div class="footer">
            Generated from Flores Dog Training Client Portal on ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const copyToClipboard = async () => {
    const textContent = `Subject: ${message.subject}\r\nFrom: ${message.sender_name}\r\nDate: ${new Date(message.created_at).toLocaleString()}\r\nType: ${message.message_type}\r\nPriority: ${message.priority}\r\n${message.has_read_receipt && message.read_at ? `Read: ${new Date(message.read_at).toLocaleString()}` : ''}\r\n\r\n${message.content}`;

    try {
      await navigator.clipboard.writeText(textContent);
      setAlert({ show: true, text: 'Message copied to clipboard!', type: 'success' });
      setTimeout(() => setAlert({ show: false, text: '', type: 'success' }), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setAlert({ show: true, text: 'Failed to copy message to clipboard', type: 'danger' });
      setTimeout(() => setAlert({ show: false, text: '', type: 'danger' }), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {alert.show && <Alert type={alert.type} text={alert.text} />}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="bg-white px-6 py-4 border-b sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Message Details</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{message.subject}</h2>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      <strong>From:</strong> {message.sender_name}
                    </span>
                    {message.priority !== 'normal' && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(message.priority)}`}>
                        {message.priority.toUpperCase()} PRIORITY
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <strong>Sent:</strong> {new Date(message.created_at).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <strong>Type:</strong> 
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${message.message_type === 'feedback' ? 'bg-green-100 text-green-800' : 
                      message.message_type === 'homework' ? 'bg-blue-100 text-blue-800' :
                      message.message_type === 'appointment' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getMessageTypeIcon(message.message_type)} {message.message_type.charAt(0).toUpperCase() + message.message_type.slice(1)}
                    </span>
                  </div>
                  
                  {message.has_read_receipt && message.read_at && (
                    <div className="text-sm text-gray-600">
                      <strong>Read:</strong> {new Date(message.read_at).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                  
                  {!message.has_read_receipt && (
                    <div className="text-sm text-brand-blue font-medium">
                      ● Unread Message
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-6">
                <div className="bg-white rounded-lg p-6 border">
                  <MarkdownRenderer 
                    content={message.content}
                    className="text-gray-800 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 border-t sticky bottom-0">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Message ID: {message.id}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                >
                  📋 Copy
                </button>
                <button
                  onClick={exportToPDF}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                >
                  📄 Export PDF
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetailModal;
