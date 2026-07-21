'use client';

import React, { useState } from 'react';
import { Hobby, ActivityLog } from '@/lib/storage';
import { useSeason } from '@/context/SeasonContext';
import { BarChart3, Layers, Target, CheckCircle2, Award, Flame, Sun, Snowflake, Sparkles, FileText, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface StatsViewProps {
  hobbies: Hobby[];
  logs: ActivityLog[];
}

// Helper to render the AI report text with bold markdown sections highlighted
function ReportRenderer({ text }: { text: string }) {
  const lines = text.split('\n').filter(l => l.trim() !== '');

  return (
    <div className="space-y-4">
      {lines.map((line, i) => {
        // Bold section headers like **🌟 Overall Assessment**
        if (line.startsWith('**') && line.endsWith('**')) {
          const heading = line.replace(/\*\*/g, '');
          return (
            <h4 key={i} className="text-xs font-black uppercase tracking-wide text-season-accent mt-5 first:mt-0 flex items-center gap-1.5">
              {heading}
            </h4>
          );
        }
        // Numbered list items
        if (/^\d+\./.test(line.trim())) {
          return (
            <p key={i} className="text-sm text-season-text font-semibold leading-relaxed pl-3 border-l-2 border-season-accent/40">
              {line.trim()}
            </p>
          );
        }
        // Regular paragraphs — render inline **bold** spans
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="text-sm text-season-text/90 leading-relaxed font-medium">
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} className="text-season-text font-bold">{part.replace(/\*\*/g, '')}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function StatsView({ hobbies, logs }: StatsViewProps) {
  const { season } = useSeason();

  // Report state
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [isReportExpanded, setIsReportExpanded] = useState(true);

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
  const currentStreak = logs.length > 0 ? Math.min(logs.length, 5) : 0;

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

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setReportError(null);
    setReport(null);
    setIsReportExpanded(true);
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hobbies, logs, season })
      });
      if (!res.ok) throw new Error('Failed to generate report.');
      const data = await res.json();
      setReport(data.report);
    } catch (err: any) {
      setReportError('Stella couldn\'t generate a report right now. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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

      {/* ───── STELLA REPORT SECTION ───── */}
      <div className="rounded-3xl border border-season-accent/30 bg-season-card shadow-xs overflow-hidden">
        {/* Report Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-season-accent/15 text-season-accent">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-season-text flex items-center gap-2">
                Stella&apos;s Improvement Report
                <span className="px-2 py-0.5 rounded-full bg-season-accent/15 text-season-accent text-[9px] font-black uppercase tracking-widest border border-season-accent/20">
                  AI
                </span>
              </h3>
              <p className="text-[10px] text-season-muted font-semibold mt-0.5">
                Personalized feedback based on your hobby data &amp; activity logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {report && (
              <button
                onClick={() => setIsReportExpanded(e => !e)}
                className="p-1.5 rounded-lg text-season-muted hover:bg-season-bg hover:text-season-text transition-colors"
                title={isReportExpanded ? 'Collapse report' : 'Expand report'}
              >
                {isReportExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-season-accent text-white hover:opacity-90 disabled:opacity-60 font-bold text-xs shadow-md shadow-season-accent/20 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating…
                </>
              ) : report ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report body */}
        {isGenerating && (
          <div className="px-6 pb-6">
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-season-accent/20 border-t-season-accent animate-spin" />
                <Sparkles className="h-5 w-5 text-season-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xs font-bold text-season-muted animate-pulse">
                Stella is reviewing your hobbies…
              </p>
            </div>
          </div>
        )}

        {reportError && !isGenerating && (
          <div className="px-6 pb-6">
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold">
              {reportError}
            </div>
          </div>
        )}

        {report && !isGenerating && isReportExpanded && (
          <div className="px-6 pb-6">
            {/* Decorative divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-season-border" />
              <div className="flex items-center gap-1.5 text-season-accent">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Stella&apos;s Analysis</span>
                <Sparkles className="h-3 w-3 animate-pulse" />
              </div>
              <div className="flex-1 h-px bg-season-border" />
            </div>

            {/* Rendered report */}
            <div className="p-5 rounded-2xl bg-season-bg/60 border border-season-border">
              <ReportRenderer text={report} />
            </div>

            <p className="text-[10px] text-season-muted mt-3 text-right font-semibold">
              Generated by Stella · Based on {hobbies.length} hobbies &amp; {logs.length} activity logs
            </p>
          </div>
        )}

        {/* Empty state — no report yet */}
        {!report && !isGenerating && !reportError && (
          <div className="px-6 pb-6">
            <div className="flex flex-col items-center justify-center py-8 gap-3 rounded-2xl border border-dashed border-season-border bg-season-bg/40">
              <div className="p-3 rounded-2xl bg-season-accent/10 text-season-accent">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-season-text">No report generated yet</p>
                <p className="text-xs text-season-muted mt-1 max-w-xs leading-relaxed">
                  Click <strong>Generate Report</strong> and Stella will analyze your hobbies &amp; give personalized improvement feedback.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
