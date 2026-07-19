'use client';

import React from 'react';
import { Hobby, ActivityLog } from '@/lib/storage';
import { useSeason } from '@/context/SeasonContext';
import { BarChart3, Layers, Target, CheckCircle2, Award, Flame, Sun, Snowflake } from 'lucide-react';

interface StatsViewProps {
  hobbies: Hobby[];
  logs: ActivityLog[];
}

export default function StatsView({ hobbies, logs }: StatsViewProps) {
  const { season } = useSeason();

  // Filters and metrics
  const totalHobbiesCount = hobbies.length;
  const currentSeasonHobbies = hobbies.filter(h => h.season === season);
  const currentSeasonCount = currentSeasonHobbies.length;
  
  const totalCompletedGoals = logs.length;
  
  // Average Progress
  const averageProgress = currentSeasonCount > 0 
    ? Math.round(currentSeasonHobbies.reduce((acc, h) => acc + h.progress, 0) / currentSeasonCount)
    : 0;

  // Streak calculations (simple mock/demo streak based on logs)
  const currentStreak = logs.length > 0 ? Math.min(logs.length, 5) : 0; // Simple demonstration streak

  // Category statistics
  const categoryStats = hobbies.reduce((acc, h) => {
    if (!acc[h.category]) {
      acc[h.category] = { count: 0, progressSum: 0 };
    }
    acc[h.category].count += 1;
    acc[h.category].progressSum += h.progress;
    return acc;
  }, {} as Record<string, { count: number; progressSum: number }>);

  const categories = Object.keys(categoryStats);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-season-text flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-season-accent" />
          Hobby Analytics
        </h2>
        <p className="text-xs text-season-muted mt-1">
          Monitor your progress, completion rates, and active streaks for the current {season} rotation.
        </p>
      </div>

      {/* Grid of Metric Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Hobbies count */}
        <div className="p-5 rounded-2xl border border-season-border bg-season-card shadow-xs">
          <div className="flex items-center justify-between mb-3 text-season-muted">
            <Layers className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Hobbies</span>
          </div>
          <p className="text-2xl font-black text-season-text">{totalHobbiesCount}</p>
          <p className="text-[10px] font-semibold text-season-muted mt-1">
            {hobbies.filter(h => h.season === 'summer').length} Summer / {hobbies.filter(h => h.season === 'winter').length} Winter
          </p>
        </div>

        {/* Metric 2: Average progress */}
        <div className="p-5 rounded-2xl border border-season-border bg-season-card shadow-xs">
          <div className="flex items-center justify-between mb-3 text-season-muted">
            <Award className="h-5 w-5 text-season-accent" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Progress</span>
          </div>
          <p className="text-2xl font-black text-season-text">{averageProgress}%</p>
          <div className="w-full h-1.5 bg-season-bg rounded-full overflow-hidden mt-2 border border-season-border">
            <div className="h-full bg-season-accent" style={{ width: `${averageProgress}%` }} />
          </div>
        </div>

        {/* Metric 3: Goals met */}
        <div className="p-5 rounded-2xl border border-season-border bg-season-card shadow-xs">
          <div className="flex items-center justify-between mb-3 text-season-muted">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Goals Met</span>
          </div>
          <p className="text-2xl font-black text-season-text">{totalCompletedGoals}</p>
          <p className="text-[10px] font-semibold text-season-muted mt-1">
            Activity logs saved in ledger
          </p>
        </div>

        {/* Metric 4: Streak */}
        <div className="p-5 rounded-2xl border border-season-border bg-season-card shadow-xs">
          <div className="flex items-center justify-between mb-3 text-season-muted">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Streak</span>
          </div>
          <p className="text-2xl font-black text-season-text">{currentStreak} days</p>
          <p className="text-[10px] font-semibold text-season-muted mt-1">
            Keep the momentum going!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Category breakdown */}
        <div className="p-6 rounded-3xl border border-season-border bg-season-card shadow-xs">
          <h3 className="font-bold text-sm text-season-text mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-season-accent" />
            Category Breakdown
          </h3>
          {categories.length === 0 ? (
            <p className="text-xs text-season-muted">No categories created yet.</p>
          ) : (
            <div className="space-y-4">
              {categories.map((cat) => {
                const item = categoryStats[cat];
                const avgProgress = Math.round(item.progressSum / item.count);
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-season-text">
                      <span className="capitalize">{cat} ({item.count})</span>
                      <span>{avgProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-season-bg border border-season-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-season-accent transition-all duration-500" 
                        style={{ width: `${avgProgress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Seasonal Balance */}
        <div className="p-6 rounded-3xl border border-season-border bg-season-card shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-season-text mb-4 flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              Seasonal Balance
            </h3>
            
            <div className="space-y-5">
              {/* Summer stat */}
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 border border-amber-200">
                  <Sun className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold text-season-text mb-1">
                    <span>Summer Hobbies</span>
                    <span>{hobbies.filter(h => h.season === 'summer').length} cards</span>
                  </div>
                  <div className="w-full h-2 bg-season-bg border border-season-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500" 
                      style={{ 
                        width: `${hobbies.length > 0 
                          ? (hobbies.filter(h => h.season === 'summer').length / hobbies.length) * 100 
                          : 0}%` 
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Winter stat */}
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600 border border-sky-200">
                  <Snowflake className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold text-season-text mb-1">
                    <span>Winter Hobbies</span>
                    <span>{hobbies.filter(h => h.season === 'winter').length} cards</span>
                  </div>
                  <div className="w-full h-2 bg-season-bg border border-season-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sky-500" 
                      style={{ 
                        width: `${hobbies.length > 0 
                          ? (hobbies.filter(h => h.season === 'winter').length / hobbies.length) * 100 
                          : 0}%` 
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-season-bg/60 border border-season-border rounded-2xl text-[10px] font-semibold text-season-muted text-center leading-relaxed">
            Toggle between **Summer** and **Winter** themes in the sidebar to load the context registry and balance progress!
          </div>
        </div>
      </div>
    </div>
  );
}
