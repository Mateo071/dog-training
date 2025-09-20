/**
 * Firebase Analytics Data Retrieval Service
 *
 * This service retrieves real Google Analytics 4 data using the Google Analytics Data API.
 * It includes both real API implementations and fallback mock data for development.
 */

import { analytics } from '../configuration.jsx';

// Google Analytics Data API setup
let analyticsData = null;

// Initialize Google Analytics Data API (server-side only)
const initializeAnalyticsAPI = async () => {
  if (typeof window !== 'undefined') {
    // Client-side: Cannot use Google Analytics Data API directly for security reasons
    console.log('Google Analytics Data API not available on client-side. Using mock data.');
    return null;
  }

  try {
    // Only import googleapis on server-side (Node.js environment)
    const { google } = await import('googleapis');

    // Authentication setup
    let auth;

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Option 1: Use service account key file
      auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
      });
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      // Option 2: Use inline service account key (better for deployment)
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
      });
    } else {
      throw new Error('Google Analytics credentials not configured');
    }

    const authClient = await auth.getClient();
    analyticsData = google.analyticsdata({ version: 'v1beta', auth: authClient });

    return analyticsData;
  } catch (error) {
    console.error('Failed to initialize Google Analytics Data API:', error);
    return null;
  }
};

// Mock data generation removed - analytics will show "under construction" message instead

/**
 * Get real Google Analytics 4 data via Firebase Function
 */
const getRealAnalyticsData = async (dateRange = '30daysAgo') => {
  try {
    // Call Firebase Function instead of direct API
    const functionUrl = import.meta.env.DEV
      ? 'http://127.0.0.1:5002/flores-dog-training/us-central1/getAnalyticsData'
      : import.meta.env.VITE_ANALYTICS_FUNCTION_URL || 'https://us-central1-flores-dog-training.cloudfunctions.net/getAnalyticsData';

    const response = await fetch(`${functionUrl}?dateRange=${dateRange}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch analytics data');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching real analytics data:', error);
    throw error;
  }
};

/**
 * Get Firebase Analytics data (with fallback to mock data)
 */
export const getAnalyticsData = async (dateRange = '30daysAgo') => {
  try {
    if (!analytics) {
      throw new Error('Firebase Analytics not initialized');
    }

    // Try to get real data first
    try {
      const realData = await getRealAnalyticsData(dateRange);
      return {
        success: true,
        data: realData,
        source: 'real'
      };
    } catch (error) {
      console.log('Real analytics data not available, using mock data:', error.message);

      // Return construction message instead of mock data
      return {
        success: false,
        error: 'Analytics service is under construction. Real analytics will be available soon.',
        data: null,
        source: 'unavailable'
      };
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Get real-time active users via Firebase Function
 */
export const getRealtimeData = async () => {
  try {
    if (!analytics) {
      return { activeUsers: 0 };
    }

    // Try to call Firebase Function for real-time data
    try {
      const functionUrl = import.meta.env.DEV
        ? 'http://127.0.0.1:5002/flores-dog-training/us-central1/getRealtimeUsers'
        : import.meta.env.VITE_REALTIME_FUNCTION_URL || 'https://us-central1-flores-dog-training.cloudfunctions.net/getRealtimeUsers';

      const response = await fetch(functionUrl);
      if (response.ok) {
        const result = await response.json();
        return { activeUsers: result.activeUsers };
      }
    } catch (error) {
      console.log('Firebase Function not available, using simulated data');
    }

    // Return 0 when service is not available
    return {
      activeUsers: 0
    };
  } catch (error) {
    console.error('Error fetching realtime data:', error);
    return { activeUsers: 0 };
  }
};

/**
 * Get conversion funnel data
 */
export const getConversionFunnelData = async () => {
  try {
    if (!analytics) {
      throw new Error('Firebase Analytics not initialized');
    }

    // Simulated funnel data
    const funnelData = {
      steps: [
        { name: 'Page Views', count: 2340, percentage: 100 },
        { name: 'Contact Form Views', count: 456, percentage: 19.5 },
        { name: 'Form Submissions', count: 89, percentage: 3.8 },
        { name: 'Converted to Client', count: 23, percentage: 1.0 }
      ]
    };

    return {
      success: true,
      data: funnelData
    };
  } catch (error) {
    console.error('Error fetching conversion funnel:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/*
// Example of how you would implement real Google Analytics API calls:

// Note: googleapis import would be done dynamically in a server environment
// const { google } = await import('googleapis');

// const analytics = google.analyticsreporting('v4');

export const getRealAnalyticsData = async (viewId, dateRange = '30daysAgo') => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'path/to/service-account-key.json',
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const authClient = await auth.getClient();

    const response = await analytics.reports.batchGet({
      auth: authClient,
      requestBody: {
        reportRequests: [{
          viewId: viewId,
          dateRanges: [{ startDate: dateRange, endDate: 'today' }],
          metrics: [
            { expression: 'ga:sessions' },
            { expression: 'ga:users' },
            { expression: 'ga:pageviews' }
          ],
          dimensions: [{ name: 'ga:date' }]
        }]
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching real analytics data:', error);
    throw error;
  }
};
*/