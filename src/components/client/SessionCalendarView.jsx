import React, { useState } from 'react';

const SessionCalendarView = ({ sessions = [], onSessionClick, getStatusColor }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getSessionsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toDateString();
    return sessions.filter(session => {
      const sessionDate = new Date(session.scheduled_date);
      return sessionDate.toDateString() === dateStr;
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    if (!date) return false;
    return date.getMonth() === currentDate.getMonth();
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            Today
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day names header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const daysSessions = getSessionsForDate(date);
            const hasCurrentMonth = isCurrentMonth(date);
            const todayFlag = isToday(date);

            return (
              <div
                key={index}
                className={`min-h-[100px] p-1 border border-gray-100 rounded ${
                  hasCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${todayFlag ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                {date && (
                  <>
                    <div className={`text-sm mb-1 ${
                      todayFlag ? 'font-bold text-blue-600' : hasCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {daysSessions.slice(0, 3).map((session) => (
                        <div
                          key={session.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSessionClick && onSessionClick(session);
                          }}
                          className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(session.status)}`}
                          title={`${session.client_name || ''} - ${session.dog_name} (${new Date(session.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                        >
                          <div className="truncate font-medium">
                            {session.dog_name}
                          </div>
                          <div className="truncate opacity-75">
                            {new Date(session.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                      {daysSessions.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{daysSessions.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
            <span className="text-gray-600">Scheduled</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
            <span className="text-gray-600">Confirmed</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></div>
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
            <span className="text-gray-600">Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionCalendarView;