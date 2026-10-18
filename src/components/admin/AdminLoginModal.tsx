import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, AlertCircle, Key, Check, Server, ShieldCheck, HelpCircle } from 'lucide-react';
import {
  getSupabaseClient,
  performAdminLogin,
  setupAuthStateListener,
  saveCustomSupabaseKeys,
  loadPublicConfig,
  isAuthorizedAdmin
} from '../../lib/supabaseClient';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, token: string) => void;
  initialError?: string | null;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialError
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [helpTip, setHelpTip] = useState<string | null>(null);

  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  // Advanced Key config drawer
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customAnonKey, setCustomAnonKey] = useState('');
  const [keysSaved, setKeysSaved] = useState(false);
  const [serverStatus, setServerStatus] = useState<any>(null);

  // Check server configuration & setup listener
  useEffect(() => {
    if (!isOpen) return;

    // Listen for Supabase onAuthStateChange - ONLY log in if valid active session AND authorized email
    const unsubscribe = setupAuthStateListener((event, session) => {
      if (session && session.user && session.access_token && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        const userEmail = session.user.email || '';
        if (isAuthorizedAdmin(userEmail)) {
          console.log('[onAuthStateChange] Authorized admin signed in:', userEmail);
          onLoginSuccess(userEmail, session.access_token);
          onClose();
        } else {
          console.warn('[onAuthStateChange] Unauthorized user blocked:', userEmail);
          setError(`Access Blocked: Account "${userEmail}" is not authorized. Access is strictly restricted to authorized administrators.`);
        }
      }
    });

    // Check server status
    fetch('/api/admin/status')
      .then((r) => r.json())
      .then((data) => setServerStatus(data))
      .catch(() => {});

    loadPublicConfig().then((cfg) => {
      if (cfg.url) setCustomUrl(cfg.url);
      if (cfg.anonKey) setCustomAnonKey(cfg.anonKey);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHelpTip(null);

    // Verify email matches admin before proceeding
    if (!isAuthorizedAdmin(email)) {
      setError(`Access Blocked: "${email.trim()}" is not an authorized administrator email.`);
      setLoading(false);
      return;
    }

    const result = await performAdminLogin(email, password);

    if (result.success && result.session && result.user) {
      const userEmail = result.user.email || email;
      if (!isAuthorizedAdmin(userEmail)) {
        const sb = getSupabaseClient();
        if (sb) await sb.auth.signOut();
        localStorage.removeItem('apexwire_admin_token');
        localStorage.removeItem('apexwire_admin_email');
        setError(`Access Blocked: Account "${userEmail}" is not authorized. Access is strictly restricted to authorized administrators.`);
        setLoading(false);
        return;
      }
      onLoginSuccess(userEmail, result.session.access_token);
      onClose();
      return;
    }

    // Set clear UI error message
    const errorText = result.error || 'Authentication failed. Please verify your credentials in Supabase.';
    setError(errorText);

    // Provide contextual tips
    if (errorText.toLowerCase().includes('confirm') || errorText.toLowerCase().includes('not confirmed')) {
      setHelpTip(
        'Tip: In your Supabase Dashboard -> Authentication -> Users, make sure the user has a confirmed email (or toggle off "Confirm email" in Auth -> Providers -> Email).'
      );
    } else if (errorText.toLowerCase().includes('invalid login credentials')) {
      setHelpTip(
        'Tip: Ensure the user exists in Supabase Dashboard -> Authentication -> Users, and the password matches.'
      );
    }

    setLoading(false);
  };



  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl || !customAnonKey) {
      setError('Please provide both Supabase Project URL and Anon Key.');
      return;
    }
    saveCustomSupabaseKeys(customUrl, customAnonKey);
    setKeysSaved(true);
    setTimeout(() => {
      setKeysSaved(false);
      setShowKeyConfig(false);
      setError(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/75 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">ApexWire Admin Authentication</h3>
              <p className="text-[11px] text-neutral-500">Supabase Auth Protected Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Connection Status Indicator */}
          {serverStatus && (
            <div className="flex items-center justify-between p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs">
              <span className="text-neutral-600 font-medium">Supabase Backend:</span>
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span>Configured & Online</span>
              </span>
            </div>
          )}

          {/* Clear Error Notification Banner */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs text-rose-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold leading-snug">{error}</span>
              </div>
              {helpTip && (
                <div className="pl-6 text-[11px] text-rose-700 leading-relaxed font-normal">
                  {helpTip}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 block">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-xl text-xs text-neutral-900 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 block">
                Supabase Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-xl text-xs text-neutral-900 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white rounded-xl text-xs font-semibold transition-all shadow flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {loading ? (
                <span>Authenticating with Supabase...</span>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Authorized Admin Notice */}
          <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-2 text-[11px] text-neutral-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Admin access strictly restricted to <strong className="text-neutral-900 font-medium">authorized administrators</strong></span>
            </div>

            <button
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className="text-[11px] text-neutral-500 hover:text-neutral-900 text-center cursor-pointer underline transition-colors"
            >
              {showKeyConfig ? 'Hide Supabase Keys' : 'Inspect or Override Supabase Client Keys'}
            </button>
          </div>

          {/* Inline Supabase Keys Form */}
          {showKeyConfig && (
            <form onSubmit={handleSaveKeys} className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2.5 text-xs">
              <div className="font-semibold text-neutral-800 text-[11px]">Browser Supabase Client Setup:</div>
              <div>
                <label className="text-[10px] text-neutral-500 block mb-0.5">NEXT_PUBLIC_SUPABASE_URL</label>
                <input
                  type="text"
                  placeholder="https://xyz.supabase.co"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 block mb-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={customAnonKey}
                  onChange={(e) => setCustomAnonKey(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-900 text-white rounded text-xs font-medium cursor-pointer"
              >
                {keysSaved ? 'Saved!' : 'Save Client Keys to Browser'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
