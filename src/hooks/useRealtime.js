import { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useRealtimeMessages = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile) return;

    // Subscribe to new messages for this user
    const channel = db.supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${profile.id}`
        },
        (payload) => {
          const newMessage = payload.new;
          setMessages(prev => [newMessage, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification('New training message', {
              body: newMessage.subject,
              icon: '/favicon.ico'
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${profile.id}`
        },
        (payload) => {
          const updatedMessage = payload.new;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
          
          // Update unread count if message was marked as read
          if (updatedMessage.is_read && !payload.old.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      db.supabase.removeChannel(channel);
    };
  }, [profile]);

  return { messages, unreadCount, setMessages, setUnreadCount };
};

export const useRealtimeContactSubmissions = () => {
  const { isAdmin } = useAuth();
  const [newSubmissions, setNewSubmissions] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;

    // Subscribe to new contact form submissions
    const channel = db.supabase
      .channel('contact_submissions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contact_submissions'
        },
        (payload) => {
          const newSubmission = payload.new;
          setNewSubmissions(prev => [newSubmission, ...prev]);
          
          // Show browser notification
          if (Notification.permission === 'granted') {
            new Notification('New contact form submission', {
              body: `${newSubmission.first_name} ${newSubmission.last_name} submitted a request`,
              icon: '/favicon.ico'
            });
          }
        }
      )
      .subscribe();

    return () => {
      db.supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  return { newSubmissions, setNewSubmissions };
};

export const useNotificationPermission = () => {
  const [permission, setPermission] = useState(Notification.permission);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  return { permission, requestPermission };
};