export interface Hobby {
  id: string;
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

export interface ActivityLog {
  id: string;
  hobby_id: string | null;
  hobby_title: string;
  completed_at: string; // ISO date string (YYYY-MM-DD)
  brain_dump_snapshot: string;
  micro_goal_completed: string;
}

const DEFAULT_SUMMER_HOBBIES: Hobby[] = [
  {
    id: 's1',
    title: 'Gaming',
    category: 'gaming',
    icon: 'gamepad',
    color_theme: 'purple',
    last_brain_dump: 'Exploring the ocean depths and running my sushi restaurant.',
    micro_goal: 'Catch more rare fish for the Bestiary.',
    notes: 'Need to upgrade harpoon and hire more staff.',
    is_daily_focus: true,
    progress: 60,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 's2',
    title: 'Music',
    category: 'music',
    icon: 'music',
    color_theme: 'green',
    last_brain_dump: 'Practicing fingerpicking pattern in C major.',
    micro_goal: 'Practice for 10 minutes before bed.',
    notes: 'Focus on clean transitions between Chord C and G.',
    is_daily_focus: true,
    progress: 40,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 's3',
    title: 'Reading',
    category: 'reading',
    icon: 'book',
    color_theme: 'orange',
    last_brain_dump: 'Reading Chapter 7: Riddles in the Dark.',
    micro_goal: 'Read Chapter 8 today.',
    notes: "Keep track of Bilbo's riddle answers.",
    is_daily_focus: false,
    progress: 30,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 's4',
    title: 'Language',
    category: 'language',
    icon: 'languages',
    color_theme: 'blue',
    last_brain_dump: 'Learned 〜ます form and 15 new vocabulary words.',
    micro_goal: 'Review 10 new words.',
    notes: 'Focus on Kanji characters for week days.',
    is_daily_focus: false,
    progress: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DEFAULT_WINTER_HOBBIES: Hobby[] = [
  {
    id: 'w1',
    title: 'Rust Coding',
    category: 'coding',
    icon: 'code',
    color_theme: 'blue',
    last_brain_dump: 'Finished understanding lifetimes and ownership principles.',
    micro_goal: 'Build a CLI tool that parses arguments.',
    notes: 'Use clap library for command line arguments parsing.',
    is_daily_focus: true,
    progress: 20,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'w2',
    title: 'Skiing Prep',
    category: 'sports',
    icon: 'activity',
    color_theme: 'green',
    last_brain_dump: 'Completed core strength exercises and cardio routines.',
    micro_goal: 'Do 15 squats and 5 minutes of core stretch.',
    notes: 'Keep posture straight.',
    is_daily_focus: false,
    progress: 75,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'w3',
    title: 'Baking Bread',
    category: 'cooking',
    icon: 'utensils',
    color_theme: 'orange',
    last_brain_dump: 'Baked a sourdough boule, crust was good but crumb was too dense.',
    micro_goal: 'Adjust hydration to 75% for next dough.',
    notes: 'Let it proof for 30 minutes longer in second phase.',
    is_daily_focus: false,
    progress: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DEFAULT_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'l1',
    hobby_id: 's1',
    hobby_title: 'Gaming',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0], // yesterday
    brain_dump_snapshot: 'Beat the first boss in Dave the Diver.',
    micro_goal_completed: 'Gather ingredients for the opening night menu.'
  },
  {
    id: 'l2',
    hobby_id: 's2',
    hobby_title: 'Music',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0], // yesterday
    brain_dump_snapshot: 'Learned C and G chords on Guitar.',
    micro_goal_completed: 'Strum each chord 20 times cleanly.'
  },
  {
    id: 'l3',
    hobby_id: 's3',
    hobby_title: 'Reading',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString().split('T')[0], // 2 days ago
    brain_dump_snapshot: 'Started Reading The Hobbit.',
    micro_goal_completed: 'Read Chapter 1.'
  }
];

// Helper to check for client side
const isClient = () => typeof window !== 'undefined';

export function isSandboxModeActive(): boolean {
  if (isClient()) {
    return localStorage.getItem('sandbox-mode-enabled') === 'true';
  }
  return false;
}

const getHobbiesStorageKey = () => isSandboxModeActive() ? 'seasonal-hobbies-sandbox' : 'seasonal-hobbies';

export function getHobbies(): Hobby[] {
  if (!isClient()) return [...DEFAULT_SUMMER_HOBBIES, ...DEFAULT_WINTER_HOBBIES];
  
  const key = getHobbiesStorageKey();
  const saved = localStorage.getItem(key);
  if (!saved) {
    const defaultData = isSandboxModeActive() ? [] : [...DEFAULT_SUMMER_HOBBIES, ...DEFAULT_WINTER_HOBBIES];
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  
  return JSON.parse(saved);
}

export function saveHobbies(hobbies: Hobby[]) {
  if (isClient()) {
    localStorage.setItem(getHobbiesStorageKey(), JSON.stringify(hobbies));
  }
}

export function toggleDailyFocus(hobbyId: string): Hobby[] {
  const hobbies = getHobbies();
  const index = hobbies.findIndex(h => h.id === hobbyId);
  if (index === -1) return hobbies;

  const target = hobbies[index];

  // If turning ON daily focus, enforce the rule: Max 2 active hobbies total
  if (!target.is_daily_focus) {
    const activeCount = hobbies.filter(h => h.is_daily_focus).length;
    if (activeCount >= 2) {
      throw new Error('Decision paralysis threshold reached. Maximum 2 items allowed.');
    }
  }

  hobbies[index] = {
    ...target,
    is_daily_focus: !target.is_daily_focus,
    updated_at: new Date().toISOString()
  };

  saveHobbies(hobbies);
  return [...hobbies];
}

export function addHobby(hobby: Omit<Hobby, 'id' | 'created_at' | 'updated_at'>): Hobby {
  const hobbies = getHobbies();
  
  // Enforce daily focus limit on addition if selected
  if (hobby.is_daily_focus) {
    const activeCount = hobbies.filter(h => h.is_daily_focus).length;
    if (activeCount >= 2) {
      throw new Error('Decision paralysis threshold reached. Maximum 2 items allowed.');
    }
  }

  const newHobby: Hobby = {
    ...hobby,
    id: 'h_' + Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  hobbies.push(newHobby);
  saveHobbies(hobbies);
  return newHobby;
}

export function updateHobby(hobby: Hobby): Hobby[] {
  const hobbies = getHobbies();
  const index = hobbies.findIndex(h => h.id === hobby.id);
  if (index === -1) return hobbies;

  // Enforce daily focus limit if switching is_daily_focus to true
  if (hobby.is_daily_focus && !hobbies[index].is_daily_focus) {
    const activeCount = hobbies.filter(h => h.is_daily_focus).length;
    if (activeCount >= 2) {
      throw new Error('Decision paralysis threshold reached. Maximum 2 items allowed.');
    }
  }

  hobbies[index] = {
    ...hobby,
    updated_at: new Date().toISOString()
  };

  saveHobbies(hobbies);
  return [...hobbies];
}

export function deleteHobby(hobbyId: string): Hobby[] {
  const hobbies = getHobbies();
  const filtered = hobbies.filter(h => h.id !== hobbyId);
  saveHobbies(filtered);
  
  // Clean up logs belonging to this hobby by setting their hobby_id to null (referential integrity)
  const logs = getActivityLogs();
  const updatedLogs = logs.map(l => l.hobby_id === hobbyId ? { ...l, hobby_id: null } : l);
  saveActivityLogs(updatedLogs);
  
  return filtered;
}

const getLogsStorageKey = () => isSandboxModeActive() ? 'seasonal-activity-logs-sandbox' : 'seasonal-activity-logs';

export function getActivityLogs(): ActivityLog[] {
  if (!isClient()) return DEFAULT_ACTIVITY_LOGS;
  
  const key = getLogsStorageKey();
  const saved = localStorage.getItem(key);
  if (!saved) {
    const defaultData = isSandboxModeActive() ? [] : DEFAULT_ACTIVITY_LOGS;
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  
  return JSON.parse(saved);
}

export function saveActivityLogs(logs: ActivityLog[]) {
  if (isClient()) {
    localStorage.setItem(getLogsStorageKey(), JSON.stringify(logs));
  }
}

export function markHobbyGoalCompleted(
  hobbyId: string, 
  nextBrainDump: string, 
  nextMicroGoal: string, 
  nextNotes: string
): { hobbies: Hobby[]; logs: ActivityLog[] } {
  const hobbies = getHobbies();
  const index = hobbies.findIndex(h => h.id === hobbyId);
  if (index === -1) throw new Error('Hobby not found');

  const hobby = hobbies[index];

  // 1. Create activity log entry
  const newLog: ActivityLog = {
    id: 'l_' + Math.random().toString(36).substr(2, 9),
    hobby_id: hobby.id,
    hobby_title: hobby.title,
    completed_at: new Date().toISOString().split('T')[0], // YYYY-MM-DD local time
    brain_dump_snapshot: hobby.last_brain_dump,
    micro_goal_completed: hobby.micro_goal
  };

  const logs = getActivityLogs();
  logs.unshift(newLog); // Prepend to show most recent first
  saveActivityLogs(logs);

  // 2. Update progress (+10%, cap at 100) and goals
  const nextProgress = Math.min(hobby.progress + 10, 100);

  hobbies[index] = {
    ...hobby,
    progress: nextProgress,
    last_brain_dump: nextBrainDump,
    micro_goal: nextMicroGoal,
    notes: nextNotes,
    updated_at: new Date().toISOString()
  };

  saveHobbies(hobbies);

  return { hobbies: [...hobbies], logs: [...logs] };
}

// Group logs dynamically by day of the week
export function groupLogsByDay(logs: ActivityLog[]): Record<string, ActivityLog[]> {
  return logs.reduce((acc, log) => {
    // Parse completed_at which is in format YYYY-MM-DD
    const date = new Date(log.completed_at + 'T00:00:00');
    
    // Format options: "Monday, Oct 18" or just "Monday" as per user needs.
    // Let's use "Monday, July 18" to display logs nicely!
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    
    if (!acc[dayName]) {
      acc[dayName] = [];
    }
    acc[dayName].push(log);
    return acc;
  }, {} as Record<string, ActivityLog[]>);
}
