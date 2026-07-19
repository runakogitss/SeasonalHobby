'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Hobby } from '@/lib/storage';
import { 
  Gamepad, 
  Music, 
  Book, 
  Languages, 
  Code, 
  Activity, 
  Utensils, 
  Sparkles,
  Star,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Clock
} from 'lucide-react';

interface HobbyCardProps {
  hobby: Hobby;
  onToggleFocus: (id: string) => void;
  onEdit: (hobby: Hobby) => void;
  onClick: (hobby: Hobby) => void;
  onDelete: (id: string) => void;
}

export default function HobbyCard({ hobby, onToggleFocus, onEdit, onClick, onDelete }: HobbyCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [relativeTime, setRelativeTime] = useState('Updated recently');

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'gamepad': return <Gamepad className="h-5 w-5" />;
      case 'music': return <Music className="h-5 w-5" />;
      case 'book': return <Book className="h-5 w-5" />;
      case 'languages': return <Languages className="h-5 w-5" />;
      case 'code': return <Code className="h-5 w-5" />;
      case 'activity': return <Activity className="h-5 w-5" />;
      case 'utensils': return <Utensils className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  // Color theme mapping
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'purple':
        return {
          bg: 'bg-purple-100 dark:bg-purple-900/30',
          text: 'text-purple-600 dark:text-purple-400',
          border: 'border-purple-200 dark:border-purple-900/50',
          bar: 'bg-purple-500',
          badge: 'bg-purple-50 text-purple-700 border-purple-200'
        };
      case 'green':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-200 dark:border-emerald-900/50',
          bar: 'bg-emerald-500',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'orange':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/30',
          text: 'text-orange-600 dark:text-orange-400',
          border: 'border-orange-200 dark:border-orange-900/50',
          bar: 'bg-orange-500',
          badge: 'bg-orange-50 text-orange-700 border-orange-200'
        };
      case 'blue':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-900/50',
          bar: 'bg-blue-500',
          badge: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'pink':
        return {
          bg: 'bg-pink-100 dark:bg-pink-900/30',
          text: 'text-pink-600 dark:text-pink-400',
          border: 'border-pink-200 dark:border-pink-900/50',
          bar: 'bg-pink-500',
          badge: 'bg-pink-50 text-pink-700 border-pink-200'
        };
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-200 dark:border-slate-700',
          bar: 'bg-slate-500',
          badge: 'bg-slate-50 text-slate-700 border-slate-200'
        };
    }
  };

  const colors = getColorClasses(hobby.color_theme);

  // Time format helper computed on mount/updates
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const date = new Date(hobby.updated_at);
      const diffMs = Date.now() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) setRelativeTime('Updated today');
      else if (diffDays === 1) setRelativeTime('Updated yesterday');
      else setRelativeTime(`Updated ${diffDays} days ago`);
    } catch {
      setRelativeTime('Updated recently');
    }
  }, [hobby.updated_at]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div 
      className={`
        relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 group hover:shadow-lg
        bg-season-card border-season-border hover:-translate-y-0.5 cursor-pointer
      `}
      onClick={() => onClick(hobby)}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${colors.bg} ${colors.text} ${colors.border}`}>
            {getIcon(hobby.icon)}
          </div>
          <div>
            <h3 className="font-bold text-base text-season-text group-hover:text-season-accent transition-colors">
              {hobby.title}
            </h3>
            <span className="text-[11px] font-bold text-season-muted capitalize bg-season-bg px-2 py-0.5 rounded-md border border-season-border">
              {hobby.category}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Focus Toggle Star */}
          <button
            onClick={() => onToggleFocus(hobby.id)}
            className={`
              p-1.5 rounded-lg transition-all duration-200 hover:bg-season-bg
              ${hobby.is_daily_focus 
                ? 'text-amber-500 hover:text-amber-600 scale-110' 
                : 'text-slate-300 hover:text-slate-400 dark:text-slate-600'
              }
            `}
            title={hobby.is_daily_focus ? 'Remove from Today\'s Focus' : 'Add to Today\'s Focus'}
          >
            <Star className="h-4 w-4" fill={hobby.is_daily_focus ? 'currentColor' : 'none'} />
          </button>

          {/* More Actions Dropdown Trigger */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-season-muted hover:bg-season-bg hover:text-season-text"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl border border-season-border bg-season-card py-1.5 shadow-xl z-10 glass-panel animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  onClick={() => {
                    onClick(hobby);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-season-text hover:bg-season-bg text-left"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Inspect
                </button>
                <button
                  onClick={() => {
                    onEdit(hobby);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-season-text hover:bg-season-bg text-left"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Card
                </button>
                <hr className="border-season-border my-1" />
                <button
                  onClick={() => {
                    if (confirm(`Delete hobby "${hobby.title}"?`)) {
                      onDelete(hobby.id);
                    }
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-left"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Content: Last Brain Dump */}
      <div className="flex-1 mb-4 space-y-3">
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-wider text-season-muted uppercase">
            Last Brain Dump
          </p>
          <p className="text-xs text-season-text line-clamp-2 leading-relaxed bg-season-bg/40 p-2 rounded-lg border border-season-border/50">
            {hobby.last_brain_dump || 'No dump recorded. Click to write one!'}
          </p>
        </div>

        {/* Card Content: Micro-Goal */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-wider text-season-muted uppercase">
            Micro-Goal
          </p>
          <p className="text-xs font-bold text-season-text leading-relaxed bg-season-accent-light/30 border border-season-accent/20 p-2 rounded-lg">
            ⚡ {hobby.micro_goal || 'None planned.'}
          </p>
        </div>
      </div>

      {/* Card Footer Progress */}
      <div className="border-t border-season-border pt-3 mt-1 flex items-center justify-between text-[11px] text-season-muted font-semibold">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {relativeTime}
        </span>
        <div className="flex items-center gap-2">
          {/* Progress bar */}
          <div className="w-16 h-1.5 bg-season-bg rounded-full overflow-hidden border border-season-border">
            <div 
              className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
              style={{ width: `${hobby.progress}%` }}
            />
          </div>
          <span className={`px-1.5 py-0.5 rounded-md border text-[10px] font-bold ${colors.badge}`}>
            {hobby.progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
