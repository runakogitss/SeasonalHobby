-- Initialize custom system enums
CREATE TYPE season_type AS ENUM ('summer', 'winter');
-- Primary Hobbies Registry
CREATE TABLE hobbies (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
 title VARCHAR(100) NOT NULL,
 category VARCHAR(50) NOT NULL,
 season season_type NOT NULL DEFAULT 'summer',
 icon VARCHAR(50) DEFAULT 'gamepad',
 color_theme VARCHAR(30) DEFAULT 'purple',
 last_brain_dump TEXT,
 micro_goal TEXT,
 notes TEXT,
 is_daily_focus BOOLEAN DEFAULT FALSE,
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
CREATE INDEX idx_hobbies_user_season ON hobbies(user_id, season);
CREATE INDEX idx_hobbies_category ON hobbies(category);
CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, completed_at DESC);
