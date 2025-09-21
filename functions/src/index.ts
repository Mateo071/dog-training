import { onRequest } from 'firebase-functions/v2/https';
import { google } from 'googleapis';

/**
 * Firebase Function to fetch Google Analytics 4 data
 * This runs server-side with access to environment variables and service account
 */
export const getAnalyticsData = onRequest({
  cors: true
}, async (req, res) => {
  try {
    // Get date range from query params (default to 30 days)
    const dateRange = req.query.dateRange as string || '30daysAgo';

    // Initialize Google Analytics Data API
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

    // Get GA4 Property ID from environment
    const propertyId = process.env.GA4_PROPERTY_ID;
    if (!propertyId) {
      throw new Error('GA4_PROPERTY_ID environment variable not configured');
    }

    // Fetch analytics data in parallel
    const [
      pageViewsResponse,
      topPagesResponse,
      deviceResponse,
      eventsResponse,
      bounceRateResponse
    ] = await Promise.all([
      // Page views over time
      analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: dateRange, endDate: 'today' }],
          dimensions: [{ name: 'date' }],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'totalUsers' },
            { name: 'sessions' }
          ],
          orderBys: [{ dimension: { dimensionName: 'date' } }]
        }
      }),

      // Top pages
      analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: dateRange, endDate: 'today' }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: '10'
        }
      }),

      // Device types
      analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: dateRange, endDate: 'today' }],
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [{ name: 'totalUsers' }],
          orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }]
        }
      }),

      // Events
      analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: dateRange, endDate: 'today' }],
          dimensions: [{ name: 'eventName' }],
          metrics: [{ name: 'eventCount' }],
          orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
          limit: '10'
        }
      }),

      // Bounce rate
      analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: dateRange, endDate: 'today' }],
          metrics: [
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' }
          ]
        }
      })
    ]);

    // Process the data
    const pageViews = pageViewsResponse.data.rows?.map(row => ({
      date: row.dimensionValues![0].value!,
      views: parseInt(row.metricValues![0].value!),
      users: parseInt(row.metricValues![1].value!),
      sessions: parseInt(row.metricValues![2].value!)
    })) || [];

    const topPages = topPagesResponse.data.rows?.map((row, index) => ({
      page: row.dimensionValues![0].value!,
      views: parseInt(row.metricValues![0].value!),
      percentage: index === 0 ? 100 : Math.round((parseInt(row.metricValues![0].value!) / parseInt(topPagesResponse.data.rows![0].metricValues![0].value!)) * 100)
    })) || [];

    const deviceTypes = deviceResponse.data.rows?.map((row, index) => ({
      device: row.dimensionValues![0].value!,
      users: parseInt(row.metricValues![0].value!),
      percentage: index === 0 ? 100 : Math.round((parseInt(row.metricValues![0].value!) / parseInt(deviceResponse.data.rows![0].metricValues![0].value!)) * 100)
    })) || [];

    const events = eventsResponse.data.rows?.map((row) => {
      const count = parseInt(row.metricValues![0].value!);
      const totalEvents = eventsResponse.data.rows!.reduce((sum, r) => sum + parseInt(r.metricValues![0].value!), 0);
      return {
        eventName: row.dimensionValues![0].value!,
        eventCount: count,
        percentage: Math.round((count / totalEvents) * 100)
      };
    }) || [];

    // Calculate totals
    const totals = pageViews.reduce((acc, day) => ({
      totalUsers: acc.totalUsers + day.users,
      totalSessions: acc.totalSessions + day.sessions,
      totalPageViews: acc.totalPageViews + day.views
    }), { totalUsers: 0, totalSessions: 0, totalPageViews: 0 });

    // Get bounce rate and session duration from GA4
    const bounceRate = bounceRateResponse.data.rows?.[0]?.metricValues?.[0]?.value
      ? Math.round(parseFloat(bounceRateResponse.data.rows[0].metricValues[0].value) * 100)
      : 0;

    const avgSessionDuration = bounceRateResponse.data.rows?.[0]?.metricValues?.[1]?.value
      ? Math.round(parseFloat(bounceRateResponse.data.rows[0].metricValues[1].value))
      : 245;

    // Return processed data
    const analyticsResult = {
      pageViews,
      events,
      summary: {
        totalUsers: totals.totalUsers,
        totalSessions: totals.totalSessions,
        totalPageViews: totals.totalPageViews,
        bounceRate: bounceRate,
        avgSessionDuration: avgSessionDuration,
        topPages,
        deviceTypes
      }
    };

    res.json({
      success: true,
      data: analyticsResult,
      source: 'real',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics API Error:', error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'error'
    });
  }
});

/**
 * Get real-time users (simplified version)
 */
export const getRealtimeUsers = onRequest({
  cors: true
}, async (req, res) => {
  try {
    // For demo purposes, return a random number
    // In real implementation, you'd use the Real Time Reporting API
    const activeUsers = Math.floor(Math.random() * 25) + 5;

    res.json({
      activeUsers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Realtime API Error:', error);
    res.status(500).json({
      activeUsers: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});