import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { LoaderCircle, ArrowRightLeft } from 'lucide-react';
import { supabase, configurationError } from '../lib/supabase';
function Shell({ children }: { children: ReactNode }) {
  return <main className="auth-shell"><section className="panel auth-card"><ArrowRightLeft className="brand-icon"/><h1 className="brand">Duo Relay Lab</h1>{children}</section></main>;
}
function AuthCard() {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!supabase || busy) return;
    setBusy(true); setMessage('');
    try {
      const result = mode === 'in'
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } });
      if (result.error) throw result.error;
      if (mode === 'up' && !result.data.session) setMessage('Check your email to confirm your account.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Sign-in failed. Please try again.'); }
    finally { setBusy(false); }
  }
  async function google() {
    if (!supabase || busy) return; setBusy(true); setMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
      if (error) throw error;
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Google sign-in failed.'); }
    finally { setBusy(false); }
  }
  return <Shell>
    <p className="muted">{mode === 'in' ? 'Sign in to your manual relay workspace.' : 'Create your account.'}</p>
    <button type="button" className="button secondary full" disabled={busy} onClick={() => void google()}>Continue with Google</button>
    <div className="divider"><span>or use email</span></div>
    <form onSubmit={submit} className="form-stack">
      <label>Email<input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>Password<input type="password" required minLength={6} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} /></label>
      <button className="button primary full" disabled={busy}>{busy && <LoaderCircle className="spin" size={16}/>} {mode === 'in' ? 'Sign in' : 'Sign up'}</button>
    </form>
    {message && <p role="status" className="notice">{message}</p>}
    <button type="button" className="text-button" disabled={busy} onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setMessage(''); }}>{mode === 'in' ? 'No account? Sign up' : 'Have an account? Sign in'}</button>
    <p className="small muted">Authentication uses Supabase directly. No AI APIs are connected.</p>
  </Shell>;
}
export function AccessGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const client = supabase; if (!client) return;
    let active = true; let authChanged = false;
    setReady(false); setError('');
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      if (active) { authChanged = true; setUser(session?.user ?? null); setReady(true); setError(''); }
    });
    client.auth.getSession().then(({ data: result, error: sessionError }) => {
      if (!active || authChanged) return;
      if (sessionError) setError(sessionError.message);
      setUser(result.session?.user ?? null); setReady(true);
    }).catch((failure: unknown) => { if (active) { setError(failure instanceof Error ? failure.message : 'Could not check your session.'); setReady(true); } });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [retry]);
  if (configurationError) return <Shell><h2>Connect your own Supabase project</h2><p className="notice" role="alert">{configurationError}</p><p className="small muted">See the included setup guide. This app does not use a Lovable authentication broker.</p></Shell>;
  if (!ready) return <Shell><p className="loading"><LoaderCircle size={18} className="spin"/> Checking your session…</p></Shell>;
  if (error) return <Shell><p role="alert" className="notice">{error}</p><button className="button secondary" onClick={() => setRetry(value => value + 1)}>Try again</button></Shell>;
  if (!user) return <AuthCard/>;
  return <div key={user.id}>{children}</div>;
}
