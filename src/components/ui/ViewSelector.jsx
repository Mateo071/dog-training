import React from 'react';

const ViewSelector = ({ currentView, onViewChange, className = '' }) => {
  const views = [
    { key: 'list', label: 'List View', icon: '📋' },
    { key: 'calendar', label: 'Calendar View', icon: '📅' },
    { key: 'details', label: 'Details View', icon: '📊' }
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {views.map((view) => (
        <button
          key={view.key}
          onClick={() => onViewChange(view.key)}
          className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === view.key
              ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
              : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <span className="mr-2">{view.icon}</span>
          {view.label}
        </button>
      ))}
    </div>
  );
};

export default ViewSelector;