'use client';

import React, { useState, useEffect } from 'react';
import { Hobby } from '@/lib/storage';
import { X, Check, Sparkles, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';


interface HobbyFormData {
  id?: string;
  title: string;
  category: string;
  season: 'summer' | 'winter';
  icon: string;
  color_theme: string;
  last_brain_dump: string;
  micro_goal: string;
  notes: string;
  is_daily_focus: boolean;
  progress: number;
}

interface EditHobbyModalProps {
  hobby?: Hobby | null;
  season: 'summer' | 'winter';
  isOpen: boolean;
  onClose: () => void;
  onSave: (hobbyData: HobbyFormData) => void;
  onDelete?: (id: string) => void;
}

const AVAILABLE_ICONS = ['gamepad', 'music', 'book', 'languages', 'code', 'activity', 'utensils'];
const AVAILABLE_COLORS = ['purple', 'green', 'orange', 'blue', 'pink'];

export default function EditHobbyModal({ hobby, season, isOpen, onClose, onSave, onDelete }: EditHobbyModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState('gamepad');
  const [colorTheme, setColorTheme] = useState('purple');
  const [lastBrainDump, setLastBrainDump] = useState('');
  const [microGoal, setMicroGoal] = useState('');
  const [notes, setNotes] = useState('');
  const [isDailyFocus, setIsDailyFocus] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const getIconComponent = (iconName: string) => {
    const normalized = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    const IconComp = (LucideIcons as any)[normalized] || (LucideIcons as any)[iconName] || LucideIcons.Sparkles;
    return <IconComp className="h-4 w-4" />;
  };

  const handleAutoSuggest = async (titleVal: string, catVal: string) => {
    if (!titleVal.trim() || isSuggesting) return;
    setIsSuggesting(true);
    try {
      const response = await fetch('/api/generate-hobby-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleVal, category: catVal, season })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.category && !catVal.trim()) setCategory(data.category);
        if (data.icon) setIcon(data.icon);
        if (data.color_theme) setColorTheme(data.color_theme);
      }
    } catch (err) {
      console.error('Failed to auto-suggest metadata:', err);
    } finally {
      setIsSuggesting(false);
    }
  };

  // Load hobby details if editing
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (hobby) {
      setTitle(hobby.title);
      setCategory(hobby.category);
      setIcon(hobby.icon);
      setColorTheme(hobby.color_theme);
      setLastBrainDump(hobby.last_brain_dump || '');
      setMicroGoal(hobby.micro_goal || '');
      setNotes(hobby.notes || '');
      setIsDailyFocus(hobby.is_daily_focus);
      setProgress(hobby.progress);
    } else {
      setTitle('');
      setCategory('');
      setIcon('gamepad');
      setColorTheme('purple');
      setLastBrainDump('');
      setMicroGoal('');
      setNotes('');
      setIsDailyFocus(false);
      setProgress(0);
    }
  }, [hobby, isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim()) {
      alert('Please fill out the Title and Category fields.');
      return;
    }
    
    const hobbyData = {
      id: hobby?.id, // undefined for new hobby
      title: title.trim(),
      category: category.trim().toLowerCase(),
      season: hobby?.season || season,
      icon,
      color_theme: colorTheme,
      last_brain_dump: lastBrainDump.trim(),
      micro_goal: microGoal.trim(),
      notes: notes.trim(),
      is_daily_focus: isDailyFocus,
      progress: progress
    };

    onSave(hobbyData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-season-card border border-season-border p-6 shadow-2xl overflow-hidden glass-panel max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-season-border">
          <h2 className="text-xl font-bold text-season-text">
            {hobby ? 'Edit Hobby Planner Card' : 'Add Hobby Planner Card'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-season-muted hover:bg-season-bg hover:text-season-text transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hobby-title" className="block text-xs font-bold uppercase tracking-wider text-season-muted mb-1.5 flex items-center justify-between">
                <span>Hobby Title</span>
                <button
                  type="button"
                  onClick={() => handleAutoSuggest(title, category)}
                  disabled={!title.trim() || isSuggesting}
                  className="p-1 rounded-md text-season-accent hover:bg-season-bg disabled:opacity-50 transition-all flex items-center gap-1 text-[10px] font-bold"
                  title="Auto-generate category, icon & theme with Stella AI"
                >
                  {isSuggesting ? (
                    <Loader2 className="h-3 w-3 animate-spin text-season-accent" />
                  ) : (
                    <Sparkles className="h-3 w-3 text-season-accent" />
                  )}
                  <span>Stella Suggest</span>
                </button>
              </label>
              <input
                id="hobby-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  if (title.trim()) {
                    handleAutoSuggest(title, category);
                  }
                }}
                placeholder="e.g. Dave the Diver"
                className="w-full px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-season-text text-sm font-semibold focus:outline-hidden focus:border-season-accent"
                required
              />
            </div>
            <div>
              <label htmlFor="hobby-category" className="block text-xs font-bold uppercase tracking-wider text-season-muted mb-1.5">
                Category
              </label>
              <div className="relative">
                <input
                  id="hobby-category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  onBlur={() => {
                    if (title.trim()) {
                      handleAutoSuggest(title, category);
                    }
                  }}
                  placeholder="e.g. gaming, music, coding"
                  className="w-full px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-season-text text-sm font-semibold focus:outline-hidden focus:border-season-accent"
                  required
                />
                {isSuggesting && (
                  <div className="absolute right-3 top-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-season-accent" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Last Brain Dump */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <div>
                <label htmlFor="brain-dump" className="block text-xs font-bold uppercase tracking-wider text-season-muted mb-0.5">
                  Last Brain Dump
                </label>
                <span className="text-[10px] font-semibold text-season-muted block">tells your previous actions</span>
              </div>
              <span className={`text-[10px] font-bold ${lastBrainDump.length > 300 ? 'text-red-500' : 'text-season-muted'}`}>
                {lastBrainDump.length}/300
              </span>
            </div>
            <textarea
              id="brain-dump"
              value={lastBrainDump}
              onChange={(e) => setLastBrainDump(e.target.value.slice(0, 300))}
              placeholder="Exactly what were you doing last time? e.g. Just beat the Fire Temple, next is collecting arrows..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-season-text text-sm font-semibold focus:outline-hidden focus:border-season-accent resize-none"
            />
          </div>

          {/* Micro-Goal */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <div>
                <label htmlFor="micro-goal" className="block text-xs font-bold uppercase tracking-wider text-season-muted mb-0.5">
                  Micro-Goal (Next Tiny Action)
                </label>
                <span className="text-[10px] font-semibold text-season-muted block">what should you achieve!</span>
              </div>
              <span className={`text-[10px] font-bold ${microGoal.length > 150 ? 'text-red-500' : 'text-season-muted'}`}>
                {microGoal.length}/150
              </span>
            </div>
            <input
              id="micro-goal"
              type="text"
              value={microGoal}
              onChange={(e) => setMicroGoal(e.target.value.slice(0, 150))}
              placeholder="e.g. Practice fingerpicking for 5 minutes"
              className="w-full px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-season-text text-sm font-bold focus:outline-hidden focus:border-season-accent"
            />
          </div>

          {/* Notes */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <div>
                <label htmlFor="hobby-notes" className="block text-xs font-bold uppercase tracking-wider text-season-muted mb-0.5">
                  Notes (Optional)
                </label>
                <span className="text-[10px] font-semibold text-season-muted block">things that you should do!</span>
              </div>
              <span className={`text-[10px] font-bold ${notes.length > 200 ? 'text-red-500' : 'text-season-muted'}`}>
                {notes.length}/200
              </span>
            </div>
            <textarea
              id="hobby-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 200))}
              placeholder="Long term considerations, equipment list, or helpful tips..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-season-text text-sm font-semibold focus:outline-hidden focus:border-season-accent resize-none"
            />
          </div>

          {/* Progress Slider (Only when editing) */}
          {hobby && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="block text-xs font-bold uppercase tracking-wider text-season-muted">
                  Progress Percentage
                </span>
                <span className="text-xs font-bold text-season-accent bg-season-accent-light/40 border border-season-accent/20 px-2 py-0.5 rounded-md">
                  {progress}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-season-accent cursor-pointer h-2 bg-season-bg rounded-lg border border-season-border"
              />
            </div>
          )}

          {/* Daily Focus Switch */}
          <div className="flex items-center justify-between p-3.5 bg-season-bg/60 rounded-2xl border border-season-border">
            <div>
              <span className="block text-xs font-bold text-season-text">Today&apos;s Focus</span>
              <span className="text-[10px] font-semibold text-season-muted block">Highlight this hobby on the dashboard today (max 2)</span>
              <span className="text-[9px] font-bold text-season-accent block mt-0.5">focus it or not!</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={isDailyFocus}
                onChange={(e) => setIsDailyFocus(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-season-accent" />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-season-border">
            {hobby && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${hobby.title}?`)) {
                    onDelete(hobby.id);
                  }
                }}
                className="px-4 py-2.5 rounded-xl border border-red-200 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                Delete
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              className="ml-auto px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-xs font-bold text-season-muted hover:bg-season-bg hover:text-season-text transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-season-accent text-white hover:opacity-90 font-bold text-xs shadow-md shadow-season-accent/20 transition-all"
            >
              {hobby ? 'Save Changes' : 'Create Planner Card'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
