import { supabase } from './client.js'
import { withErrorHandling } from './utils.js'

// File Storage
export const storage = {
  // Dog photos
  uploadDogPhoto: withErrorHandling('db.uploadDogPhoto', (file, fileName) => 
    supabase.storage.from('dog-photos').upload(fileName, file)),
    
  getDogPhotoUrl: withErrorHandling('db.getDogPhotoUrl', (fileName) => 
    supabase.storage.from('dog-photos').getPublicUrl(fileName)),
    
  deleteDogPhoto: withErrorHandling('db.deleteDogPhoto', (fileName) => 
    supabase.storage.from('dog-photos').remove([fileName])),

  // Public media storage (website content)
  uploadPublicMedia: withErrorHandling('db.uploadPublicMedia', (fileData, section, fileName) => {
    const path = `website/${section}/${fileName}`;
    
    // Determine content type from file extension
    const ext = fileName.split('.').pop().toLowerCase();
    const contentTypeMap = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg', 
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'txt': 'text/plain'
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    
    return supabase.storage.from('public-media').upload(path, fileData, {
      contentType,
      cacheControl: '3600',
      upsert: true
    });
  }),
  
  getPublicMediaUrl: withErrorHandling('db.getPublicMediaUrl', (section, fileName) => {
    const path = `website/${section}/${fileName}`;
    return supabase.storage.from('public-media').getPublicUrl(path);
  }),
  
  deletePublicMedia: withErrorHandling('db.deletePublicMedia', (section, fileName) => {
    const path = `website/${section}/${fileName}`;
    return supabase.storage.from('public-media').remove([path]);
  }),
  
  listPublicMedia: withErrorHandling('db.listPublicMedia', (section = null) => {
    const folder = section ? `website/${section}` : 'website';
    return supabase.storage.from('public-media').list(folder);
  }),
  
  // Upload system assets (logos, icons, defaults)
  uploadSystemMedia: withErrorHandling('db.uploadSystemMedia', (file, type, fileName) => {
    const path = `system/${type}/${fileName}`;
    return supabase.storage.from('public-media').upload(path, file);
  }),
  
  getSystemMediaUrl: withErrorHandling('db.getSystemMediaUrl', (type, fileName) => {
    const path = `system/${type}/${fileName}`;
    return supabase.storage.from('public-media').getPublicUrl(path);
  }),
  
  // Profile photo storage
  uploadProfilePhoto: withErrorHandling('db.uploadProfilePhoto', async (file, fileName) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Get user role to determine folder
    const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
    const userType = profile?.role === 'admin' ? 'admins' : 'clients';
    
    const path = `${userType}/${user.id}/${fileName}`;
    return supabase.storage.from('profile-photos').upload(path, file, { upsert: true });
  }),
  
  getProfilePhotoUrl: withErrorHandling('db.getProfilePhotoUrl', async (userId, userRole = 'client') => {
    const userType = userRole === 'admin' ? 'admins' : 'clients';
    const path = `${userType}/${userId}/profile.jpg`;
    return supabase.storage.from('profile-photos').getPublicUrl(path);
  }),
  
  deleteProfilePhoto: withErrorHandling('db.deleteProfilePhoto', async (fileName) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
    const userType = profile?.role === 'admin' ? 'admins' : 'clients';
    
    const path = `${userType}/${user.id}/${fileName}`;
    return supabase.storage.from('profile-photos').remove([path]);
  }),
  
  // Legacy website media functions (for backward compatibility)
  uploadWebsiteMedia: withErrorHandling('db.uploadWebsiteMedia', (file, fileName) => 
    supabase.storage.from('public-media').upload(`website/general/${fileName}`, file)),
    
  getWebsiteMediaUrl: withErrorHandling('db.getWebsiteMediaUrl', (fileName) => 
    supabase.storage.from('public-media').getPublicUrl(`website/general/${fileName}`)),
    
  deleteWebsiteMedia: withErrorHandling('db.deleteWebsiteMedia', (fileName) => 
    supabase.storage.from('public-media').remove([`website/general/${fileName}`])),
    
  listWebsiteMedia: withErrorHandling('db.listWebsiteMedia', () => 
    supabase.storage.from('public-media').list('website'))
}