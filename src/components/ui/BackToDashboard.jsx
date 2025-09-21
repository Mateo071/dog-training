import React from 'react';
import { Link } from 'react-router-dom';

const BackToDashboard = ({ className = '' }) => {
  return (
    <Link
      to="/dashboard"
      className={`inline-flex items-center text-gray-600 hover:text-brand-blue transition-colors duration-200 mb-4 font-medium ${className}`}
    >
      ← Back to Dashboard
    </Link>
  );
};

export default BackToDashboard;