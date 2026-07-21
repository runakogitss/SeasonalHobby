/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useSeason } from '@/context/SeasonContext';
import { 
  getHobbies, 
  getActivityLogs, 
  toggleDailyFocus, 
  addHobby, 
  updateHobby, 
  deleteHobby, 
  markHobbyGoalCompleted, 
  Hobby, 
  ActivityLog,
  isSandboxModeActive
} from '@/lib/storage';
import Sidebar from '@/components/Sidebar';
import HobbyCard from '@/components/HobbyCard';
import HobbyDetailModal from '@/components/HobbyDetailModal';
import EditHobbyModal from '@/components/EditHobbyModal';
import JournalView from '@/components/JournalView';
import StatsView from '@/components/StatsView';
import SettingsView from '@/components/SettingsView';
import AIAssistant from '@/components/AIAssistant';
import StellaSuggestionsModal from '@/components/StellaSuggestionsModal';
import { 
  Plus, 
  Sparkles, 
  Menu, 
  User, 
  Target, 
  ListPlus, 
  AlertTriangle,
  X,
  Compass
} from 'lucide-react';

export default function Home() {
  const { season } = useSeason();
  
  // App States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [userName, setUserName] = useState('Reynard');
  
  // Modal States
  const [selectedHobby, setSelectedHobby] = useState<Hobby | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  
  // Mobile Nav/Sidebar States
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // AI Panel Drawer State
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  // Category filter state for Dashboard
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Error/Toast State
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Sandbox Mode State
  const [isSandbox, setIsSandbox] = useState(false);

  // Load datasets on mount and active userName
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mode = localStorage.getItem('sandbox-mode-enabled') === 'true';
      setIsSandbox(mode);
    }
    setHobbies(getHobbies());
    setLogs(getActivityLogs());

    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('settings-user-name');
      if (savedName) setUserName(savedName);
    }
  }, []);

  const handleToggleSandbox = () => {
    const nextSandbox = !isSandbox;
    localStorage.setItem('sandbox-mode-enabled', String(nextSandbox));
    setIsSandbox(nextSandbox);
    // Reload state after mode toggle
    setHobbies(getHobbies());
    setLogs(getActivityLogs());
    showToast(nextSandbox ? "Switched to clean Sandbox Mode (0 hobbies)!" : "Switched to Standard Mode (Seeded hobbies)!");
  };

  // Listen for storage or config changes (like name change in settings)
  useEffect(() => {
    if (activeTab !== 'settings') {
      if (typeof window !== 'undefined') {
        const savedName = localStorage.getItem('settings-user-name');
        if (savedName) setUserName(savedName);
      }
    }
  }, [activeTab]);

  const showToast = (message: string) => {
    setErrorToast(message);
    setTimeout(() => setErrorToast(null), 5000);
  };

  // State Mutators
  const handleToggleFocus = (id: string) => {
    try {
      const updated = toggleDailyFocus(id);
      setHobbies(updated);
    } catch (error: any) {
      showToast(error.message);
    }
  };

  const handleSelectSuggestedCustomize = (suggested: any) => {
    setSelectedHobby({
      id: '', // Empty means new hobby
      title: suggested.title,
      category: suggested.category,
      icon: suggested.icon,
      color_theme: suggested.color_theme,
      last_brain_dump: suggested.last_brain_dump,
      micro_goal: suggested.micro_goal,
      notes: suggested.notes,
      is_daily_focus: false,
      progress: 0,
      season: season,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setIsSuggestionsOpen(false);
    setIsEditOpen(true);
  };

  const handleSelectSuggestedDirect = (suggested: any) => {
    try {
      addHobby({
        title: suggested.title,
        category: suggested.category,
        season: season,
        icon: suggested.icon,
        color_theme: suggested.color_theme,
        last_brain_dump: suggested.last_brain_dump,
        micro_goal: suggested.micro_goal,
        notes: suggested.notes,
        is_daily_focus: false,
        progress: 0
      });
      setHobbies(getHobbies());
      setIsSuggestionsOpen(false);
      showToast(`Hobby "${suggested.title}" successfully added by Stella!`);
    } catch (error: any) {
      showToast(error.message);
    }
  };

  const handleSaveHobby = (hobbyData: any) => {
    try {
      if (hobbyData.id) {
        // Editing existing
        const updated = updateHobby(hobbyData as Hobby);
        setHobbies(updated);
      } else {
        // Adding new
        const newHobbyData = {
          title: hobbyData.title,
          category: hobbyData.category,
          season: season, // Attach current season automatically
          icon: hobbyData.icon,
          color_theme: hobbyData.color_theme,
          last_brain_dump: hobbyData.last_brain_dump,
          micro_goal: hobbyData.micro_goal,
          notes: hobbyData.notes,
          is_daily_focus: hobbyData.is_daily_focus,
          progress: hobbyData.progress || 0
        };
        addHobby(newHobbyData);
        setHobbies(getHobbies());
      }
      setIsEditOpen(false);
      setSelectedHobby(null);
    } catch (error: any) {
      showToast(error.message);
    }
  };

  const handleDeleteHobby = (id: string) => {
    const updated = deleteHobby(id);
    setHobbies(updated);
    setLogs(getActivityLogs()); // Reload logs since references might clear
    setIsDetailOpen(false);
    setIsEditOpen(false);
    setSelectedHobby(null);
  };

  const handleMarkGoalDone = (id: string, nextDump: string, nextGoal: string, nextNotes: string) => {
    try {
      const result = markHobbyGoalCompleted(id, nextDump, nextGoal, nextNotes);
      setHobbies(result.hobbies);
      setLogs(result.logs);
      setIsDetailOpen(false);
      setSelectedHobby(null);
    } catch (error: any) {
      showToast(error.message);
    }
  };

  const handleResetData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('seasonal-hobbies');
      localStorage.removeItem('seasonal-activity-logs');
      setHobbies(getHobbies());
      setLogs(getActivityLogs());
      setCategoryFilter('all');
    }
  };

  const handleApplyMicroGoal = (hobbyTitle: string, newMicroGoal: string) => {
    const list = getHobbies();
    const index = list.findIndex(h => h.title.toLowerCase() === hobbyTitle.toLowerCase() && h.season === season);
    
    if (index !== -1) {
      list[index] = {
        ...list[index],
        micro_goal: newMicroGoal,
        updated_at: new Date().toISOString()
      };
      updateHobby(list[index]);
      setHobbies(getHobbies());
    } else {
      showToast(`Hobby "${hobbyTitle}" not found in current season to apply micro-goal.`);
    }
  };

  // Get active hobbies for the current season
  const currentSeasonHobbies = hobbies.filter(h => h.season === season);
  
  // Filtered hobbies list for Dashboard
  const dashboardFilteredHobbies = currentSeasonHobbies.filter(h => {
    if (categoryFilter === 'all') return true;
    return h.category === categoryFilter;
  });

  // Extract unique categories for filter chips
  const uniqueCategories = Array.from(new Set(currentSeasonHobbies.map(h => h.category)));

  // Today's focus items (Max 2)
  const todayFocusItems = currentSeasonHobbies.filter(h => h.is_daily_focus);

  // Dropdown list for adding focus items easily
  const nonFocusHobbies = currentSeasonHobbies.filter(h => !h.is_daily_focus);

  // Greeting Message depending on Season
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = "Good afternoon";
    if (hour < 12) timeGreeting = "Good morning";
    else if (hour > 17) timeGreeting = "Good evening";

    return season === 'summer' 
      ? `${timeGreeting}, ${userName}! ☀️` 
      : `${timeGreeting}, ${userName}! ❄️`;
  };

  const getGreetingSubtext = () => {
    return season === 'summer'
      ? "Summer is here. Keep the momentum going."
      : "Winter has arrived. Cozy up and focus on what matters.";
  };

  return (
    <div className="flex min-h-screen bg-season-bg text-season-text transition-season-all pb-16 lg:pb-0">
      
      {/* Toast Alert Banner */}
      {errorToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs font-bold shadow-xl animate-in slide-in-from-top-4 duration-300">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span>{errorToast}</span>
          <button onClick={() => setErrorToast(null)} className="ml-2 hover:opacity-75">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
      />

      {/* Main Panel Content Container */}
      <main className="flex-1 flex flex-col min-w-0 max-w-full relative">
        
        {/* Mobile Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-season-border bg-season-card px-4 lg:hidden sticky top-0 z-20 backdrop-blur-md">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg text-season-muted hover:bg-season-bg hover:text-season-text"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <span className="font-bold text-xs leading-tight tracking-tight uppercase flex items-center gap-1.5">
            Seasonal Hub {isSandbox && <span className="px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[9px] font-black tracking-normal">SANDBOX</span>}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSandbox}
              className={`p-1.5 rounded-lg border text-xs font-bold ${isSandbox ? 'bg-purple-600 text-white border-purple-600' : 'bg-season-card text-purple-600 border-season-border'}`}
              title="Toggle Sandbox Mode"
            >
              🧪
            </button>
            <button
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
              className="p-1.5 rounded-lg text-season-accent bg-season-accent-light/50 border border-season-accent/20"
            >
              <Sparkles className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 p-4 md:p-8 lg:p-10 space-y-8 overflow-y-auto">
          
          {/* Header Action Row (Desktop) */}
          <div className="hidden lg:flex items-center justify-between border-b border-season-border/50 pb-5">
            <div>
              <h2 className="text-2xl font-black tracking-tight">{getGreeting()}</h2>
              <p className="text-xs text-season-muted font-medium mt-1">{getGreetingSubtext()}</p>
            </div>

            {/* AI Floating Toggle & User Avatar */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleSandbox}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer
                  ${isSandbox 
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20' 
                    : 'bg-season-card text-purple-600 border-season-border hover:bg-season-bg'
                  }
                `}
              >
                <span>🧪</span>
                <span>{isSandbox ? 'Sandbox Mode' : 'Sandbox (Empty Slate)'}</span>
              </button>

              <button
                onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer
                  ${isAiPanelOpen 
                    ? 'bg-season-accent text-white border-season-accent shadow-md shadow-season-accent/20' 
                    : 'bg-season-card text-season-accent border-season-border hover:bg-season-bg'
                  }
                `}
              >
                <Sparkles className="h-4 w-4" />
                Stella
              </button>

              <div className="flex items-center gap-2.5 border-l border-season-border pl-4">
                <div className="w-9 h-9 rounded-full bg-season-bg border border-season-border flex items-center justify-center text-season-muted text-sm font-black shadow-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold leading-none">{userName}</p>
                  <span className="text-[10px] text-season-muted capitalize font-semibold">{isSandbox ? 'sandbox' : season} mode</span>
                </div>
              </div>
            </div>
          </div>

          {/* RENDER VIEW TAB DETAILS */}

          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Today's Focus slots */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-season-text flex items-center gap-2">
                    <Target className="h-4.5 w-4.5 text-season-accent" />
                    Today&apos;s Focus
                  </h3>
                  <span className="text-[11px] font-bold text-season-muted">
                    Pick 1-2 hobbies to govern decision paralysis.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Selected items */}
                  {todayFocusItems.map((h) => (
                    <div 
                      key={h.id}
                      onClick={() => {
                        setSelectedHobby(h);
                        setIsDetailOpen(true);
                      }}
                      className="flex items-center justify-between p-4 rounded-2xl border border-season-border bg-season-card/90 hover:shadow-md cursor-pointer transition-all active:scale-98 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">⚡</span>
                        <div>
                          <p className="font-bold text-xs text-season-text group-hover:text-season-accent transition-colors">
                            {h.title}
                          </p>
                          <span className="text-[9px] text-season-muted font-bold block capitalize">
                            {h.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFocus(h.id);
                        }}
                        className="p-1 rounded-lg text-amber-500 hover:bg-season-bg font-black text-xs"
                        title="Remove focus"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Add Slot Button (If focus items < 2) */}
                  {todayFocusItems.length < 2 && (
                    <button
                      onClick={() => {
                        setSelectedHobby(null);
                        setIsEditOpen(true);
                      }}
                      className="flex w-full items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-season-border bg-season-bg/40 text-xs font-bold text-season-muted hover:border-season-accent hover:text-season-accent transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add Hobby Planner Card
                    </button>
                  )}

                  {/* Empty Slot fillers if 0 items */}
                  {todayFocusItems.length === 0 && (
                    <div className="hidden sm:flex items-center justify-center p-4 rounded-2xl border border-dashed border-season-border/50 bg-season-bg/10 text-[10px] font-bold text-season-muted uppercase tracking-wider">
                      Slot 2 Unassigned
                    </div>
                  )}
                </div>
              </div>

              {/* All Hobbies grid layout */}
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="font-extrabold text-sm text-season-text flex items-center gap-2">
                    <ListPlus className="h-4.5 w-4.5 text-season-accent" />
                    All {season} Hobbies
                  </h3>
                  
                  {/* Category Filter Chips and Add Button */}
                  <div className="flex items-center flex-wrap gap-2">
                    {/* Suggest Hobbies Button */}
                    <button
                      onClick={() => setIsSuggestionsOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-season-accent/30 text-season-accent hover:bg-season-accent/10 font-bold text-xs cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Stella's Suggestion
                    </button>

                    {/* Add Card Button */}
                    <button
                      onClick={() => {
                        setSelectedHobby(null);
                        setIsEditOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-season-accent text-white hover:opacity-90 font-bold text-xs shadow-md shadow-season-accent/15 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Hobby Planner Card
                    </button>

                  </div>
                </div>

                {dashboardFilteredHobbies.length === 0 ? (
                  /* Empty state list */
                  <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-season-border bg-season-card text-center glass-panel">
                    <Compass className="h-10 w-10 text-season-muted/70 mb-3 stroke-[1.5]" />
                    <h4 className="font-bold text-sm text-season-text mb-1">No hobbies found</h4>
                    <p className="text-xs text-season-muted max-w-xs leading-relaxed mb-4">
                      Create your first custom card to start tracking progression hooks and mental states!
                    </p>
                    <button
                      onClick={() => {
                        setSelectedHobby(null);
                        setIsEditOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-season-accent text-white font-bold text-xs"
                    >
                      Create Planner Card
                    </button>
                  </div>
                ) : (
                  /* Grid list */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {dashboardFilteredHobbies.map((hobby) => (
                      <HobbyCard
                        key={hobby.id}
                        hobby={hobby}
                        onToggleFocus={handleToggleFocus}
                        onEdit={(h) => {
                          setSelectedHobby(h);
                          setIsEditOpen(true);
                        }}
                        onClick={(h) => {
                          setSelectedHobby(h);
                          setIsDetailOpen(true);
                        }}
                        onDelete={handleDeleteHobby}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: ALL HOBBIES MANAGER */}
          {activeTab === 'hobbies' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-extrabold text-season-text">Hobbies Backlog Registry</h2>
                <p className="text-xs text-season-muted mt-1">Manage and view cards for the active season, as well as vaulted items in hibernation.</p>
              </div>

              {/* Active Hobbies Backlog */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-season-border pb-2">
                  <h3 className="font-bold text-xs text-season-text uppercase tracking-wider">Active Season Backlog</h3>
                  <button
                    onClick={() => {
                      setSelectedHobby(null);
                      setIsEditOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-season-accent text-white font-bold text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New Card
                  </button>
                </div>

                {currentSeasonHobbies.length === 0 ? (
                  <p className="text-xs text-season-muted italic">No active hobbies in backlog. Create one!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {currentSeasonHobbies.map((hobby) => (
                      <HobbyCard
                        key={hobby.id}
                        hobby={hobby}
                        onToggleFocus={handleToggleFocus}
                        onEdit={(h) => {
                          setSelectedHobby(h);
                          setIsEditOpen(true);
                        }}
                        onClick={(h) => {
                          setSelectedHobby(h);
                          setIsDetailOpen(true);
                        }}
                        onDelete={handleDeleteHobby}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Hibernate/Opposite Season Backlog */}
              <div className="space-y-4 pt-6">
                <div className="flex items-center justify-between border-b border-season-border pb-2">
                  <h3 className="font-bold text-xs text-season-muted uppercase tracking-wider">Hibernating Backlog (Opposite Season)</h3>
                </div>
                
                {hobbies.filter(h => h.season !== season).length === 0 ? (
                  <p className="text-xs text-season-muted italic">No hibernating hobbies in registry.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 opacity-65 grayscale-30 select-none pointer-events-none">
                    {hobbies.filter(h => h.season !== season).map((hobby) => (
                      <HobbyCard
                        key={hobby.id}
                        hobby={hobby}
                        onToggleFocus={() => {}}
                        onEdit={() => {}}
                        onClick={() => {}}
                        onDelete={() => {}}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: DAILY FOCUS ASSIGNMENT */}
          {activeTab === 'focus' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-season-text">Today&apos;s Focus Deck</h2>
                <p className="text-xs text-season-muted mt-1">Focus exclusively on these items to limit cognitive friction. Complete them to progress.</p>
              </div>

              {todayFocusItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-season-border bg-season-card text-center glass-panel max-w-md mx-auto">
                  <Target className="h-12 w-12 text-season-muted/70 mb-3" />
                  <h4 className="font-bold text-sm text-season-text mb-1">No Active Hobbies</h4>
                  <p className="text-xs text-season-muted leading-relaxed mb-6">
                    Go back to the dashboard and toggle the star icon on any card to assign it to your Focus Deck.
                  </p>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2 bg-season-accent text-white text-xs font-bold rounded-xl"
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {todayFocusItems.map((hobby) => (
                    <div 
                      key={hobby.id}
                      onClick={() => {
                        setSelectedHobby(hobby);
                        setIsDetailOpen(true);
                      }}
                      className="border border-season-border bg-season-card rounded-3xl p-6 shadow-md transition-season-all hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🎯</span>
                          <div>
                            <h3 className="font-bold text-base text-season-text">{hobby.title}</h3>
                            <span className="text-[10px] text-season-muted uppercase tracking-wider font-bold block">{hobby.category}</span>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-b border-season-border py-4 my-2">
                          <div>
                            <span className="text-[9px] font-bold text-season-muted uppercase tracking-wider block mb-1">Active Micro-Goal</span>
                            <p className="font-bold text-sm text-season-text">⚡ {hobby.micro_goal}</p>
                          </div>
                          <div className="mt-3">
                            <span className="text-[9px] font-bold text-season-muted uppercase tracking-wider block mb-1">Last brain dump status</span>
                             <p className="font-medium text-xs text-season-text/80 italic">&ldquo;{hobby.last_brain_dump}&rdquo;</p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHobby(hobby);
                          setIsDetailOpen(true);
                        }}
                        className="w-full mt-4 py-3 rounded-xl bg-season-accent hover:opacity-95 text-white font-bold text-xs text-center shadow-md shadow-season-accent/15"
                      >
                        Start Session & Complete Goal
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: JOURNAL LEDGER */}
          {activeTab === 'journal' && (
            <JournalView logs={logs} onDeleteLog={handleDeleteHobby} />
          )}

          {/* TAB: ANALYTICS STATS */}
          {activeTab === 'stats' && (
            <StatsView hobbies={hobbies} logs={logs} />
          )}

          {/* TAB: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsView onResetData={handleResetData} />
          )}

        </div>

        {/* Sliding AI Assistant side-panel (Overlay drawer on desktop/mobile) */}
        <div className={`
          fixed top-0 bottom-0 right-0 z-50 w-full sm:w-96 border-l border-season-border bg-season-card
          shadow-2xl transition-all duration-300 ease-in-out
          ${isAiPanelOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            {/* Header close bar */}
            <div className="flex h-16 items-center justify-between border-b border-season-border bg-season-bg/10 px-4">
              <span className="font-extrabold text-sm text-season-text flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-season-accent" />
                Stella
              </span>
              <button
                onClick={() => setIsAiPanelOpen(false)}
                className="p-1.5 rounded-lg text-season-muted hover:bg-season-bg hover:text-season-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* AIAssistant main panel */}
            <div className="flex-1 p-4 overflow-y-auto">
              <AIAssistant 
                hobbies={currentSeasonHobbies} 
                onApplyMicroGoal={handleApplyMicroGoal}
              />
            </div>
          </div>
        </div>

      </main>

      {/* Hobby inspect detail modal */}
      <HobbyDetailModal
        hobby={selectedHobby}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedHobby(null);
        }}
        onEditClick={() => {
          setIsDetailOpen(false);
          setIsEditOpen(true);
        }}
        onMarkDone={handleMarkGoalDone}
        onToggleFocus={(id) => {
          handleToggleFocus(id);
          // Sync current inspected hobby reference state
          setSelectedHobby(prev => prev ? { ...prev, is_daily_focus: !prev.is_daily_focus } : null);
        }}
      />

      {/* Hobby edit/create card modal */}
      <EditHobbyModal
        hobby={selectedHobby}
        season={season}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedHobby(null);
        }}
        onSave={handleSaveHobby}
        onDelete={handleDeleteHobby}
      />

      {/* Stella seasonal hobby suggestions modal */}
      <StellaSuggestionsModal
        isOpen={isSuggestionsOpen}
        onClose={() => setIsSuggestionsOpen(false)}
        season={season}
        existingHobbies={hobbies}
        onAddDirect={handleSelectSuggestedDirect}
        onCustomize={handleSelectSuggestedCustomize}
      />

    </div>
  );
}
