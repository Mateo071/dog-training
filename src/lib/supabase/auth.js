import { supabase } from './client.js'
import { withErrorHandling } from './utils.js'

// Helper functions for common operations
export const auth = {
  signUp: withErrorHandling('auth.signUp', (email, password, options = {}) => 
    supabase.auth.signUp({ email, password, options })),
  signIn: withErrorHandling('auth.signIn', (email, password) => 
    supabase.auth.signInWithPassword({ email, password })),
  signOut: withErrorHandling('auth.signOut', () => supabase.auth.signOut()),
  resetPassword: withErrorHandling('auth.resetPassword', (email) => 
    supabase.auth.resetPasswordForEmail(email)),
  getUser: withErrorHandling('auth.getUser', () => supabase.auth.getUser()),
  getSession: withErrorHandling('auth.getSession', () => supabase.auth.getSession()),
  onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback)
}