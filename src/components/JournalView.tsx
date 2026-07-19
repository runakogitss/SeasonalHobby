'use client';

import React from 'react';
import { ActivityLog, groupLogsByDay } from '@/lib/storage';
import { Calendar, Trash2, CheckCircle2, History, MessageSquare } from 'lucide-react';

interface JournalViewProps {
  logs: ActivityLog[];
  onDeleteLog: (id: string) => void;
}

export default function JournalView({ logs, onDeleteLog }: JournalViewProps) {
  const groupedLogs = groupLogsByDay(logs);
  const days = Object.keys(groupedLogs);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Remove completion log for "${title}"?`)) {
      onDeleteLog(id);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-season-text flex items-center gap-2">
          <History className="h-6 w-6 text-season-accent" />
          Hobby Activity Journal
        </h2>
        <p className="text-xs text-season-muted mt-1">
          A ledger of your accomplishments. Track what you completed and your mental states over the holidays.
        </p>
      </div>

      {days.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-season-border bg-season-card text-center glass-panel">
          <Calendar className="h-12 w-12 text-season-muted/65 mb-4 stroke-[1.5]" />
          <h3 className="font-bold text-base text-season-text mb-1">Your Journal is Empty</h3>
          <p className="text-xs text-season-muted max-w-sm leading-relaxed mb-6">
            Log entries are created automatically when you mark an active micro-goal as completed on your dashboard.
          </p>
        </div>
      ) : (
        /* Timeline List */
        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-season-border/80">
          {days.map((day) => (
            <div key={day} className="relative space-y-4">
              {/* Timeline dot and Day Header */}
              <div className="flex items-center gap-3 -ml-8">
                <div className="w-5 h-5 rounded-full bg-season-accent border-[3.5px] border-season-card shadow-md flex-shrink-0 z-10" />
                <h3 className="font-bold text-sm text-season-text bg-season-card border border-season-border px-3 py-1 rounded-xl shadow-xs">
                  {day}
                </h3>
              </div>

              {/* Logs for this day */}
              <div className="space-y-3">
                {groupedLogs[day].map((log) => (
                  <div 
                    key={log.id} 
                    className="group flex flex-col md:flex-row justify-between gap-4 p-5 rounded-2xl border border-season-border bg-season-card shadow-xs transition-season-all hover:shadow-md relative overflow-hidden"
                  >
                    {/* Log details */}
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-season-text">
                          {log.hobby_title}
                        </span>
                        <span className="text-[9px] font-bold text-season-accent bg-season-accent-light/40 border border-season-accent/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Completed
                        </span>
                      </div>

                      {/* Goal completed */}
                      <div className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-season-muted block text-[9px] uppercase tracking-wider">Completed Goal</span>
                          <span className="font-bold text-season-text">{log.micro_goal_completed}</span>
                        </div>
                      </div>

                      {/* Snapshot */}
                      {log.brain_dump_snapshot && (
                        <div className="flex items-start gap-2 text-xs">
                          <MessageSquare className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-season-muted block text-[9px] uppercase tracking-wider">Brain Dump State</span>
                            <span className="font-medium text-season-text/90 italic">&ldquo;{log.brain_dump_snapshot}&rdquo;</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Delete button (visible on hover) */}
                    <div className="flex items-center md:self-center">
                      <button
                        onClick={() => handleDelete(log.id, log.hobby_title)}
                        className="p-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                        title="Delete journal entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
