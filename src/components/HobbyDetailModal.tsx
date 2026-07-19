'use client';

import React, { useState, useEffect } from 'react';
import { Hobby } from '@/lib/storage';
import { X, Edit, CheckCircle, FileText, Target, ChevronRight, Star } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface HobbyDetailModalProps {
  hobby: Hobby | null;
  isOpen: boolean;
  onClose: () => void;
  onEditClick: (hobby: Hobby) => void;
  onMarkDone: (id: string, nextDump: string, nextGoal: string, nextNotes: string) => void;
  onToggleFocus?: (id: string) => void;
}

export default function HobbyDetailModal({ hobby, isOpen, onClose, onEditClick, onMarkDone, onToggleFocus }: HobbyDetailModalProps) {
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const [nextDump, setNextDump] = useState('');
  const [nextGoal, setNextGoal] = useState('');
  const [nextNotes, setNextNotes] = useState('');

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (hobby) {
      setIsMarkingDone(false);
      setNextDump(hobby.micro_goal ? `Completed: ${hobby.micro_goal}` : '');
      setNextGoal('');
      setNextNotes(hobby.notes || '');
    }
  }, [hobby, isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen || !hobby) return null;

  const getIcon = (iconName: string) => {
    const classStyle = "h-12 w-12 stroke-[1.5]";
    const normalized = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    const IconComp = (LucideIcons as any)[normalized] || (LucideIcons as any)[iconName] || LucideIcons.Sparkles;
    return <IconComp className={classStyle} />;
  };

  const getColorStyle = (color: string) => {
    const presets: Record<string, { main: string, progress: string }> = {
      purple: { main: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50', progress: 'bg-purple-500' },
      green: { main: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50', progress: 'bg-emerald-500' },
      orange: { main: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50', progress: 'bg-orange-500' },
      blue: { main: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50', progress: 'bg-blue-500' },
      pink: { main: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-900/50', progress: 'bg-pink-500' },
    };

    if (presets[color.toLowerCase()]) {
      return { isPreset: true, classes: presets[color.toLowerCase()], style: {} as any };
    }

    const hexColor = color.startsWith('#') ? color : '#6366f1';
    return {
      isPreset: false,
      classes: { main: '', progress: '' },
      style: {
        main: { backgroundColor: `${hexColor}15`, color: hexColor, borderColor: `${hexColor}30` },
        progress: { backgroundColor: hexColor }
      }
    };
  };

  const colorInfo = getColorStyle(hobby.color_theme);

  const handleDoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextDump.trim()) {
      alert('Please fill out the Brain Dump description for what you completed.');
      return;
    }
    if (!nextGoal.trim()) {
      alert('Please provide the next tiny 5-minute Micro-Goal.');
      return;
    }
    onMarkDone(hobby.id, nextDump.trim(), nextGoal.trim(), nextNotes.trim());
    setIsMarkingDone(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-season-card border border-season-border p-6 shadow-2xl overflow-hidden glass-panel max-h-[95vh] overflow-y-auto">
        
        {/* Close and Edit Header buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditClick(hobby)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-season-bg hover:text-season-accent transition-colors cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit Card
            </button>
            
            {onToggleFocus && (
              <button
                onClick={() => onToggleFocus(hobby.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  hobby.is_daily_focus 
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' 
                    : 'bg-season-bg text-season-muted hover:text-season-text border-transparent'
                }`}
                title={hobby.is_daily_focus ? 'Remove focus' : 'Focus today'}
              >
                <Star className="h-3.5 w-3.5" fill={hobby.is_daily_focus ? 'currentColor' : 'none'} />
                {hobby.is_daily_focus ? 'Focused Today' : 'Focus Today'}
              </button>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-season-muted hover:bg-season-bg hover:text-season-text transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        {!isMarkingDone ? (
          /* Inspect View Mode */
          <div className="space-y-6">
            {/* Visual Icon Header Card */}
            <div 
              className={`flex flex-col items-center justify-center py-8 rounded-2xl border text-center relative overflow-hidden ${colorInfo.isPreset ? colorInfo.classes.main : ''}`}
              style={!colorInfo.isPreset ? colorInfo.style.main : undefined}
            >
              <div 
                className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/40 border border-white/20 uppercase tracking-wider backdrop-blur-xs"
                style={!colorInfo.isPreset ? { color: hobby.color_theme, borderColor: `${hobby.color_theme}40` } : undefined}
              >
                {hobby.category}
              </div>
              <div className="p-4 bg-white/60 dark:bg-black/20 rounded-2xl shadow-sm mb-3 text-current">
                {getIcon(hobby.icon)}
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-current">{hobby.title}</h2>
              
              {/* Progress Indicator */}
              <div className="mt-4 flex items-center gap-3 w-3/4 max-w-[200px]">
                <div className="flex-1 h-2 bg-white/45 dark:bg-black/20 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className={`h-full rounded-full ${colorInfo.isPreset ? colorInfo.classes.progress : ''}`} 
                    style={colorInfo.isPreset ? { width: `${hobby.progress}%` } : { ...colorInfo.style.progress, width: `${hobby.progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-current">{hobby.progress}% Completed</span>
              </div>
            </div>

            {/* Information Grid */}
            <div className="space-y-4">
              {/* Last Brain Dump */}
              <div className="space-y-1.5 bg-season-bg/60 p-4 rounded-2xl border border-season-border">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-season-muted flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Last Brain Dump
                </h4>
                <p className="text-sm font-semibold text-season-text leading-relaxed whitespace-pre-line">
                  {hobby.last_brain_dump || 'No brain dump notes recorded. Edit the card to write one!'}
                </p>
              </div>

              {/* Micro-Goal */}
              <div className="space-y-1.5 bg-season-accent-light/35 p-4 rounded-2xl border border-season-accent/20">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-season-accent flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" />
                  Active Micro-Goal
                </h4>
                <p className="text-sm font-bold text-season-text leading-relaxed flex items-start gap-1.5">
                  <span className="text-base select-none">⚡</span>
                  {hobby.micro_goal || 'No micro-goal currently active.'}
                </p>
              </div>

              {/* Notes */}
              {hobby.notes && (
                <div className="space-y-1.5 bg-season-bg/30 p-4 rounded-2xl border border-season-border/50">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-season-muted">
                    Notes
                  </h4>
                  <p className="text-xs font-medium text-season-text/80 leading-relaxed whitespace-pre-line">
                    {hobby.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-3 pt-4 border-t border-season-border">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-season-border bg-season-card text-xs font-bold text-season-muted hover:bg-season-bg hover:text-season-text transition-colors text-center"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={() => setIsMarkingDone(true)}
                className="flex-2 px-5 py-3 rounded-xl bg-season-accent text-white hover:opacity-90 font-bold text-xs shadow-md shadow-season-accent/20 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Done
              </button>
            </div>
          </div>
        ) : (
          /* Mark as Done Flow Mode */
          <form onSubmit={handleDoneSubmit} className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-season-text mb-1">Hobby Completed! 👏</h3>
              <p className="text-xs text-season-muted">Record what you did and set the next micro-goal to maintain your progression momentum.</p>
            </div>

            {/* Current Context Recall */}
            <div className="p-3 bg-season-bg/60 rounded-xl border border-season-border text-xs">
              <span className="font-bold text-season-muted uppercase text-[9px] tracking-wider block mb-1">Completed Goal Context</span>
              <p className="font-semibold text-season-text">⚡ {hobby.micro_goal}</p>
            </div>

            {/* Input: New Brain Dump (What did you do?) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-season-muted mb-1.5">
                New Brain Dump (Describe your current state)
              </label>
              <textarea
                value={nextDump}
                onChange={(e) => setNextDump(e.target.value)}
                placeholder="Describe exactly where you are ending. e.g. Just finished Chapter 8, next chapter starts with Bilbo finding the path..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-season-text text-sm font-semibold focus:outline-hidden focus:border-season-accent resize-none"
                required
              />
            </div>

            {/* Input: Next Micro-Goal (What will you do next?) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-season-muted mb-1.5">
                Next Micro-Goal (A tiny, 5-minute action for next time)
              </label>
              <input
                type="text"
                value={nextGoal}
                onChange={(e) => setNextGoal(e.target.value)}
                placeholder="e.g. Read Chapter 9 intro / Strum chords for 5 minutes"
                className="w-full px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-season-text text-sm font-bold focus:outline-hidden focus:border-season-accent"
                required
              />
            </div>

            {/* Input: Notes (Update long-term notes) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-season-muted mb-1.5">
                Update Notes (Optional)
              </label>
              <textarea
                value={nextNotes}
                onChange={(e) => setNextNotes(e.target.value)}
                placeholder="Update your notes for this hobby..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-season-text text-sm font-semibold focus:outline-hidden focus:border-season-accent resize-none"
              />
            </div>

            {/* Done Flow buttons */}
            <div className="flex gap-3 pt-4 border-t border-season-border">
              <button
                type="button"
                onClick={() => setIsMarkingDone(false)}
                className="px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-xs font-bold text-season-muted hover:bg-season-bg hover:text-season-text transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="ml-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                Confirm Completion
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
