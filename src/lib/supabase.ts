import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface DatabaseHobby {
  id: string;
  user_id: string;
  title: string;
  category: string;
  icon: string;
  color_theme: string;
  last_brain_dump: string;
  micro_goal: string;
  notes: string;
  is_daily_focus: boolean;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseActivityLog {
  id: string;
  user_id: string;
  hobby_id: string | null;
  hobby_title: string;
  completed_at: string;
  brain_dump_snapshot: string;
  micro_goal_completed: string;
}
