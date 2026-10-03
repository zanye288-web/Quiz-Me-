import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { PomodoroProvider } from './context/PomodoroContext.tsx';
import { registerServiceWorker, cacheCoreQuizDataOffline } from './utils/offline';

// Register Service Worker for offline asset caching
registerServiceWorker();
// Precache core starter quizzes into local storage & service worker
cacheCoreQuizDataOffline();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <PomodoroProvider>
          <App />
        </PomodoroProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
);


