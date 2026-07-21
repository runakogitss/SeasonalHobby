'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Target, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Sparkles,
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
            <div className="p-2 rounded-xl bg-season-accent/15 text-season-accent">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">Seasonal</h1>
              <p className="text-xs text-season-muted font-medium">Hobby</p>
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
