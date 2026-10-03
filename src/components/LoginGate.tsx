import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  HelpCircle,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { soundFx } from '../utils/audio';
import { PersonaType } from '../types/quiz';
import { AppLogo } from './AppLogo';

export const LoginGate: React.FC = () => {
  const {
    signInWithGoogle,
    signInWithMicrosoft,
    signInWithDiscord,
    signInWithInstagram,
    signInWithTikTok,
    signInAsGuest,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    isAuthLoading,
    isSwitchingAccount,
  } = useAuth();

  const { resolvedTheme, toggleTheme } = useTheme();

  // Mode: 'signin' | 'signup' | 'forgot_password'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot_password'>('signin');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<PersonaType>('Student');
  const [rememberMe, setRememberMe] = useState(true);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNetworkRestricted, setIsNetworkRestricted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [oauthNoticeModal, setOauthNoticeModal] = useState<{ provider: string; message: string } | null>(null);

  // Clean friendly error parser
  const getFriendlyErrorMessage = (err: any, defaultMsg: string): string => {
    const code = err?.code || '';
    if (code === 'auth/network-request-failed' || err?.message?.includes('network-request-failed')) {
      setIsNetworkRestricted(true);
      return 'Google sign-in popup was blocked by browser iframe security or cross-origin cookie restrictions.';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      return 'Incorrect email or password. Please verify and try again.';
    }
    if (code === 'auth/user-not-found') {
      return 'No registered scholar found with this email. Switch to "Create Account" above!';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account already exists with this email. Switch to "Sign In" above!';
    }
    if (code === 'auth/weak-password') {
      return 'Password must be at least 6 characters long.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'This authentication method is not yet enabled in the Firebase Auth console.';
    }
    return err?.message || defaultMsg;
  };

  // Handle Instant Scholar (Guest) Access
  const handleInstantScholarAccess = async () => {
    try {
      setErrorMessage(null);
      setIsNetworkRestricted(false);
      setActiveProvider('guest');
      soundFx.playCorrect();
      await signInAsGuest('Scholar', selectedRole);
    } catch (err: any) {
      console.warn('Instant Scholar access notice:', err);
      setErrorMessage('Could not initialize scholar session. Please try again.');
    } finally {
      setActiveProvider(null);
    }
  };

  // Open App in Standalone Tab
  const handleOpenInNewTab = () => {
    try {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
    } catch {
      // fallback
    }
  };

  // Handle Social Authentication
  const handleSocialSignIn = async (
    providerKey: 'google' | 'microsoft' | 'discord' | 'instagram' | 'tiktok',
    providerName: string,
    action: () => Promise<void>
  ) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setActiveProvider(providerKey);
      soundFx.playClick();
      await action();
    } catch (err: any) {
      console.warn(`${providerName} login notice:`, err);
      if (err?.code === 'auth/popup-closed-by-user') {
        return; // silently ignore
      }

      // Check for unconfigured custom OAuth provider in Firebase Console
      if (
        err?.code === 'auth/configuration-not-found' ||
        err?.code === 'auth/invalid-provider-id' ||
        err?.code === 'auth/operation-not-allowed' ||
        err?.code?.includes('oauth')
      ) {
        setOauthNoticeModal({
          provider: providerName,
          message: `${providerName} authentication requires your application Client ID and Client Secret to be configured in your Firebase Auth Console under Sign-in Providers. In the meantime, you can sign in directly with Google or use the Email & Password fields.`,
        });
      } else {
        setErrorMessage(getFriendlyErrorMessage(err, `Could not sign in with ${providerName}.`));
      }
    } finally {
      setActiveProvider(null);
    }
  };

  // Handle Email & Password Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setActiveProvider('email_signin');
      soundFx.playClick();
      await signInWithEmail(email.trim(), password);
    } catch (err: any) {
      console.error('Email sign in failed:', err);
      setErrorMessage(getFriendlyErrorMessage(err, 'Sign in failed. Please check your credentials.'));
      soundFx.playIncorrect();
    } finally {
      setActiveProvider(null);
    }
  };

  // Handle Email & Password Sign Up (Create Account)
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please provide an email address and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setActiveProvider('email_signup');
      soundFx.playClick();
      await signUpWithEmail(email.trim(), password, displayName.trim() || 'Scholar', selectedRole);
    } catch (err: any) {
      console.error('Sign up failed:', err);
      setErrorMessage(getFriendlyErrorMessage(err, 'Could not create account. Please check your details.'));
      soundFx.playIncorrect();
    } finally {
      setActiveProvider(null);
    }
  };

  // Handle Password Reset Request
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter the email address linked to your account.');
      return;
    }

    try {
      setErrorMessage(null);
      setActiveProvider('reset_password');
      soundFx.playClick();
      await resetPassword(email.trim());
      setSuccessMessage(`Password reset link sent to ${email.trim()}! Please check your inbox.`);
      soundFx.playCorrect();
    } catch (err: any) {
      console.error('Password reset failed:', err);
      setErrorMessage(getFriendlyErrorMessage(err, 'Could not send password reset email.'));
      soundFx.playIncorrect();
    } finally {
      setActiveProvider(null);
    }
  };

  const isAnyLoading = isAuthLoading || activeProvider !== null;

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Dynamic Animated Ambient Mesh Backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-pink-500/10 blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute top-[60%] -right-[15%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-bl from-cyan-500/15 via-blue-500/15 to-emerald-500/10 blur-3xl transform translate-x-1/3 -translate-y-1/3 animate-pulse" />
      </div>

      {/* Header with Brand & Theme Switcher */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <AppLogo size="md" mood="happy" subtitleText="AI Multimodal Assessment Platform" />

        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            toggleTheme();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
          title="Toggle Theme"
        >
          {resolvedTheme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Dark</span>
            </>
          )}
        </button>
      </header>

      {/* Main Login Card Section */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg mx-auto">
          {/* Main Card */}
          <div className="relative rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 shadow-xl shadow-slate-200/50 dark:shadow-black/50 p-6 sm:p-8 backdrop-blur-xl transition-all">
            {/* Top Badge */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Scholar Access Required</span>
              </div>
            </div>

            {/* Switch Account Notice */}
            {isSwitchingAccount && (
              <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
                <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5 text-left">
                  <p className="font-extrabold text-amber-900 dark:text-amber-200">
                    Switching Scholar Account
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                    Select a different Google account or enter new credentials to switch your active profile.
                  </p>
                </div>
              </div>
            )}

            {/* Title & Subtitle */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                {authMode === 'signup'
                  ? 'Create Your Scholar Account'
                  : authMode === 'forgot_password'
                  ? 'Reset Your Password'
                  : 'Welcome Back to QuizMe'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {authMode === 'signup'
                  ? 'Join QuizMe to generate custom AI assessments, track Bloom taxonomy mastery, and sync your study journey.'
                  : authMode === 'forgot_password'
                  ? 'Enter your registered email and we will send you a secure link to reset your password.'
                  : 'Sign in to access your quizzes, analytics dashboard, and cloud-synced study progress.'}
              </p>
            </div>

            {/* Auth Mode Toggle Tabs (Sign In vs Create Account) */}
            {authMode !== 'forgot_password' && (
              <div className="grid grid-cols-2 p-1.5 mb-6 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  id="tab-signin-btn"
                  onClick={() => {
                    soundFx.playClick();
                    setAuthMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Log In / Sign In
                </button>
                <button
                  type="button"
                  id="tab-signup-btn"
                  onClick={() => {
                    soundFx.playClick();
                    setAuthMode('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Error Notification with Actionable iFrame Recovery */}
            {errorMessage && (
              <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-2.5 text-rose-700 dark:text-rose-300 text-xs">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <div className="flex-1 font-medium leading-relaxed">
                    {errorMessage}
                  </div>
                </div>

                {isNetworkRestricted && (
                  <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/60 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleOpenInNewTab}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 hover:bg-rose-100/50 text-rose-800 dark:text-rose-200 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                    >
                      <span>🚀 Open in New Window</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleInstantScholarAccess}
                      disabled={isAnyLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>⚡ Instant Scholar Access</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Success Notification */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="flex-1">{successMessage}</span>
              </div>
            )}

            {/* Social Logins Section */}
            {authMode !== 'forgot_password' && (
              <div className="space-y-3 mb-6">
                {/* 1. Primary Google Button */}
                <button
                  type="button"
                  id="google-login-btn"
                  onClick={() => handleSocialSignIn('google', 'Google', signInWithGoogle)}
                  disabled={isAnyLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group relative"
                >
                  {activeProvider === 'google' ? (
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Connecting to Google...</span>
                    </div>
                  ) : (
                    <>
                      {/* Google G Logo */}
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all ml-auto" />
                    </>
                  )}
                </button>

                {/* 2. Instant Guest Scholar Access Button */}
                <button
                  type="button"
                  id="guest-scholar-login-btn"
                  onClick={handleInstantScholarAccess}
                  disabled={isAnyLoading}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 via-purple-50/70 to-indigo-50/70 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-indigo-950/40 hover:from-indigo-100/80 hover:to-purple-100/80 dark:hover:from-indigo-900/60 dark:hover:to-purple-900/60 text-indigo-900 dark:text-indigo-200 font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {activeProvider === 'guest' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Entering as Scholar...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Instant Scholar Access (Try Without Login)</span>
                    </>
                  )}
                </button>

                {/* 3. Grid of Social Options: Microsoft, Discord, Instagram, TikTok */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Microsoft */}
                  <button
                    type="button"
                    id="microsoft-login-btn"
                    onClick={() => handleSocialSignIn('microsoft', 'Microsoft', signInWithMicrosoft)}
                    disabled={isAnyLoading}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer disabled:opacity-60 hover:border-slate-300 dark:hover:border-slate-600"
                    title="Sign in with Microsoft"
                  >
                    {activeProvider === 'microsoft' ? (
                      <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 23 23">
                        <path fill="#f35325" d="M1 1h10v10H1z" />
                        <path fill="#81bc06" d="M12 1h10v10H12z" />
                        <path fill="#05a6f0" d="M1 12h10v10H1z" />
                        <path fill="#ffba08" d="M12 12h10v10H12z" />
                      </svg>
                    )}
                    <span className="truncate">Microsoft</span>
                  </button>

                  {/* Discord */}
                  <button
                    type="button"
                    id="discord-login-btn"
                    onClick={() => handleSocialSignIn('discord', 'Discord', signInWithDiscord)}
                    disabled={isAnyLoading}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer disabled:opacity-60 hover:border-[#5865F2]/50"
                    title="Sign in with Discord"
                  >
                    {activeProvider === 'discord' ? (
                      <div className="w-3.5 h-3.5 border-2 border-[#5865F2] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5 text-[#5865F2] fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                    )}
                    <span className="truncate">Discord</span>
                  </button>

                  {/* Instagram */}
                  <button
                    type="button"
                    id="instagram-login-btn"
                    onClick={() => handleSocialSignIn('instagram', 'Instagram', signInWithInstagram)}
                    disabled={isAnyLoading}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer disabled:opacity-60 hover:border-pink-500/50"
                    title="Sign in with Instagram"
                  >
                    {activeProvider === 'instagram' ? (
                      <div className="w-3.5 h-3.5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <defs>
                          <linearGradient id="ig-btn-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#fdf497" />
                            <stop offset="25%" stopColor="#fd5949" />
                            <stop offset="60%" stopColor="#d6249f" />
                            <stop offset="100%" stopColor="#285AEB" />
                          </linearGradient>
                        </defs>
                        <path fill="url(#ig-btn-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    )}
                    <span className="truncate">Instagram</span>
                  </button>

                  {/* TikTok */}
                  <button
                    type="button"
                    id="tiktok-login-btn"
                    onClick={() => handleSocialSignIn('tiktok', 'TikTok', signInWithTikTok)}
                    disabled={isAnyLoading}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer disabled:opacity-60 hover:border-slate-400 dark:hover:border-slate-500"
                    title="Sign in with TikTok"
                  >
                    {activeProvider === 'tiktok' ? (
                      <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5 shrink-0 fill-current" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .57.04.84.11V9.34a6.33 6.33 0 0 0-.84-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34-6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.27 8.27 0 0 0 4.84 1.57V7.17c-.36 0-.73-.16-1.07-.48z" />
                      </svg>
                    )}
                    <span className="truncate">TikTok</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Or with email & password
                  </span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>
              </div>
            )}

            {/* Form View 1: Sign In Mode */}
            {authMode === 'signin' && (
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Scholar Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="scholar@university.edu"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setAuthMode('forgot_password');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Remember my session on this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  id="email-signin-submit-btn"
                  disabled={isAnyLoading}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {activeProvider === 'email_signin' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In with Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Form View 2: Sign Up Mode (Create Account) */}
            {authMode === 'signup' && (
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name / Scholar Alias
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Alex Morgan or Dr. Turing"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Academic Persona
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('Student')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedRole === 'Student'
                          ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <span>🎓 Student Scholar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('Teacher')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedRole === 'Teacher'
                          ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <span>👨‍🏫 Teacher / Creator</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="scholar@university.edu"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Password (min 6)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  id="email-signup-submit-btn"
                  disabled={isAnyLoading}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {activeProvider === 'email_signup' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Scholar Profile...</span>
                    </div>
                  ) : (
                    <>
                      <span>Create Free Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Form View 3: Forgot Password Reset Flow */}
            {authMode === 'forgot_password' && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Account Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="scholar@university.edu"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isAnyLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-60"
                  >
                    {activeProvider === 'reset_password' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Link...</span>
                      </div>
                    ) : (
                      <span>Send Password Reset Link</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setAuthMode('signin');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Profile Customization Note */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Optional Profile Customization:</span> You can customize your avatar, bio, and academic target goals right after signing in, or adjust them anytime in Settings.
              </p>
            </div>

            {/* Security Guarantee */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Protected by Firebase Authentication & Firestore Security Rules</span>
            </div>
          </div>

          {/* Quick Feature Grid Below Card */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1 text-indigo-600 dark:text-indigo-400">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-bold">Multi-Modal AI</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Generate exams from notes, PDFs, or live topics instantly.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1 text-emerald-600 dark:text-emerald-400">
                <Cloud className="w-4 h-4" />
                <span className="text-xs font-bold">Cloud Persistence</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Automatic synchronization for XP, diplomas, and history.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* OAuth Notice Modal for Providers requiring project console registration */}
      {oauthNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {oauthNoticeModal.provider} Provider Setup
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOauthNoticeModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {oauthNoticeModal.message}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  setOauthNoticeModal(null);
                  handleSocialSignIn('google', 'Google', signInWithGoogle);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer text-center"
              >
                Sign in with Google Instead
              </button>
              <button
                type="button"
                onClick={() => {
                  setOauthNoticeModal(null);
                  setAuthMode('signin');
                }}
                className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-center"
              >
                Use Email & Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/50 dark:border-slate-800/50">
        QuizMe AI Assessment Platform &copy; {new Date().getFullYear()} • Powered by Gemini & Firebase
      </footer>
    </div>
  );
};
