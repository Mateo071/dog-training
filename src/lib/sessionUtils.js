import { db } from './supabase';

/**
 * Checks if a session should be automatically marked as completed
 * Based on: current time >= scheduled_date + duration_minutes
 */
export const shouldSessionBeCompleted = (session) => {
  if (!session || session.status === 'completed' || session.status === 'cancelled') {
    return false;
  }

  const scheduledDate = new Date(session.scheduled_date);
  const durationMs = (session.duration_minutes || 60) * 60 * 1000; // Convert minutes to milliseconds
  const sessionEndTime = new Date(scheduledDate.getTime() + durationMs);
  const now = new Date();

  return now >= sessionEndTime;
};

/**
 * Updates sessions that should be automatically completed
 * Returns the number of sessions updated
 */
export const updateCompletedSessions = async (sessions) => {
  if (!sessions || sessions.length === 0) {
    return 0;
  }

  // Find sessions that should be completed
  const sessionsToComplete = sessions.filter(session => 
    shouldSessionBeCompleted(session) && 
    (session.status === 'scheduled' || session.status === 'confirmed')
  );

  if (sessionsToComplete.length === 0) {
    return 0;
  }

  try {
    // Update sessions in batches for better performance
    const sessionIds = sessionsToComplete.map(s => s.id);
    

    const { error } = await db.supabase
      .from('sessions')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .in('id', sessionIds);

    if (error) {
      console.error('Error auto-completing sessions:', error);
      return 0;
    }

    return sessionIds.length;

  } catch (error) {
    console.error('Error in updateCompletedSessions:', error);
    return 0;
  }
};

/**
 * Processes sessions and returns updated list with auto-completed sessions
 */
export const processSessionsForAutoCompletion = (sessions) => {
  return sessions.map(session => {
    if (shouldSessionBeCompleted(session) && 
        (session.status === 'scheduled' || session.status === 'confirmed')) {
      return {
        ...session,
        status: 'completed',
        updated_at: new Date().toISOString()
      };
    }
    return session;
  });
};