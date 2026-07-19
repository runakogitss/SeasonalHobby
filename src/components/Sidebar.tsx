'use client';

import React from 'react';
import { useSeason } from '@/context/SeasonContext';
import { 
  LayoutDashboard, 
  Layers, 
  Target, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Sun, 
  Snowflake,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (isOpen: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpenMobile, setIsOpenMobile }: SidebarProps) {
  const { season, setSeason } = useSeason();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hobbies', label: 'All Hobbies', icon: Layers },
    { id: 'focus', label: 'Daily Focus', icon: Target },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-season-border 
        bg-season-card px-5 py-6 transition-all duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header Branding */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-season-all ${
              season === 'summer' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'
            }`}>
              {season === 'summer' ? (
                <Sun className="h-6 w-6 animate-spin-slow" />
              ) : (
                <Snowflake className="h-6 w-6 animate-pulse" />
              )}
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">Seasonal</h1>
              <p className="text-xs text-season-muted font-medium">Hobby Hub</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button 
            className="p-1 rounded-lg hover:bg-season-bg lg:hidden text-season-muted"
            onClick={() => setIsOpenMobile(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpenMobile(false);
                }}
                className={`
                  flex w-full items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold 
                  transition-all duration-200 group relative overflow-hidden
                  ${isActive 
                    ? 'bg-season-accent/15 text-season-accent' 
                    : 'text-season-muted hover:bg-season-bg hover:text-season-text'
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-season-accent rounded-r-md" />
                )}
                <Icon className={`h-5 w-5 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-season-accent' : 'text-season-muted group-hover:text-season-text'
                }`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Season Switcher Section */}
        <div className="mt-auto border-t border-season-border pt-6">
          <p className="text-[11px] font-bold tracking-wider text-season-muted uppercase mb-3 px-2">
            Season Switch
          </p>
          <div className="grid grid-cols-2 gap-2 bg-season-bg/60 p-1.5 rounded-xl border border-season-border">
            {/* Summer Button */}
            <button
              onClick={() => setSeason('summer')}
              className={`
                flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold
                transition-all duration-300
                ${season === 'summer'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-season-muted hover:text-season-text'
                }
              `}
            >
              <Sun className="h-3.5 w-3.5" />
              Summer
            </button>

            {/* Winter Button */}
            <button
              onClick={() => setSeason('winter')}
              className={`
                flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold
                transition-all duration-300
                ${season === 'winter'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-season-muted hover:text-season-text'
                }
              `}
            >
              <Snowflake className="h-3.5 w-3.5" />
              Winter
            </button>
          </div>
        </div>
      </aside>

      {/* Bottom Nav Bar for Mobile Devices */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 border-t border-season-border bg-season-card/90 backdrop-blur-md px-2 py-1 lg:hidden">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex flex-1 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-bold
                transition-all duration-150
                ${isActive ? 'text-season-accent' : 'text-season-muted'}
              `}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        <button
          onClick={() => setIsOpenMobile(true)}
          className={`
            flex flex-1 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-bold text-season-muted
          `}
        >
          <Menu className="h-5 w-5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
