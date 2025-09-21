import { supabase } from './client.js'
import { withErrorHandling } from './utils.js'

// Messages
export const messages = {
  getMessages: withErrorHandling('db.getMessages', (recipientId) => 
    supabase.from('messages').select('*').eq('recipient_id', recipientId).eq('status', 'sent').order('created_at', { ascending: false })),
    
  getMessagesWithReadStatus: withErrorHandling('db.getMessagesWithReadStatus', (recipientId) => 
    supabase.from('messages_with_read_status').select('*').eq('recipient_id', recipientId).eq('status', 'sent').order('created_at', { ascending: false })),
    
  createMessage: withErrorHandling('db.createMessage', (data) => 
    supabase.from('messages').insert([data])),
    
  markMessageAsRead: withErrorHandling('db.markMessageAsRead', async (messageId, userId) => {
    console.log('Supabase: Calling mark_message_read RPC with:', { 
      messageId, 
      userId,
      messageIdType: typeof messageId,
      userIdType: typeof userId 
    });
    
    // Use the stored procedure which has elevated permissions to bypass RLS
    const result = await supabase.rpc('mark_message_read', { 
      p_message_id: messageId, 
      p_user_id: userId 
    });
    
    console.log('Supabase: mark_message_read RPC result:', result);
    return result;
  }),
  
  // Message Templates
  getMessageTemplates: withErrorHandling('db.getMessageTemplates', () => 
    supabase.from('message_templates').select('*').eq('is_active', true).order('name')),
    
  getAllMessageTemplates: withErrorHandling('db.getAllMessageTemplates', () => 
    supabase.from('message_templates').select('*').order('name')),
    
  createMessageTemplate: withErrorHandling('db.createMessageTemplate', async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    return supabase.from('message_templates').insert([{
      ...data,
      created_by: user?.id
    }]);
  }),
  
  updateMessageTemplate: withErrorHandling('db.updateMessageTemplate', (id, updates) => 
    supabase.from('message_templates').update(updates).eq('id', id)),
    
  deleteMessageTemplate: withErrorHandling('db.deleteMessageTemplate', (id) => 
    supabase.from('message_templates').delete().eq('id', id)),
    
  // Message Read Receipts
  getMessageReadReceipts: withErrorHandling('db.getMessageReadReceipts', (messageId) =>
    supabase.from('message_read_receipts').select('*').eq('message_id', messageId)),
    
  createMessageReadReceipt: withErrorHandling('db.createMessageReadReceipt', (data) =>
    supabase.from('message_read_receipts').insert([data]))
}