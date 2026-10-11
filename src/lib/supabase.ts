import { createClient, type SupabaseClient } from '@supabase/supabase-js';
const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim();
export let configurationError = '';
export let supabase: SupabaseClient | null = null;
function publicKeyAllowed(value: string): boolean {
  if (value.startsWith('sb_publishable_') && !value.includes('REPLACE')) return true;
  if (!value.startsWith('eyJ')) return false;
  try {
    const payload = value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)).role === 'anon';
  } catch { return false; }
}
try {
  if (!url || url.includes('YOUR_PROJECT') || !publicKeyAllowed(key)) {
    throw new Error('Set VITE_SUPABASE_URL and a public publishable (or legacy anon) key in .env.local. Never use a secret or service-role key. Restart the development server after changing configuration.');
  }
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname))) {
    throw new Error('Supabase URL must use HTTPS, except for local development.');
  }
  supabase = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } });
} catch (error) { configurationError = error instanceof Error ? error.message : 'Invalid Supabase configuration.'; }
