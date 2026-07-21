'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Edit3, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Hobby } from '@/lib/storage';

interface SuggestedHobby {
  title: string;
  category: string;
  icon: string;
  color_theme: string;
  last_brain_dump: string;
  micro_goal: string;
  notes: string;
}

interface StellaSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  season: 'summer' | 'winter';
  existingHobbies: Hobby[];
  onAddDirect: (suggested: SuggestedHobby) => void;
  onCustomize: (suggested: SuggestedHobby) => void;
}

export default function StellaSuggestionsModal({
  isOpen,
  onClose,
  season,
  existingHobbies,
  onAddDirect,
  onCustomize
}: StellaSuggestionsModalProps) {
  const [suggestions, setSuggestions] = useState<SuggestedHobby[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/suggest-hobbies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ season, existingHobbies })
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      } else {
        throw new Error('Failed to load suggestions from Stella.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen, season]);

  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    const normalized = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    const IconComp = (LucideIcons as any)[normalized] || (LucideIcons as any)[iconName] || LucideIcons.Sparkles;
    return <IconComp className="h-5 w-5" />;
  };

  const getColorStyle = (color: string) => {
    const hexColor = color.startsWith('#') ? color : '#6366f1';
    return {
      bg: { backgroundColor: `${hexColor}15`, borderColor: `${hexColor}25` },
      text: { color: hexColor },
      border: { borderColor: `${hexColor}25` },
      bar: { backgroundColor: hexColor }
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-season-card border border-season-border p-6 md:p-8 shadow-2xl overflow-hidden glass-panel max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-season-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-season-accent/15 text-season-accent">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-season-text flex items-center gap-2">
                Stella Ideas back deck
              </h2>
              <p className="text-xs text-season-muted font-semibold mt-0.5">
                AI suggested hobbies & categories to enrich your days.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-season-muted hover:bg-season-bg hover:text-season-text transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-season-accent" />
            <p className="text-xs font-bold text-season-muted animate-pulse">Stella is thinking of ideas...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 text-sm font-bold mb-4">{error}</p>
            <button 
              onClick={fetchSuggestions}
              className="px-4 py-2 bg-season-accent text-white rounded-xl text-xs font-bold"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestions.map((s, idx) => {
              const colors = getColorStyle(s.color_theme);
              return (
                <div 
                  key={idx}
                  className="flex flex-col justify-between p-5 rounded-2xl border border-season-border bg-season-bg/30 relative overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2.5 rounded-xl border flex items-center justify-center"
                        style={colors.bg}
                      >
                        <span style={colors.text}>{getIcon(s.icon)}</span>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-season-text">{s.title}</h3>
                        <span 
                          className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border"
                          style={{ ...colors.bg, ...colors.text }}
                        >
                          {s.category}
                        </span>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-[9px] text-season-muted uppercase tracking-wider block mb-0.5">Initial Dump</span>
                        <p className="font-semibold text-season-text leading-relaxed bg-season-card/50 p-2 rounded-lg border border-season-border/50 italic">
                          &ldquo;{s.last_brain_dump}&rdquo;
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-[9px] text-season-muted uppercase tracking-wider block mb-0.5">Starting Micro-Goal</span>
                        <p className="font-bold text-season-text leading-relaxed bg-season-accent-light/20 p-2 rounded-lg border border-season-accent/10">
                          ⚡ {s.micro_goal}
                        </p>
                      </div>
                      {s.notes && (
                        <div>
                          <span className="font-bold text-[9px] text-season-muted uppercase tracking-wider block mb-0.5">Stella Tip</span>
                          <p className="font-medium text-season-muted leading-relaxed">
                            {s.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-season-border/40">
                    <button
                      onClick={() => onCustomize(s)}
                      className="flex-1 py-2 rounded-xl border border-season-border bg-season-card text-[11px] font-bold text-season-muted hover:text-season-text flex items-center justify-center gap-1 hover:bg-season-bg transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Customize
                    </button>
                    
                    <button
                      onClick={() => onAddDirect(s)}
                      className="flex-1 py-2 rounded-xl text-[11px] font-bold text-white flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
                      style={colors.bar}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Direct
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
