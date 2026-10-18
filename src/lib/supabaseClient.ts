import { createClient, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';

// Resolve environment variables from Vite or window storage
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return '';
};

let cachedUrl: string =
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL') ||
  getEnvVar('VITE_SUPABASE_URL') ||
  (typeof window !== 'undefined' ? localStorage.getItem('apexwire_custom_supabase_url') || '' : '');

let cachedAnonKey: string =
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
  getEnvVar('VITE_SUPABASE_ANON_KEY') ||
  (typeof window !== 'undefined' ? localStorage.getItem('apexwire_custom_supabase_anon_key') || '' : '');

let client: SupabaseClient | null = null;

// Initialize or retrieve the Supabase client
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!cachedUrl || !cachedAnonKey) {
    return null;
  }

  if (!client) {
    try {
      client = createClient(cachedUrl, cachedAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      console.log('[Supabase Client] Initialized successfully with:', cachedUrl);
    } catch (err) {
      console.error('[Supabase Client] Failed to initialize client:', err);
      return null;
    }
  }

  return client;
};

// Asynchronously load config from backend if env vars weren't bundled in Vite
export const loadPublicConfig = async (): Promise<{ url: string; anonKey: string }> => {
  if (cachedUrl && cachedAnonKey) {
    return { url: cachedUrl, anonKey: cachedAnonKey };
  }

  try {
    const res = await fetch('/api/public/config');
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl) cachedUrl = data.supabaseUrl;
      if (data.supabaseAnonKey) cachedAnonKey = data.supabaseAnonKey;

      if (cachedUrl && cachedAnonKey && !client) {
        client = createClient(cachedUrl, cachedAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
      }
    }
  } catch (err) {
    console.warn('Failed to fetch public config from backend:', err);
  }

  return { url: cachedUrl, anonKey: cachedAnonKey };
};

// Immediately load config
if (typeof window !== 'undefined') {
  loadPublicConfig().catch(() => {});
}

export const saveCustomSupabaseKeys = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    cachedUrl = url.trim();
    cachedAnonKey = anonKey.trim();
    localStorage.setItem('apexwire_custom_supabase_url', cachedUrl);
    localStorage.setItem('apexwire_custom_supabase_anon_key', cachedAnonKey);
    client = null; // force re-create
    getSupabaseClient();
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      const { data: { session } } = await sb.auth.getSession();
      if (session?.access_token) {
        return session.access_token;
      }
    } catch (err) {
      console.warn('Error fetching Supabase session:', err);
    }
  }

  if (typeof window !== 'undefined') {
    return localStorage.getItem('apexwire_admin_token');
  }
  return null;
};

// Set up onAuthStateChange listener
export const setupAuthStateListener = (
  callback: (event: AuthChangeEvent | string, session: Session | null) => void
) => {
  const sb = getSupabaseClient();
  if (sb) {
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      console.log('[Supabase Auth Event]:', event, session?.user?.email);
      callback(event, session);
    });
    return () => subscription.unsubscribe();
  }

  // Window event fallback for cross-component sync
  const handler = (e: any) => {
    callback(e.detail?.event || 'CUSTOM_AUTH', e.detail?.session || null);
  };
  window.addEventListener('apexwire_auth_change', handler);
  return () => window.removeEventListener('apexwire_auth_change', handler);
};

// Unified Admin Login (Tries client signInWithPassword, then server proxy fallback)
export const performAdminLogin = async (
  email: string,
  pass: string
): Promise<{ success: boolean; session?: any; user?: any; error?: string }> => {
  const cleanEmail = email.trim();
  const cleanPass = pass.trim();

  // 1. Try client-side Supabase client if available
  const sb = getSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass
      });

      if (!error && data.session && data.user) {
        localStorage.setItem('apexwire_admin_token', data.session.access_token);
        localStorage.setItem('apexwire_admin_email', data.user.email || cleanEmail);
        window.dispatchEvent(
          new CustomEvent('apexwire_auth_change', {
            detail: { event: 'SIGNED_IN', session: data.session }
          })
        );
        return { success: true, session: data.session, user: data.user };
      }

      if (error) {
        console.warn('[Client Auth] signInWithPassword error:', error.message);
        // If it's a credentials error, return user-friendly message
        if (error.message.includes('Invalid login credentials')) {
          return {
            success: false,
            error: 'Invalid login credentials. Please double-check your email and password in Supabase.'
          };
        }
        if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            error: 'Email not confirmed. In Supabase Dashboard -> Authentication -> Users, confirm this user or disable "Confirm email" in Auth Settings.'
          };
        }
      }
    } catch (clientErr: any) {
      console.warn('[Client Auth] Exception:', clientErr);
    }
  }

  // 2. Server-side proxy fallback (Bypasses any browser CORS or missing client key issues)
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPass })
    });

    const data = await res.json();

    if (res.ok && data.session && data.user) {
      localStorage.setItem('apexwire_admin_token', data.session.access_token);
      localStorage.setItem('apexwire_admin_email', data.user.email || cleanEmail);
      window.dispatchEvent(
        new CustomEvent('apexwire_auth_change', {
          detail: { event: 'SIGNED_IN', session: data.session }
        })
      );
      return { success: true, session: data.session, user: data.user };
    }

    const errorMsg = data.error || 'Authentication failed. Please verify your credentials.';
    return { success: false, error: errorMsg };
  } catch (serverErr: any) {
    return {
      success: false,
      error: `Network error reaching authentication server: ${serverErr.message}`
    };
  }
};
