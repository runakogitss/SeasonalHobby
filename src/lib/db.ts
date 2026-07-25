import { supabase } from './supabase';
import { Hobby, ActivityLog } from './storage';

export async function fetchHobbiesFromDb(userId: string): Promise<Hobby[]> {
  const { data, error } = await supabase
    .from('hobbies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching hobbies from Supabase:', error.message);
    throw new Error(error.message);
  }

  return (data || []).map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    icon: item.icon || 'gamepad',
    color_theme: item.color_theme || 'purple',
    last_brain_dump: item.last_brain_dump || '',
    micro_goal: item.micro_goal || '',
    notes: item.notes || '',
    is_daily_focus: item.is_daily_focus ?? false,
    progress: item.progress ?? 0,
    created_at: item.created_at,
    updated_at: item.updated_at
  }));
}

export async function addHobbyToDb(userId: string, hobby: Omit<Hobby, 'id' | 'created_at' | 'updated_at'>): Promise<Hobby> {
  const { data, error } = await supabase
    .from('hobbies')
    .insert([
      {
        user_id: userId,
        title: hobby.title,
        category: hobby.category,
        icon: hobby.icon,
        color_theme: hobby.color_theme,
        last_brain_dump: hobby.last_brain_dump,
        micro_goal: hobby.micro_goal,
        notes: hobby.notes,
        is_daily_focus: hobby.is_daily_focus,
        progress: hobby.progress
      }
    ])
    .select()
    .single();

  if (error) {
    if (error.message.includes('Decision paralysis threshold reached')) {
      throw new Error('Decision paralysis threshold reached. Maximum 2 items allowed.');
    }
    throw new Error(error.message);
  }

  return {
    id: data.id,
    title: data.title,
    category: data.category,
    icon: data.icon,
    color_theme: data.color_theme,
    last_brain_dump: data.last_brain_dump || '',
    micro_goal: data.micro_goal || '',
    notes: data.notes || '',
    is_daily_focus: data.is_daily_focus,
    progress: data.progress,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

export async function updateHobbyInDb(hobby: Hobby): Promise<void> {
  const { error } = await supabase
    .from('hobbies')
    .update({
      title: hobby.title,
      category: hobby.category,
      icon: hobby.icon,
      color_theme: hobby.color_theme,
      last_brain_dump: hobby.last_brain_dump,
      micro_goal: hobby.micro_goal,
      notes: hobby.notes,
      is_daily_focus: hobby.is_daily_focus,
      progress: hobby.progress,
      updated_at: new Date().toISOString()
    })
    .eq('id', hobby.id);

  if (error) {
    if (error.message.includes('Decision paralysis threshold reached')) {
      throw new Error('Decision paralysis threshold reached. Maximum 2 items allowed.');
    }
    throw new Error(error.message);
  }
}

export async function toggleDailyFocusInDb(hobby: Hobby): Promise<void> {
  const nextFocus = !hobby.is_daily_focus;
  const { error } = await supabase
    .from('hobbies')
    .update({
      is_daily_focus: nextFocus,
      updated_at: new Date().toISOString()
    })
    .eq('id', hobby.id);

  if (error) {
    if (error.message.includes('Decision paralysis threshold reached')) {
      throw new Error('Decision paralysis threshold reached. Maximum 2 items allowed.');
    }
    throw new Error(error.message);
  }
}

export async function deleteHobbyFromDb(hobbyId: string): Promise<void> {
  const { error } = await supabase
    .from('hobbies')
    .delete()
    .eq('id', hobbyId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchActivityLogsFromDb(userId: string): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching activity logs from Supabase:', error.message);
    throw new Error(error.message);
  }

  return (data || []).map((item) => ({
    id: item.id,
    hobby_id: item.hobby_id,
    hobby_title: item.hobby_title,
    completed_at: item.completed_at,
    brain_dump_snapshot: item.brain_dump_snapshot || '',
    micro_goal_completed: item.micro_goal_completed || ''
  }));
}

export async function markHobbyGoalCompletedInDb(
  userId: string,
  hobby: Hobby,
  nextBrainDump: string,
  nextMicroGoal: string,
  nextNotes: string
): Promise<void> {
  // 1. Insert into activity logs (DB trigger automatically increases progress on hobbies by +10%)
  const { error: logError } = await supabase
    .from('activity_logs')
    .insert([
      {
        user_id: userId,
        hobby_id: hobby.id,
        hobby_title: hobby.title,
        completed_at: new Date().toISOString().split('T')[0],
        brain_dump_snapshot: hobby.last_brain_dump,
        micro_goal_completed: hobby.micro_goal
      }
    ]);

  if (logError) {
    throw new Error(logError.message);
  }

  // 2. Update next brain dump, micro goal, and notes on hobby card
  const { error: hobbyError } = await supabase
    .from('hobbies')
    .update({
      last_brain_dump: nextBrainDump,
      micro_goal: nextMicroGoal,
      notes: nextNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', hobby.id);

  if (hobbyError) {
    throw new Error(hobbyError.message);
  }
}

export async function fetchUserStreakFromDb(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_user_current_streak', {
      target_user_id: userId
    });

    if (error) {
      console.warn('RPC streak error (falling back to 0):', error.message);
      return 0;
    }

    return typeof data === 'number' ? data : 0;
  } catch (err) {
    return 0;
  }
}

export async function fetchAnalyticsDashboardFromDb(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_hobby_analytics_dashboard')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (err) {
    return null;
  }
}
