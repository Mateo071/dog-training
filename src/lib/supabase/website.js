import { supabase } from './client.js'
import { withErrorHandling } from './utils.js'

// Website Content Management
export const website = {
  // Get all website sections
  getWebsiteSections: withErrorHandling('db.getWebsiteSections', () => 
    supabase.from('website_sections').select('*').eq('is_active', true).order('sort_order')),
  
  // Get content by section key
  getWebsiteContentBySection: withErrorHandling('db.getWebsiteContentBySection', (sectionKey) => 
    supabase.rpc('get_website_content_by_section', { section_key_param: sectionKey })),
  
  // Get single content item (for single-type sections like hero, about_us)
  getWebsiteSingleContent: withErrorHandling('db.getWebsiteSingleContent', (sectionKey) => 
    supabase.rpc('get_website_single_content', { section_key_param: sectionKey })),
  
  // Get content with fields (admin view)
  getWebsiteContentWithFields: withErrorHandling('db.getWebsiteContentWithFields', (sectionId = null) => {
    let query = supabase.from('website_content').select(`
      *,
      website_sections!inner(section_key, display_name, section_type),
      website_content_fields(field_key, field_type, field_value, field_data)
    `);
    
    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }
    
    return query.order('sort_order');
  }),

  // Get single content item by ID with fields
  getWebsiteContentById: withErrorHandling('db.getWebsiteContentById', (contentId) => 
    supabase.from('website_content').select(`
      *,
      website_sections!inner(section_key, display_name, section_type),
      website_content_fields(field_key, field_type, field_value, field_data)
    `).eq('id', contentId).single()),
  
  // Create website section
  createWebsiteSection: withErrorHandling('db.createWebsiteSection', (data) => 
    supabase.from('website_sections').insert([data]).select().single()),
  
  // Update website section
  updateWebsiteSection: withErrorHandling('db.updateWebsiteSection', (id, updates) => 
    supabase.from('website_sections').update(updates).eq('id', id).select().single()),
  
  // Delete website section
  deleteWebsiteSection: withErrorHandling('db.deleteWebsiteSection', (id) => 
    supabase.from('website_sections').delete().eq('id', id)),
  
  // Create website content
  createWebsiteContent: withErrorHandling('db.createWebsiteContent', async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    return supabase.from('website_content').insert([{
      ...data,
      created_by: user?.id,
      updated_by: user?.id
    }]).select().single();
  }),
  
  // Update website content
  updateWebsiteContent: withErrorHandling('db.updateWebsiteContent', async (id, updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    return supabase.from('website_content').update({
      ...updates,
      updated_by: user?.id
    }).eq('id', id).select().single();
  }),
  
  // Delete website content
  deleteWebsiteContent: withErrorHandling('db.deleteWebsiteContent', (id) => 
    supabase.from('website_content').delete().eq('id', id)),
  
  // Upsert content field
  upsertWebsiteContentField: withErrorHandling('db.upsertWebsiteContentField', (contentId, fieldKey, fieldType, fieldValue, fieldData = {}) => 
    supabase.from('website_content_fields').upsert({
      content_id: contentId,
      field_key: fieldKey,
      field_type: fieldType,
      field_value: fieldValue,
      field_data: fieldData
    }, { onConflict: 'content_id,field_key' }).select().single()),
  
  // Delete content field
  deleteWebsiteContentField: withErrorHandling('db.deleteWebsiteContentField', (contentId, fieldKey) => 
    supabase.from('website_content_fields').delete().eq('content_id', contentId).eq('field_key', fieldKey)),
  
  // Bulk update content fields
  updateWebsiteContentFields: withErrorHandling('db.updateWebsiteContentFields', async (contentId, fields) => {
    // Delete existing fields for this content
    await supabase.from('website_content_fields').delete().eq('content_id', contentId);
    
    // Insert new fields
    const fieldsToInsert = Object.entries(fields).map(([fieldKey, fieldData]) => ({
      content_id: contentId,
      field_key: fieldKey,
      field_type: fieldData.type || 'text',
      field_value: fieldData.value || '',
      field_data: fieldData.data || {}
    }));
    
    if (fieldsToInsert.length > 0) {
      return supabase.from('website_content_fields').insert(fieldsToInsert).select();
    }
    
    return { data: [], error: null };
  }),
  
  // Helper function to create complete content with fields
  createWebsiteContentWithFields: withErrorHandling('db.createWebsiteContentWithFields', async (contentData, fields) => {
    // Create the content item
    const { data: content, error: contentError } = await website.createWebsiteContent(contentData);
    if (contentError) throw contentError;
    
    // Add the fields
    const { data: fieldsData, error: fieldsError } = await website.updateWebsiteContentFields(content.id, fields);
    if (fieldsError) throw fieldsError;
    
    return { data: { content, fields: fieldsData }, error: null };
  }),
  
  // Helper function to update complete content with fields
  updateWebsiteContentWithFields: withErrorHandling('db.updateWebsiteContentWithFields', async (contentId, contentData, fields) => {
    // Update the content item
    const { data: content, error: contentError } = await website.updateWebsiteContent(contentId, contentData);
    if (contentError) throw contentError;
    
    // Update the fields
    const { data: fieldsData, error: fieldsError } = await website.updateWebsiteContentFields(contentId, fields);
    if (fieldsError) throw fieldsError;
    
    return { data: { content, fields: fieldsData }, error: null };
  })
}