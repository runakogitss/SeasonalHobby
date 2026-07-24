-- SQL schema for Seasonal Hobby App

-- Primary Hobbies Registry
CREATE TABLE hobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  icon VARCHAR(50) DEFAULT 'gamepad',
  color_theme VARCHAR(30) DEFAULT 'purple',
  last_brain_dump TEXT,
  micro_goal TEXT,
  notes TEXT,
  is_daily_focus BOOLEAN DEFAULT FALSE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historical Activity Log Ledger
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hobby_id UUID REFERENCES hobbies(id) ON DELETE SET NULL,
  hobby_title VARCHAR(100) NOT NULL,
  completed_at DATE DEFAULT CURRENT_DATE NOT NULL,
  brain_dump_snapshot TEXT,
  micro_goal_completed TEXT
);

-- Optimization Performance Indices
CREATE INDEX idx_hobbies_user ON hobbies(user_id);
CREATE INDEX idx_hobbies_category ON hobbies(category);
CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, completed_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Row Level Security (RLS) Policies
CREATE POLICY "Users can manage their own hobbies" ON hobbies
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own activity logs" ON activity_logs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Decision Paralysis Safeguard Trigger (Max 2 daily focus hobbies)
CREATE OR REPLACE FUNCTION check_daily_focus_limit()
RETURNS TRIGGER AS $$
DECLARE
  focus_count INTEGER;
BEGIN
  IF NEW.is_daily_focus = TRUE THEN
    SELECT COUNT(*) INTO focus_count
    FROM hobbies
    WHERE user_id = NEW.user_id 
      AND is_daily_focus = TRUE 
      AND id != NEW.id;
      
    IF focus_count >= 2 THEN
      RAISE EXCEPTION 'Decision paralysis threshold reached. Maximum 2 daily focus hobbies allowed.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_daily_focus_limit
BEFORE INSERT OR UPDATE ON hobbies
FOR EACH ROW
EXECUTE FUNCTION check_daily_focus_limit();

-- Auto-Increment Hobby Progress Trigger
CREATE OR REPLACE FUNCTION update_hobby_progress_on_log()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE hobbies
  SET progress = LEAST(progress + 10, 100),
      updated_at = NOW()
  WHERE id = NEW.hobby_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_hobby_progress
AFTER INSERT ON activity_logs
FOR EACH ROW
EXECUTE FUNCTION update_hobby_progress_on_log();

-- User Consecutive Daily Streak Calculator UDF
CREATE OR REPLACE FUNCTION get_user_current_streak(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_streak_count INTEGER := 0;
BEGIN
  WITH logged_days AS (
    SELECT DISTINCT completed_at
    FROM activity_logs
    WHERE user_id = target_user_id
  ),
  day_differences AS (
    SELECT 
      completed_at,
      completed_at - (ROW_NUMBER() OVER (ORDER BY completed_at DESC) * INTERVAL '1 day') as group_date
    FROM logged_days
  ),
  streak_groups AS (
    SELECT 
      MIN(completed_at) as start_date, 
      MAX(completed_at) as end_date, 
      COUNT(*) as streak_length
    FROM day_differences
    GROUP BY group_date
  )
  SELECT COALESCE(streak_length, 0) INTO current_streak_count
  FROM streak_groups
  -- Verify the streak includes today or yesterday
  WHERE end_date >= CURRENT_DATE - INTERVAL '1 day'
  ORDER BY end_date DESC
  LIMIT 1;

  RETURN COALESCE(current_streak_count, 0);
END;
$$ LANGUAGE plpgsql;

-- High-Performance Dashboard Analytics View
CREATE OR REPLACE VIEW user_hobby_analytics_dashboard AS
SELECT 
  u.id AS user_id,
  COUNT(h.id) AS total_hobbies,
  COUNT(CASE WHEN h.is_daily_focus THEN 1 END) AS active_focus_hobbies,
  COALESCE(ROUND(AVG(h.progress)), 0) AS average_progress,
  (SELECT COUNT(*) FROM activity_logs al WHERE al.user_id = u.id) AS total_logged_sessions
FROM auth.users u
LEFT JOIN hobbies h ON h.user_id = u.id
GROUP BY u.id;