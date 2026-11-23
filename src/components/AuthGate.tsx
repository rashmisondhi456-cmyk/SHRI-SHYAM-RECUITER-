import React, { useState } from 'react';
import {
  getAdditionalUserInfo,
  sendEmailVerification,
  signInWithPopup,
  User,
} from 'firebase/auth';
import {
  Lock,
  ShieldCheck,
  Globe,
  Mail,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Phone,
  RefreshCw,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { auth, firebaseProjectId, googleProvider } from '../lib/firebase';
import { ShriShyamLogo } from './ShriShyamLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface AuthGateProps {
  unverifiedUser?: User | null;
  onRefreshVerification?: () => Promise<void>;
  onSignOut?: () => Promise<void>;
}

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export const AuthGate: React.FC<AuthGateProps> = ({
  unverifiedUser,
  onRefreshVerification,
  onSignOut,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [unauthorizedHost, setUnauthorizedHost] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleGoogleAuth = async (intent: 'signin' | 'signup') => {
    setErrorMsg(null);
    setInfoMsg(null);
    setPopupBlocked(false);
    setUnauthorizedHost(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const extra = getAdditionalUserInfo(result);
      if (extra?.isNewUser) {
        setInfoMsg('Google account connected! Creating your encrypted Shri Shyam Consulting workspace...');
      } else if (intent === 'signup') {
        setInfoMsg('This Google account is already registered — signing you in now...');
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-blocked') {
        setPopupBlocked(true);
        setErrorMsg(
          'Browser popup was blocked. Please allow popups for this site or open the app in a full browser tab to complete Google Sign-In.'
        );
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Google sign-in popup was closed before completing authentication. Please try again.');
      } else if (code === 'auth/cancelled-popup-request') {
        setErrorMsg('A Google sign-in window is already open. Please finish signing in or retry.');
      } else if (code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        setUnauthorizedHost(host);
        setErrorMsg(
          `Domain "${host}" is not yet authorized in Firebase Project "${firebaseProjectId}". Add "${host}" under Firebase Console → Authentication → Settings → Authorized domains, then hard-refresh this page.`
        );
      } else if (code === 'auth/operation-not-allowed') {
        setErrorMsg(
          'Google Sign-In is not enabled in Firebase Authentication. Enable the Google provider in Firebase Console → Authentication → Sign-in method.'
        );
      } else if (code === 'auth/network-request-failed') {
        setErrorMsg('Network error while connecting to Google. Please check your internet connection and retry.');
      } else {
        setErrorMsg(err?.message || 'Google authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Unverified email holding screen (edge case if Google Workspace account reports unverified email)
  if (unverifiedUser) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 shadow-xl p-6 space-y-5">
          <ShriShyamLogo size="sm" />
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Mail className="w-4 h-4 text-amber-700" />
              <span>Email Verification Required</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              Your workspace is protected by zero-trust Firestore security rules. Please verify{' '}
              <strong className="text-stone-900">{unverifiedUser.email}</strong> or sign in with a verified Google account.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onRefreshVerification}
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>I Have Verified My Email — Enter App</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                await sendEmailVerification(unverifiedUser);
                setInfoMsg('Verification email sent!');
              }}
              className="w-full py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Send Verification Email
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="w-full py-2 px-4 text-stone-600 hover:text-stone-900 text-xs font-medium cursor-pointer"
            >
              Switch Google Account / Sign Out
            </button>
          </div>

          {infoMsg && (
            <p className="text-xs text-emerald-800 font-medium text-center">{infoMsg}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-emerald-50/40 flex flex-col justify-between">
      {/* Top Corporate Bar */}
      <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>Paras Complex, Durg, CG (491001)</span>
            </span>
            <a
              href="https://www.shrishyamconsulting.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-300 hover:text-white transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>www.shrishyamconsulting.in</span>
            </a>
            <a
              href="mailto:info@shrishyamconsulting.in"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>info@shrishyamconsulting.in</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <PWAInstallButton />
            <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold">
              <Lock className="w-3 h-3" />
              <span>AES-256 Encrypted</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Google Auth Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden">
          {/* Left Branding & Encryption Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-[#122b1e] to-stone-950 text-white p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/80 border border-amber-400/40 text-amber-300 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Google Verified ATS Vault</span>
              </div>

              <h1
                className="text-2xl font-extrabold tracking-wide text-white uppercase leading-snug"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Shri Shyam <span className="text-amber-400">Consulting</span>
              </h1>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Domestic &amp; International Recruitment Suite — Naukri Resdex Talent Search, AI Voice Calling Agent, and Automated Interview Pipeline.
              </p>
            </div>

            <div className="space-y-3 text-xs text-emerald-100/85">
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block">AES-256-GCM PII Encryption</strong>
                  Candidate phone numbers, salaries, &amp; interview logs are encrypted in your private vault.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block">India &amp; International Mandates</strong>
                  Manage Durg/Pan-India hiring alongside UAE, Saudi, Singapore, UK, Canada &amp; Germany openings.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block">Direct Helpline: 8269715615</strong>
                  www.shrishyamconsulting.in • info@shrishyamconsulting.in
                </span>
              </div>
            </div>
          </div>

          {/* Right Google Sign In / Sign Up Panel */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-5">
            <div className="border-b border-stone-200 pb-3">
              <h2 className="text-lg font-bold text-stone-900">
                {mode === 'signin'
                  ? 'Sign In with Google'
                  : 'Sign Up with Google'}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {mode === 'signin'
                  ? 'Sign in with your Google account to unlock your encrypted Shri Shyam Consulting workspace.'
                  : 'Create your verified recruiter account in one click using Google — no separate password needed.'}
              </p>
            </div>

            {/* Mode Switcher: Sign In vs Sign Up */}
            <div className="grid grid-cols-2 gap-1.5 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                id="auth-tab-signin"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setInfoMsg(null);
                  setPopupBlocked(false);
                }}
                className={`py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In (Login)</span>
              </button>
              <button
                type="button"
                id="auth-tab-signup"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setInfoMsg(null);
                  setPopupBlocked(false);
                }}
                className={`py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up (New Account)</span>
              </button>
            </div>

            {/* Workspace Onboarding Card */}
            <div className="rounded-xl bg-stone-50 border border-stone-200 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>
                  {mode === 'signin'
                    ? 'Instant Encrypted Google Access'
                    : 'What happens when you Sign Up with Google'}
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Choose any Gmail or Google Workspace account in the popup</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Automatic email verification &amp; personal Firestore database provisioning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Access Resdex Search, Job Postings, Excel Sheet &amp; AI Calling Agent</span>
                </li>
              </ul>
            </div>

            {/* Primary Google Action Button */}
            <button
              id="btn-google-auth"
              type="button"
              disabled={loading}
              onClick={() => handleGoogleAuth(mode)}
              className="w-full py-3.5 px-5 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-3 shadow-sm cursor-pointer transition-all disabled:opacity-60"
            >
              <span className="bg-white rounded-full p-1 flex items-center justify-center">
                <GoogleIcon className="w-4 h-4" />
              </span>
              <span>
                {loading
                  ? 'Connecting to Google...'
                  : mode === 'signin'
                  ? 'Sign In with Google'
                  : 'Sign Up with Google'}
              </span>
            </button>

            {/* Quick Secondary Switch Link */}
            <div className="text-center text-xs text-stone-500">
              {mode === 'signin' ? (
                <span>
                  New to Shri Shyam Consulting?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg(null);
                    }}
                    className="font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    Create account with Google
                  </button>
                </span>
              ) : (
                <span>
                  Already have a Google workspace?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMsg(null);
                    }}
                    className="font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    Sign In with Google
                  </button>
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
                {unauthorizedHost && (
                  <div className="p-2.5 rounded-lg bg-white border border-rose-200 space-y-1.5 text-[11px] text-stone-700">
                    <div>
                      <strong>Project ID:</strong>{' '}
                      <code className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-900 font-mono">
                        {firebaseProjectId}
                      </code>
                    </div>
                    <div>
                      <strong>Domain to Add:</strong>{' '}
                      <code className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-900 font-mono">
                        {unauthorizedHost}
                      </code>
                    </div>
                    <a
                      href={`https://console.firebase.google.com/project/${firebaseProjectId}/authentication/settings`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold transition-colors mt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Firebase Authorized Domains</span>
                    </a>
                  </div>
                )}
                {popupBlocked && typeof window !== 'undefined' && (
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-900 font-bold hover:bg-rose-100 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open App in New Tab</span>
                  </a>
                )}
              </div>
            )}

            {infoMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{infoMsg}</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
