import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { PomodoroProvider } from './context/PomodoroContext.tsx';
import { registerServiceWorker, cacheCoreQuizDataOffline } from './utils/offline';

// Register Service Worker for offline asset caching
try {
  registerServiceWorker();
  cacheCoreQuizDataOffline();
} catch (err) {
  console.warn('[Boot] Non-critical init skipped:', err);
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, errorMessage: '' };
  declare props: Readonly<ErrorBoundaryProps>;
  declare setState: React.Component<ErrorBoundaryProps, ErrorBoundaryState>['setState'];

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected rendering issue occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[QuizMe ErrorBoundary] Caught UI error:', error, errorInfo);
  }

  handleRecover = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      // ignore
    }
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white p-6">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto text-2xl shadow-lg">
              🦉
            </div>
            <h2 className="text-xl font-black tracking-tight">QuizMe! Quick Recovery</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              We refreshed the display engine to keep everything running smoothly. Click below to jump right back in!
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, errorMessage: '' })}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
              >
                Retry Render
              </button>
              <button
                type="button"
                onClick={this.handleRecover}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-black text-white shadow-lg cursor-pointer"
              >
                Refresh App
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <AppErrorBoundary>
        <AuthProvider>
          <ThemeProvider>
            <PomodoroProvider>
              <App />
            </PomodoroProvider>
          </ThemeProvider>
        </AuthProvider>
      </AppErrorBoundary>
    </StrictMode>
  );
}
