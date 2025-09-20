import React from 'react';
import { Link } from 'react-router-dom';

export const createHomeworkRenderer = (isAdmin = false, homeworkMessages = {}) => {
  return (homeworkAssigned) => {
    if (!homeworkAssigned) return null;

    // For clients, check if we have the message data loaded
    if (!isAdmin && homeworkMessages[homeworkAssigned]) {
      const homework = homeworkMessages[homeworkAssigned];
      return (
        <Link 
          to={`/messages?messageId=${homeworkAssigned}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm hover:underline block"
        >
          <strong>📝 {homework.subject}</strong>
          <div className="text-xs text-current opacity-75 mt-1">
            Click to view full homework assignment
          </div>
        </Link>
      );
    }

    // Check if it looks like a UUID (message ID that wasn't found for clients)
    if (!isAdmin) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(homeworkAssigned)) {
        return (
          <div className="text-sm">
            <span className="text-yellow-600">📝 Homework Assignment</span>
            <div className="text-xs text-current opacity-75 mt-1">
              (Message not found - may have been deleted)
            </div>
          </div>
        );
      }

      // Fallback for clients: treat as regular text
      return <span className="text-sm">{homeworkAssigned}</span>;
    }

    // For admins, always create a link to dashboard messages
    return (
      <Link 
        to={`/dashboard/messages?messageId=${homeworkAssigned}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm hover:underline block"
      >
        📝 View homework assignment
      </Link>
    );
  };
};