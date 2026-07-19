'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Database, ShieldAlert, Key, User, Trash2 } from 'lucide-react';
import { isSandboxModeActive } from '@/lib/storage';

interface SettingsViewProps {
  onResetData: () => void;
}

export default function SettingsView({ onResetData }: SettingsViewProps) {
  const [userName, setUserName] = useState('Reynard');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load local settings overrides
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('settings-user-name');
      if (savedName) setUserName(savedName);
      const sUrl = localStorage.getItem('settings-supabase-url');
      if (sUrl) setSupabaseUrl(sUrl);
      const sKey = localStorage.getItem('settings-supabase-anon-key');
      if (sKey) setSupabaseAnonKey(sKey);
      const oKey = localStorage.getItem('settings-openrouter-key');
      if (oKey) setOpenRouterKey(oKey);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('settings-user-name', userName.trim());
      localStorage.setItem('settings-supabase-url', supabaseUrl.trim());
      localStorage.setItem('settings-supabase-anon-key', supabaseAnonKey.trim());
      localStorage.setItem('settings-openrouter-key', openRouterKey.trim());
    }
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to restore the database to its default hobbies and logs? This will erase all your custom entries!')) {
      onResetData();
      alert('Local storage has been reset to defaults.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-season-text flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-season-accent" />
          Settings & Configurations
        </h2>
        <p className="text-xs text-season-muted mt-1">
          Customize your experience, manage local database backups, and connect to persistent API engines.
        </p>
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
              Your Name
            </label>
            <input
              id="user-name"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Reynard"
              className="w-full max-w-md px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-season-text text-sm font-semibold focus:outline-hidden focus:border-season-accent"
              required
            />
            <p className="text-[10px] text-season-muted font-medium mt-1">Used for greeting headers on the main dashboard.</p>
          </div>
        </div>

        {/* API Credentials (Offline/Mock state placeholder comments) */}
        <div className="space-y-4 pt-4">
          <h3 className="font-bold text-sm text-season-text flex items-center gap-2 border-b border-season-border pb-2">
            <Key className="h-4 w-4 text-season-accent" />
            API & Database Connections (Optional)
          </h3>

          <div className="p-4 bg-season-accent-light/35 border border-season-accent/20 rounded-2xl text-xs space-y-1.5 leading-relaxed">
            <span className="font-bold text-season-accent flex items-center gap-1.5">
              <Database className="h-4 w-4" />
              Developer Placeholders & Local Testing Notice
            </span>
            <p className="text-[11px] font-semibold text-season-text/90">
              The application is configured to run fully client-side on **localStorage** and uses a simulated AI completion model. If you wish to activate live hosting, specify the credentials below or add them to a `.env.local` file.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supabase URL */}
            <div>
              <label htmlFor="sup-url" className="block text-xs font-bold uppercase tracking-wider text-season-muted mb-1.5">
                Supabase URL (Placeholder)
              </label>
              <input
                id="sup-url"
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-season-text text-xs font-semibold focus:outline-hidden focus:border-season-accent"
              />
              <p className="text-[9px] text-season-muted font-medium mt-1">Endpoint API url of your remote Supabase instance.</p>
            </div>

            {/* Supabase Anon Key */}
            <div>
              <label htmlFor="sup-key" className="block text-xs font-bold uppercase tracking-wider text-season-muted mb-1.5">
                Supabase Anon Key (Placeholder)
              </label>
              <input
                id="sup-key"
                type={showKeys ? "text" : "password"}
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-season-text text-xs font-mono focus:outline-hidden focus:border-season-accent"
              />
              <p className="text-[9px] text-season-muted font-medium mt-1">Standard clientside anonymous bypass credential.</p>
            </div>
          </div>

          {/* OpenRouter Key */}
          <div>
            <label htmlFor="or-key" className="block text-xs font-bold uppercase tracking-wider text-season-muted mb-1.5">
              OpenRouter API Key (For Live AI Planner)
            </label>
            <input
              id="or-key"
              type={showKeys ? "text" : "password"}
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-4 py-2.5 rounded-xl border border-season-border bg-season-card text-season-text text-xs font-mono focus:outline-hidden focus:border-season-accent"
            />
            <p className="text-[9px] text-season-muted font-medium mt-1">Secret key required to query the reasoning model (`poolside/laguna-xs-2.1:free`). Leave empty to run the offline simulator.</p>
          </div>

          {/* Show Keys Toggle */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowKeys(!showKeys)}
              className="text-[10px] font-bold text-season-accent hover:underline cursor-pointer"
            >
              {showKeys ? 'Hide keys' : 'Show keys'}
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-season-border flex items-center justify-between">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-500 animate-pulse">
              ✓ Configurations saved to browser!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-5 py-2.5 rounded-xl bg-season-accent text-white hover:opacity-90 font-bold text-xs shadow-md shadow-season-accent/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </button>
        </div>
      </form>

      {/* Sandbox Environment card */}
      <div className="p-6 bg-purple-50 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-950/50 rounded-3xl space-y-4">
        <h3 className="font-bold text-sm text-purple-700 flex items-center gap-2">
          <span>🧪</span>
          Testing Sandbox Environment
        </h3>
        <p className="text-xs text-season-muted leading-relaxed">
          Quickly switch between standard database (with pre-seeded content) and a clean developer sandbox containing no hobbies to test addition workflows.
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
              onClick={() => {
                if (confirm('Are you sure you want to completely empty the Sandbox database?')) {
                  localStorage.setItem('seasonal-hobbies-sandbox', JSON.stringify([]));
                  localStorage.setItem('seasonal-activity-logs-sandbox', JSON.stringify([]));
                  window.location.reload();
                }
              }}
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
          Danger Zone
        </h3>
        <p className="text-xs text-season-muted">
          Erase all progress milestones, custom brain dumps, and journal entries, restoring the system back to the initial PRD demonstration datasets.
        </p>
        <button
          onClick={handleReset}
          className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          Reset Database to Defaults
        </button>
      </div>
    </div>
  );
}
