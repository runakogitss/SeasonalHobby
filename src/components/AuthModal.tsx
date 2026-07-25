'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Lock, Mail, Sparkles, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;

        if (data.session) {
          setSuccessMsg('Account created successfully! Logged in.');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1000);
        } else if (data.user && data.user.identities && data.user.identities.length === 0) {
          setErrorMsg('An account with this email already exists. Try signing in instead.');
        } else {
          setSuccessMsg('Account created! If Email Confirmation is enabled in Supabase, please confirm your email, or disable "Confirm email" in Supabase Auth settings for instant login.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;

        setSuccessMsg('Successfully signed in!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      }
    } catch (err: any) {
      const msg = err.message || 'An error occurred during authentication.';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setErrorMsg('Email not confirmed! Tip: In Supabase Dashboard -> Auth -> Providers -> Email, uncheck "Confirm email" to log in instantly without waiting for an email.');
      } else if (msg.toLowerCase().includes('invalid login credentials')) {
        setErrorMsg('Invalid email or password. Please check your credentials or click "Sign Up" if you don\'t have an account yet.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-season-card border border-season-border rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-season-muted hover:text-season-text rounded-xl hover:bg-season-bg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-season-accent/15 text-season-accent mb-1">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-season-text tracking-tight">
            {isSignUp ? 'Create Supabase Account' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-season-muted font-medium">
            {isSignUp
              ? 'Sync your seasonal hobbies across all devices in real-time.'
              : 'Sign in to access your cloud-synced seasonal hobbies.'}
          </p>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-season-muted">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-season-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-season-bg border border-season-border rounded-xl text-sm font-medium text-season-text focus:outline-none focus:border-season-accent transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-season-muted">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-season-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-season-bg border border-season-border rounded-xl text-sm font-medium text-season-text focus:outline-none focus:border-season-accent transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-season-accent text-white font-bold text-sm rounded-xl hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-season-accent/25"
          >
            {loading ? (
              <span className="inline-block animate-spin font-semibold">🌀</span>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                Sign Up with Supabase
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In to Cloud Sync
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="pt-2 border-t border-season-border/50 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-xs font-semibold text-season-accent hover:underline transition-all"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
