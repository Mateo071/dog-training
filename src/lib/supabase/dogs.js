import { supabase } from './client.js'
import { withErrorHandling } from './utils.js'

// Dogs
export const dogs = {
  getDogs: withErrorHandling('db.getDogs', (ownerId) => 
    supabase.from('dogs').select(`
      id,
      owner_id,
      name,
      breed,
      birth_date,
      photo_url,
      photo_storage_path,
      behavioral_notes,
      medical_notes,
      training_goals,
      created_at,
      updated_at,
      training_analytics(*)
    `).eq('owner_id', ownerId)),
    
  getDogsWithOwners: withErrorHandling('db.getDogsWithOwners', () => 
    supabase.from('dogs_with_owners').select('*')),
    
  createDog: withErrorHandling('db.createDog', (data) => 
    supabase.from('dogs').insert([data])),
    
  updateDog: withErrorHandling('db.updateDog', (id, updates) => 
    supabase.from('dogs').update(updates).eq('id', id)),
    
  deleteDog: withErrorHandling('db.deleteDog', (id) => 
    supabase.from('dogs').delete().eq('id', id))
}