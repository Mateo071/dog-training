import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/supabase';
import MessageDetailModal from './client/MessageDetailModal';
import { useRealtimeMessages } from '../hooks/useRealtime';
import SEO from './content/SEO';
import { analytics } from '../configuration.jsx';
import { logEvent } from 'firebase/analytics';

const Dashboard = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Track dashboard access
    if (analytics && profile) {
      logEvent(analytics, 'page_view', {
        page_title: isAdmin ? 'Admin Dashboard' : 'Client Dashboard',
        page_location: window.location.href,
        user_role: isAdmin ? 'admin' : 'client'
      });
    }

    // Redirect clients to onboarding if profile is incomplete
    if (profile && !isAdmin && !profile.profile_completed) {
      navigate('/onboarding');
    }
  }, [profile, isAdmin, navigate]);

  if (isAdmin) {
    return (
      <>
        <SEO 
          title="Admin Dashboard - Flores Dog Training"
          description="Admin dashboard for managing clients, sessions, and business operations."
          robots="noindex, nofollow"
        />
        <AdminDashboard profile={profile} signOut={signOut} />
      </>
    );
  } else {
    return (
      <>
        <SEO 
          title="Client Dashboard - Flores Dog Training"
          description="Your personal dog training dashboard with sessions, messages, and progress tracking."
          robots="noindex, nofollow"
        />
        <ClientDashboard user={user} profile={profile} signOut={signOut} />
      </>
    );
  }
};

const AdminDashboard = ({ profile, signOut }) => {
  const [stats, setStats] = useState({
    activeClients: '--',
    newInquiries: '--',
    weekSessions: '--'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get active clients count
        const { data: activeClients, error: clientsError } = await db.getActiveClients();
        if (!clientsError && activeClients) {
          setStats(prev => ({ ...prev, activeClients: activeClients.length }));
        }

        // Get contact submissions count (new inquiries)
        const { data: submissions, error: submissionsError } = await db.getContactSubmissions();
        if (!submissionsError && submissions) {
          // Count unprocessed submissions (status = 'new')
          const newInquiries = submissions.filter(sub => sub.status === 'new').length;
          setStats(prev => ({ ...prev, newInquiries }));
        }

        // Get this week's sessions count
        const { data: weekSessions, error: sessionsError } = await db.getThisWeekSessions();
        if (sessionsError) {
          console.error('Error fetching week sessions:', sessionsError);
          setStats(prev => ({ ...prev, weekSessions: 0 }));
        } else {
          setStats(prev => ({ ...prev, weekSessions: weekSessions ? weekSessions.length : 0 }));
        }
        
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-brand-blue transition-colors duration-200 mb-4 font-medium"
        >
          ← Back to Home
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {profile?.first_name || 'Trainer'}! 👋
            </h1>
            <p className="text-gray-600">Manage your dog training business</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600 transition-colors duration-200 font-medium"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-brand-blue to-brand-teal rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">New Inquiries</p>
              <p className="text-2xl font-bold">{stats.newInquiries}</p>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-brand-teal to-green-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Clients</p>
              <p className="text-2xl font-bold">{stats.activeClients}</p>
            </div>
            <div className="text-3xl">🐕</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">This Week's Sessions</p>
              <p className="text-2xl font-bold">{stats.weekSessions}</p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/dashboard/contact-submissions"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Submissions</h3>
            <div className="text-2xl group-hover:scale-110 transition-transform">📬</div>
          </div>
          <p className="text-gray-600 text-sm">Review and manage new evaluation requests</p>
        </Link>

        <Link
          to="/dashboard/clients"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Client Management</h3>
            <div className="text-2xl group-hover:scale-110 transition-transform">👥</div>
          </div>
          <p className="text-gray-600 text-sm">Manage client profiles and dogs</p>
        </Link>

        <Link
          to="/dashboard/messages"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
            <div className="text-2xl group-hover:scale-110 transition-transform">💬</div>
          </div>
          <p className="text-gray-600 text-sm">View sent messages and compose new ones</p>
        </Link>

        <Link
          to="/admin/templates"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Message Templates</h3>
            <div className="text-2xl group-hover:scale-110 transition-transform">📝</div>
          </div>
          <p className="text-gray-600 text-sm">Create and manage reusable templates</p>
        </Link>

        <Link
          to="/dashboard/sessions"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Session Management</h3>
            <div className="text-2xl group-hover:scale-110 transition-transform">🎯</div>
          </div>
          <p className="text-gray-600 text-sm">Schedule and manage training sessions</p>
        </Link>

        <Link
          to="/dashboard/analytics"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
            <div className="text-2xl group-hover:scale-110 transition-transform">📊</div>
          </div>
          <p className="text-gray-600 text-sm">View business metrics and reports</p>
        </Link>

        <Link
          to="/dashboard/discounts"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Discount Codes</h3>
            <div className="text-2xl group-hover:scale-110 transition-transform">🎫</div>
          </div>
          <p className="text-gray-600 text-sm">Create and manage discount codes</p>
        </Link>

        <Link
          to="/dashboard/website-config"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Website Configuration</h3>
            <div className="text-2xl group-hover:scale-110 transition-transform">🌐</div>
          </div>
          <p className="text-gray-600 text-sm">Manage website content and settings</p>
        </Link>

        <Link
          to="/dashboard/settings"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
            <div className="text-2xl group-hover:scale-110 transition-transform">⚙️</div>
          </div>
          <p className="text-gray-600 text-sm">Configure system settings and preferences</p>
        </Link>
      </div>
    </div>
  );
};

const ClientDashboard = ({ user, profile, signOut }) => {
  const [recentMessages, setRecentMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [dogs, setDogs] = useState([]);
  const [loadingDogs, setLoadingDogs] = useState(true);
  
  // Use realtime messages hook for unread count management
  const { setUnreadCount } = useRealtimeMessages();

  useEffect(() => {
    const fetchRecentMessages = async () => {
      if (!profile) return;
      
      try {
        const { data, error } = await db.getMessagesWithReadStatus(profile.id);
        if (error) throw error;
        
        
        // Get only the 3 most recent messages
        const recentThree = data?.slice(0, 3) || [];
        setRecentMessages(recentThree);
      } catch (error) {
        console.error('Error fetching recent messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    const fetchDogs = async () => {
      if (!profile) return;
      
      try {
        const { data, error } = await db.getDogs(profile.id);
        if (error) throw error;
        
        setDogs(data || []);
      } catch (error) {
        console.error('Error fetching dogs:', error);
      } finally {
        setLoadingDogs(false);
      }
    };

    fetchRecentMessages();
    fetchDogs();
  }, [profile]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleMessageClick = async (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    
    // Mark message as read if it hasn't been read yet  
    // A message is truly read if it has a read receipt (the stored procedure creates this correctly)
    const isAlreadyRead = message.has_read_receipt;
    
    if (!isAlreadyRead) {
      
      try {
        const { error } = await db.markMessageAsRead(message.id, user.id);
        if (error) {
          console.error('Dashboard: Error marking message as read:', error);
          throw error;
        }
        

        // Update local state immediately for instant UI feedback
        setRecentMessages(prev => {
          const updated = prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, has_read_receipt: true }
              : msg
          );
          return updated;
        });
        
        // Update global unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Error marking message as read:', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-brand-blue transition-colors duration-200 mb-4 font-medium"
        >
          ← Back to Home
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {profile?.first_name || 'Client'}! 🐕
            </h1>
            <p className="text-gray-600">Track your dog's training progress</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600 transition-colors duration-200 font-medium"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* My Dogs */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Dogs</h3>
          
          {loadingDogs ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue"></div>
            </div>
          ) : dogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🐕</div>
              <p>No dogs added yet</p>
              <p className="text-sm">Your trainer will help set up your dog's profile</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dogs.map((dog) => (
                <div key={dog.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">🐕</div>
                      <div>
                        <h4 className="font-medium text-gray-900">{dog.name}</h4>
                        <p className="text-sm text-gray-500">{dog.breed}</p>
                        {dog.birth_date && (
                          <p className="text-xs text-gray-400">
                            Born {new Date(dog.birth_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    {dog.training_analytics && dog.training_analytics.length > 0 && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-brand-blue">
                          {dog.training_analytics[0].total_sessions || 0} sessions
                        </div>
                        {dog.training_analytics[0].last_session_date && (
                          <div className="text-xs text-gray-500">
                            Last: {new Date(dog.training_analytics[0].last_session_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {dog.training_goals && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <span className="font-medium text-blue-900">Goals:</span>
                      <span className="text-blue-800 ml-1">{dog.training_goals}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
            <Link
              to="/messages"
              className="text-sm text-brand-blue hover:text-blue-700 font-medium"
            >
              View All
            </Link>
          </div>
          
          {loadingMessages ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue"></div>
            </div>
          ) : recentMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">💬</div>
              <p>No messages yet</p>
              <p className="text-sm">Training updates will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className={`border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer hover:shadow-md ${
                    !message.has_read_receipt ? 'border-l-4 border-l-brand-blue bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {message.subject}
                      </span>
                      {!message.has_read_receipt && (
                        <span className="w-2 h-2 bg-brand-blue rounded-full"></span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {message.content}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      From: {message.sender_name}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      message.message_type === 'feedback' ? 'bg-green-100 text-green-800' :
                      message.message_type === 'homework' ? 'bg-blue-100 text-blue-800' :
                      message.message_type === 'appointment' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {message.message_type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/messages"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
            <div className="text-2xl group-hover:scale-110 transition-transform">📨</div>
          </div>
          <p className="text-gray-600 text-sm">View training updates and homework</p>
        </Link>

        <Link
          to="/sessions"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Sessions</h3>
            <div className="text-2xl group-hover:scale-110 transition-transform">📅</div>
          </div>
          <p className="text-gray-600 text-sm">View upcoming and past training sessions</p>
        </Link>

        <Link
          to="/referrals"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Refer Friends</h3>
            <div className="text-2xl group-hover:scale-110 transition-transform">🎁</div>
          </div>
          <p className="text-gray-600 text-sm">Share your referral link and earn rewards</p>
        </Link>
      </div>

      <MessageDetailModal
        message={selectedMessage}
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
      />
    </div>
  );
};

export default Dashboard;