import { supabase } from './client.js'
import { withErrorHandling } from './utils.js'

// Sessions
export const sessions = {
  getSessions: withErrorHandling('db.getSessions', (dogId) => 
    supabase.from('sessions').select('*').eq('dog_id', dogId).order('scheduled_date', { ascending: false })),
    
  getAllSessions: withErrorHandling('db.getAllSessions', () => 
    supabase.from('sessions').select(`
      *,
      dogs!inner(name, owner_id),
      profiles!dogs(first_name, last_name)
    `).order('scheduled_date', { ascending: false })),
    
  createSession: withErrorHandling('db.createSession', (data) => 
    supabase.from('sessions').insert([data])),
    
  updateSession: withErrorHandling('db.updateSession', (id, updates) => 
    supabase.from('sessions').update(updates).eq('id', id)),
    
  deleteSession: withErrorHandling('db.deleteSession', (id) => 
    supabase.from('sessions').delete().eq('id', id)),
    
  // Get sessions for current week
  getThisWeekSessions: withErrorHandling('db.getThisWeekSessions', () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);
    
    return supabase.from('sessions').select('id')
      .gte('scheduled_date', startOfWeek.toISOString())
      .lte('scheduled_date', endOfWeek.toISOString());
  })
}