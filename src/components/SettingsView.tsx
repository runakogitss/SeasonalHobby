'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, ShieldAlert, User, Trash2, LogOut, LogIn, CheckCircle2, AlertCircle, Cloud } from 'lucide-react';
import { isSandboxModeActive } from '@/lib/storage';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface SettingsViewProps {
  onResetData: () => void;
  user: any;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
}

export default function SettingsView({ onResetData, user, onOpenAuthModal, onSignOut }: SettingsViewProps) {
  const [userName, setUserName] = useState('Reynard');
  const [isSaved, setIsSaved] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearSandboxConfirmOpen, setIsClearSandboxConfirmOpen] = useState(false);

  // Load display name and remove any legacy keys stored in localStorage
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('settings-user-name');
      if (savedName) setUserName(savedName);

      localStorage.removeItem('settings-supabase-url');
      localStorage.removeItem('settings-supabase-anon-key');
      localStorage.removeItem('settings-openrouter-key');
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('settings-user-name', userName.trim());
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const isSupabaseConnected = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-season-text flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-season-accent" />
          Settings & Configurations
        </h2>
        <p className="text-xs text-season-muted mt-1">
          Manage your cloud sync and application preferences.
        </p>
      </div>

      {/* Cloud Account & Supabase Status Card */}
      <div className="p-6 bg-season-card border border-season-border rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-season-text flex items-center gap-2">
            <Cloud className="h-4 w-4 text-season-accent" />
            Login Account Status
          </h3>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
            isSupabaseConnected 
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
          }`}>
            {isSupabaseConnected ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {isSupabaseConnected ? 'Live Connection Active' : 'Offline / Local Fallback'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-season-bg border border-season-border space-y-3">
          {user ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-season-text flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-season-accent" />
                  Logged in as: <span className="text-season-accent">{user.email}</span>
                </p>
                <p className="text-[10px] text-season-muted mt-0.5 font-medium">
                  Your hobbies and logs are encrypted to your account.
                </p>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold text-xs border border-red-500/20 transition-all flex items-center gap-1.5 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-season-text">
                  Cloud Account Disconnected
                </p>
                <p className="text-[10px] text-season-muted mt-0.5 font-medium">
                  Sign in or create a Supabase account to enable live PostgreSQL persistence across devices.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-4 py-2 rounded-xl bg-season-accent text-white font-bold text-xs shadow-md shadow-season-accent/20 hover:opacity-90 transition-all flex items-center gap-1.5 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In / Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-5 bg-season-card border border-season-border rounded-3xl p-6 shadow-xs glass-panel">
        {/* Profile Settings */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-season-text flex items-center gap-2 border-b border-season-border pb-2">
            <User className="h-4 w-4 text-season-accent" />
            User Settings
          </h3>
          
          <div>
            <label htmlFor="user-name" className="block text-xs font-bold uppercase tracking-wider text-season-muted mb-1.5">
              Display Name
            </label>
            <input
              id="user-name"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Richard"
              className="w-full max-w-md px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-season-text text-sm font-semibold focus:outline-hidden focus:border-season-accent"
              required
            />
            <p className="text-[10px] text-season-muted font-medium mt-1">Used for header greetings across dashboard views.</p>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-season-border flex items-center justify-between">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-500 animate-pulse flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-5 py-2.5 rounded-xl bg-season-accent text-white hover:opacity-90 font-bold text-xs shadow-md shadow-season-accent/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            Save Display Name
          </button>
        </div>
      </form>

      {/* Sandbox Environment Card */}
      <div className="p-6 bg-purple-50 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-950/50 rounded-3xl space-y-4">
        <h3 className="font-bold text-sm text-purple-700 dark:text-purple-400 flex items-center gap-2">
          <span>🧪</span>
          Testing Sandbox Environment
        </h3>
        <p className="text-xs text-season-muted leading-relaxed">
          Switch between clean offline sandbox mode (no hobbies) and active cloud storage to test UI states.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const active = localStorage.getItem('sandbox-mode-enabled') === 'true';
              localStorage.setItem('sandbox-mode-enabled', String(!active));
              window.location.reload();
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isSandboxModeActive()
                ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                : 'bg-season-card text-purple-600 border-season-border hover:bg-season-bg'
            }`}
          >
            {isSandboxModeActive() ? '🧪 Sandbox Enabled' : '🧪 Enable Empty Sandbox'}
          </button>
          
          {isSandboxModeActive() && (
            <button
              type="button"
              onClick={() => setIsClearSandboxConfirmOpen(true)}
              className="px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Clear Sandbox Slate
            </button>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-950/50 rounded-3xl space-y-4">
        <h3 className="font-bold text-sm text-red-600 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          Reset Defaults
        </h3>
        <p className="text-xs text-season-muted">
          Erase local storage milestones and restore system demo datasets.
        </p>
        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          Reset Database Defaults
        </button>
      </div>

      {/* Modals */}
      <ConfirmDeleteModal
        isOpen={isResetConfirmOpen}
        title="Reset Database to Defaults"
        message="Are you sure you want to restore the database to its default hobbies and logs? This will erase custom local entries!"
        confirmLabel="Reset Everything"
        onConfirm={() => onResetData()}
        onClose={() => setIsResetConfirmOpen(false)}
      />

      <ConfirmDeleteModal
        isOpen={isClearSandboxConfirmOpen}
        title="Empty Sandbox Slate"
        message="Are you sure you want to completely empty the Sandbox database? All sandbox cards will be removed."
        confirmLabel="Clear Sandbox"
        onConfirm={() => {
          localStorage.setItem('seasonal-hobbies-sandbox', JSON.stringify([]));
          localStorage.setItem('seasonal-activity-logs-sandbox', JSON.stringify([]));
          window.location.reload();
        }}
        onClose={() => setIsClearSandboxConfirmOpen(false)}
      />
    </div>
  );
}
