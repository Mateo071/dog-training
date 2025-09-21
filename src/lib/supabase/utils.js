import { supabase } from './client.js'

// Enhanced error logging function
export const logSupabaseError = (operation, error, context = {}) => {
  console.group(`🚨 Supabase Error - ${operation}`)
  console.error('Error Details:', {
    message: error?.message,
    code: error?.code,
    status: error?.status,
    statusCode: error?.statusCode,
    details: error?.details,
    hint: error?.hint,
    originalError: error
  })
  console.error('Request Context:', {
    url: import.meta.env.VITE_SUPABASE_URL,
    timestamp: new Date().toISOString(),
    userAgent: navigator?.userAgent,
    ...context
  })
  
  // Special handling for 30403 errors
  if (error?.code === '30403' || error?.statusCode === 30403 || error?.message?.includes('30403')) {
    console.error('🔍 30403 Error Detected - Possible Causes:')
    console.error('• Row Level Security (RLS) policy blocking access')
    console.error('• Invalid or expired authentication token')
    console.error('• User does not have permission for this operation')
    console.error('• Database table/column permissions issue')
    console.error('• Supabase project configuration problem')
    
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        console.error('Session Error:', sessionError)
      } else if (!session) {
        console.error('No active session found - user may need to re-authenticate')
      } else {
        console.error('Current Session Info:', {
          userId: session.user?.id,
          email: session.user?.email,
          role: session.user?.user_metadata?.role || session.user?.app_metadata?.role,
          expiresAt: new Date(session.expires_at * 1000).toISOString(),
          isExpired: session.expires_at < Date.now() / 1000
        })
      }
    })
  }
  
  console.groupEnd()
  return error
}

// Enhanced helper function wrapper
export const withErrorHandling = (operation, fn) => {
  return async (...args) => {
    try {
      const result = await fn(...args)
      
      if (result.error) {
        logSupabaseError(operation, result.error, { args })
        
        // Special handling for 406 errors
        if (result.error.code === '406' || result.error.status === 406 || result.error.statusCode === 406) {
          console.error('🚨 406 Error Detected - Content negotiation issue');
          console.error('This usually means the API server cannot produce a response in the format requested by the client');
          console.error('Check Accept headers and API version compatibility');
        }
      }
      
      return result
    } catch (error) {
      logSupabaseError(operation, error, { args })
      
      // Handle network-level 406 errors
      if (error.status === 406) {
        console.error('🚨 Network-level 406 Error - Check API endpoint and headers');
      }
      
      throw error
    }
  }
}

// Debug utilities for troubleshooting 30403 errors
export const debugSupabase = {
  // Test basic connection and auth
  testConnection: async () => {
    console.group('🔍 Supabase Connection Test')
    
    try {
      // Test 1: Basic connection
      console.log('1. Testing basic connection...')
      const { error: healthError } = await supabase
        .from('system_settings')
        .select('count', { count: 'exact', head: true })
      
      if (healthError) {
        console.error('❌ Connection test failed:', healthError)
      } else {
        console.log('✅ Basic connection successful')
      }
      
      // Test 2: Auth status
      console.log('2. Checking authentication status...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ Auth check failed:', sessionError)
      } else if (!session) {
        console.log('⚠️ No active session - user not authenticated')
      } else {
        console.log('✅ User authenticated:', {
          userId: session.user.id,
          email: session.user.email,
          role: session.user.user_metadata?.role || session.user.app_metadata?.role,
          expiresAt: new Date(session.expires_at * 1000).toISOString(),
          isExpired: session.expires_at < Date.now() / 1000
        })
      }
      
      // Test 3: Simple query
      console.log('3. Testing simple query...')
      const { error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (profileError) {
        console.error('❌ Profile query failed:', profileError)
      } else {
        console.log('✅ Profile query successful')
      }
      
    } catch (error) {
      console.error('❌ Connection test failed with exception:', error)
    } finally {
      console.groupEnd()
    }
  },
  
  // Test RLS policies
  testRLS: async () => {
    console.group('🔒 RLS Policy Test')
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('❌ Cannot test RLS - no active session')
      console.groupEnd()
      return
    }
    
    const tables = ['profiles', 'dogs', 'sessions', 'messages', 'contact_submissions']
    
    for (const table of tables) {
      try {
        console.log(`Testing ${table}...`)
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1)
        
        if (error) {
          console.error(`❌ ${table}:`, error)
        } else {
          console.log(`✅ ${table}: Access granted`)
        }
      } catch (error) {
        console.error(`❌ ${table}: Exception:`, error)
      }
    }
    
    console.groupEnd()
  },
  
  // Enable verbose logging
  enableVerboseLogging: () => {
    console.log('🔊 Enabling verbose Supabase logging...')
    // Override console methods to catch all Supabase logs
    const originalLog = console.log
    const originalError = console.error
    
    console.log = (...args) => {
      if (args.some(arg => typeof arg === 'string' && arg.includes('supabase'))) {
        originalLog('🔹 SUPABASE LOG:', ...args)
      } else {
        originalLog(...args)
      }
    }
    
    console.error = (...args) => {
      if (args.some(arg => typeof arg === 'string' && (arg.includes('supabase') || arg.includes('30403')))) {
        originalError('🔺 SUPABASE ERROR:', ...args)
      } else {
        originalError(...args)
      }
    }
  }
}

// Add a specific function to test 406 error resolution
debugSupabase.test406Fix = async () => {
  console.group('🔧 Testing 406 Error Fix')
  
  try {
    // Test with a sample user ID (if available)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) {
      console.log('❌ No user session available for testing')
      console.groupEnd()
      return
    }
    
    console.log('Testing with user ID:', session.user.id)
    
    // Import specific modules to test them
    const { users } = await import('./users.js')
    
    // Test getUser function
    console.log('1. Testing getUser...')
    const userResult = await users.getUser(session.user.id)
    console.log('getUser result:', userResult.error ? '❌' : '✅', userResult.error || 'Success')
    
    // Test getProfile function  
    console.log('2. Testing getProfile...')
    const profileResult = await users.getProfile(session.user.id)
    console.log('getProfile result:', profileResult.error ? '❌' : '✅', profileResult.error || 'Success')
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error)
  } finally {
    console.groupEnd()
  }
}

// Make debug utilities available globally in development
if (import.meta.env.DEV) {
  window.debugSupabase = debugSupabase
}