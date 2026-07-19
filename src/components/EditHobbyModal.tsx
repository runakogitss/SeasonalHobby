'use client';

import React, { useState, useEffect } from 'react';
import { Hobby } from '@/lib/storage';
import { X, Check } from 'lucide-react';

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
            {hobby ? 'Edit Hobby Card' : 'Add Hobby Card'}
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
          {/* Icon & Color Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-season-muted mb-2">
              Icon & Theme Color
            </label>
            
            <div className="flex flex-col gap-3 p-3.5 bg-season-bg/60 rounded-2xl border border-season-border">
              {/* Icons row */}
              <div className="flex flex-wrap gap-2 justify-center">
                {AVAILABLE_ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all
                      ${icon === i 
                        ? 'bg-season-accent text-white border-season-accent shadow-sm'
                        : 'bg-season-card text-season-text border-season-border hover:bg-season-bg'
                      }
                    `}
                  >
                    {i}
                  </button>
                ))}
              </div>

              {/* Colors row */}
              <div className="flex justify-center gap-3 mt-1.5">
                {AVAILABLE_COLORS.map((c) => {
                  const bgClass = {
                    purple: 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/20',
                    green: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20',
                    orange: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20',
                    blue: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20',
                    pink: 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/20'
                  }[c];

                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColorTheme(c)}
                      className={`
                        w-6 h-6 rounded-full flex items-center justify-center transition-all scale-100 hover:scale-110 shadow-md ${bgClass}
                      `}
                    >
                      {colorTheme === c && <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Title and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hobby-title" className="block text-xs font-bold uppercase tracking-wider text-season-muted mb-1.5">
                Hobby Title
              </label>
              <input
                id="hobby-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dave the Diver"
                className="w-full px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-season-text text-sm font-semibold focus:outline-hidden focus:border-season-accent"
                required
              />
            </div>
            <div>
              <label htmlFor="hobby-category" className="block text-xs font-bold uppercase tracking-wider text-season-muted mb-1.5">
                Category
              </label>
              <input
                id="hobby-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. gaming, music, coding"
                className="w-full px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-season-text text-sm font-semibold focus:outline-hidden focus:border-season-accent"
                required
              />
            </div>
          </div>

          {/* Last Brain Dump */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="brain-dump" className="block text-xs font-bold uppercase tracking-wider text-season-muted">
                Last Brain Dump
              </label>
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
              <label htmlFor="micro-goal" className="block text-xs font-bold uppercase tracking-wider text-season-muted">
                Micro-Goal (Next Tiny Action)
              </label>
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
              <label htmlFor="hobby-notes" className="block text-xs font-bold uppercase tracking-wider text-season-muted">
                Notes (Optional)
              </label>
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
              <span className="text-[10px] font-semibold text-season-muted">Highlight this hobby on the dashboard today (max 2)</span>
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
              {hobby ? 'Save Changes' : 'Create Card'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
