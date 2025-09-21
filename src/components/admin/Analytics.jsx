import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BackToDashboard from '../ui/BackToDashboard';
import { db } from '../../lib/supabase';
import { analytics } from '../../configuration.jsx';
import { logEvent } from 'firebase/analytics';
import { getAnalyticsData, getRealtimeData, getConversionFunnelData } from '../../lib/firebaseAnalytics';
import { LineChart, BarChart, DonutChart, ProgressBar } from '../charts/SimpleChart';
import SEO from '../content/SEO';
import Alert from '../ui/Alert';

const Analytics = () => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [businessMetrics, setBusinessMetrics] = useState({
    totalClients: 0,
    activeClients: 0,
    totalSessions: 0,
    recentInquiries: 0,
    conversionRate: 0
  });
  const [recentContacts, setRecentContacts] = useState([]);
  const [sessionStats, setSessionStats] = useState([]);

  // Helper function to format GA4 dates (YYYYMMDD format)
  const formatGA4Date = (dateString, format = 'long') => {
    if (!dateString || dateString.length !== 8) return 'Invalid Date';

    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);

    // Use UTC to avoid timezone conversion issues
    const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));

    if (format === 'short') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  };
  const [firebaseAnalytics, setFirebaseAnalytics] = useState(null);
  const [_realtimeUsers, setRealtimeUsers] = useState(0);
  const [_conversionFunnel, setConversionFunnel] = useState(null);
  const [dataSource, setDataSource] = useState('mock');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  const showMessage = useCallback((message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  }, []);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);

      // Load business metrics and Firebase Analytics data
      const [
        clientsData,
        sessionsData,
        contactsData,
        analyticsData,
        realtimeData,
        funnelData
      ] = await Promise.all([
        loadClientMetrics(),
        loadSessionMetrics(),
        loadContactMetrics(),
        getAnalyticsData(),
        getRealtimeData(),
        getConversionFunnelData()
      ]);

      setBusinessMetrics({
        totalClients: clientsData.total,
        activeClients: clientsData.active,
        totalSessions: sessionsData.total,
        recentInquiries: contactsData.recent,
        conversionRate: contactsData.conversionRate
      });

      setRecentContacts(contactsData.contacts);
      setSessionStats(sessionsData.stats);

      // Set Firebase Analytics data
      if (analyticsData.success) {
        setFirebaseAnalytics(analyticsData.data);
        setDataSource(analyticsData.source || 'real');
      } else {
        // Analytics not available - this is expected during construction
        setFirebaseAnalytics(null);
        setDataSource('unavailable');

        // Show friendly message instead of error
        if (analyticsData.source === 'unavailable') {
          showMessage('Website analytics are being set up and will be available soon!', 'info');
        }
      }

      setRealtimeUsers(realtimeData.activeUsers || 0);

      if (funnelData.success) {
        setConversionFunnel(funnelData.data);
      }

    } catch (error) {
      console.error('Error loading analytics data:', error);
      showMessage('Error loading analytics data', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'page_view', {
        page_title: 'Analytics Dashboard',
        page_location: window.location.href
      });
    }

    if (isAdmin) {
      loadAnalyticsData();
    }
  }, [isAdmin, loadAnalyticsData]);

  const loadClientMetrics = async () => {
    try {
      const { data: profiles, error } = await db.supabase
        .from('profiles')
        .select('id, profile_completed, created_at');

      if (error) throw error;

      const total = profiles?.length || 0;
      const active = profiles?.filter(p => p.profile_completed)?.length || 0;

      return { total, active };
    } catch (error) {
      console.error('Error loading client metrics:', error);
      return { total: 0, active: 0 };
    }
  };

  const loadSessionMetrics = async () => {
    try {
      const { data: sessions, error } = await db.supabase
        .from('sessions')
        .select('id, status, scheduled_date, session_type');

      if (error) throw error;

      const total = sessions?.length || 0;
      const stats = sessions?.reduce((acc, session) => {
        const status = session.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}) || {};

      return { total, stats };
    } catch (error) {
      console.error('Error loading session metrics:', error);
      return { total: 0, stats: {} };
    }
  };

  const loadContactMetrics = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: contacts, error } = await db.supabase
        .from('contact_submissions')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const recent = contacts?.length || 0;
      const converted = contacts?.filter(c => c.converted_to_client)?.length || 0;
      const conversionRate = recent > 0 ? Math.round((converted / recent) * 100) : 0;

      return {
        recent,
        conversionRate,
        contacts: contacts || []
      };
    } catch (error) {
      console.error('Error loading contact metrics:', error);
      return { recent: 0, conversionRate: 0, contacts: [] };
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin access to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Analytics Dashboard - Flores Dog Training"
        description="Business analytics and metrics dashboard for admin users."
        robots="noindex, nofollow"
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back to Dashboard */}
          <BackToDashboard />

          {showAlert && <Alert text={alertMessage} type={alertType} />}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600">Monitor your business performance and key metrics</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Unified Analytics Overview */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Business Overview</h2>
                    <p className="text-gray-600">Training business and website performance metrics</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      firebaseAnalytics && dataSource === 'real'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}>
                      {firebaseAnalytics && dataSource === 'real'
                        ? 'Live Data'
                        : 'Website Analytics Coming Soon'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Business Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <MetricCard
                  title="Total Clients"
                  value={businessMetrics.totalClients}
                  icon="👥"
                  color="blue"
                />
                <MetricCard
                  title="Active Clients"
                  value={businessMetrics.activeClients}
                  icon="✅"
                  color="green"
                />
                <MetricCard
                  title="Training Sessions"
                  value={businessMetrics.totalSessions}
                  icon="📚"
                  color="purple"
                />
                <MetricCard
                  title="Recent Inquiries"
                  value={businessMetrics.recentInquiries}
                  subtitle="Last 30 days"
                  icon="📧"
                  color="teal"
                />
                <MetricCard
                  title="Conversion Rate"
                  value={`${businessMetrics.conversionRate}%`}
                  icon="📈"
                  color="orange"
                />
              </div>

              {/* Website Analytics Row */}
              {firebaseAnalytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <MetricCard
                    title="Page Views"
                    value={firebaseAnalytics.summary.totalPageViews.toLocaleString()}
                    subtitle="Total visits"
                    icon="👁️"
                    color="indigo"
                  />
                  <MetricCard
                    title="Website Users"
                    value={firebaseAnalytics.summary.totalUsers.toLocaleString()}
                    subtitle="Unique visitors"
                    icon="🌐"
                    color="blue"
                  />
                  <MetricCard
                    title="Bounce Rate"
                    value={`${firebaseAnalytics.summary.bounceRate}%`}
                    subtitle="Single page visits"
                    icon="↩️"
                    color="yellow"
                  />
                  <MetricCard
                    title="Avg. Session"
                    value={`${Math.round(firebaseAnalytics.summary.avgSessionDuration / 60)}m`}
                    subtitle="Time on site"
                    icon="⏱️"
                    color="green"
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 mb-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🚧</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Website Analytics Under Construction</h3>
                    <p className="text-gray-600 mb-4">
                      Our advanced website analytics dashboard is currently being set up.
                      This section will be available soon with detailed visitor insights, page performance, and traffic analytics.
                    </p>
                    <div className="text-sm text-gray-500">
                      Check back soon for comprehensive website metrics!
                    </div>
                  </div>
                </div>
              )}

              {/* Unified Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Page Views Chart */}
                {firebaseAnalytics && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Website Traffic ({firebaseAnalytics.pageViews.length > 0 ?
                        `${formatGA4Date(firebaseAnalytics.pageViews[0]?.date)} - ${formatGA4Date(firebaseAnalytics.pageViews[firebaseAnalytics.pageViews.length - 1]?.date)}` :
                        'Last 30 Days'
                      })
                    </h3>
                    <LineChart
                      data={firebaseAnalytics.pageViews.slice(-7).map(d => ({
                        label: formatGA4Date(d.date, 'short'),
                        value: d.views
                      }))}
                      width={500}
                      height={250}
                    />
                  </div>
                )}

                {/* Top Pages */}
                {firebaseAnalytics && firebaseAnalytics.summary.topPages.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Pages</h3>
                    <div className="space-y-3">
                      {firebaseAnalytics.summary.topPages.slice(0, 5).map((page, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {page.page === '/' ? 'Homepage' : page.page}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${page.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="ml-4 text-sm text-gray-500">
                            {page.views} views
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Session Stats */}
              {Object.keys(sessionStats).length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Status Overview</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(sessionStats).map(([status, count]) => (
                      <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{count}</div>
                        <div className="text-sm text-gray-600 capitalize">{status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Contacts */}
              {recentContacts.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Contact Submissions</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentContacts.map((contact) => (
                          <tr key={contact.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {contact.first_name} {contact.last_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {contact.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                              {contact.program_interest || 'Not specified'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(contact.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                contact.converted_to_client
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {contact.converted_to_client ? 'Converted' : 'Lead'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    teal: 'bg-teal-50 border-teal-200 text-teal-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  return (
    <div className={`rounded-lg p-6 border-2 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
};

export default Analytics;
