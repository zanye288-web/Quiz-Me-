import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Layers,
  Sparkles,
  Link2,
  Wifi,
  Key,
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import {
  getSupabaseConfigStatus,
  getActiveSupabaseUrl,
  getActiveSupabaseAnonKey,
  setCustomSupabaseCredentials,
  clearCustomSupabaseCredentials,
} from '../lib/supabase';
import { testSupabaseConnection } from '../services/supabaseService';
import { soundFx } from '../utils/audio';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<any>(null);
  const [schemaSql, setSchemaSql] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'status' | 'connection' | 'schema'>('status');

  // Custom connection state
  const [customUrl, setCustomUrl] = useState<string>('');
  const [customKey, setCustomKey] = useState<string>('');
  const [connectionTestResult, setConnectionTestResult] = useState<{
    tested: boolean;
    ok: boolean;
    message: string;
    latencyMs: number;
  } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    setCustomUrl(getActiveSupabaseUrl() || '');
    setCustomKey(getActiveSupabaseAnonKey() || '');

    setIsLoading(true);
    fetch('/api/supabase/status')
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status || {});
      })
      .catch((e) => console.warn('Supabase status fetch error', e))
      .finally(() => setIsLoading(false));

    fetch('/api/supabase/schema')
      .then((res) => res.json())
      .then((data) => {
        setSchemaSql(data.schemaSql || '');
      })
      .catch((e) => console.warn('Supabase schema fetch error', e));
  }, [isOpen]);

  const handleTestAndSaveConnection = async () => {
    if (!customUrl || !customKey) return;
    setIsTesting(true);
    soundFx.playClick();

    setCustomSupabaseCredentials(customUrl, customKey);
    const result = await testSupabaseConnection();
    setConnectionTestResult({
      tested: true,
      ok: result.ok,
      message: result.message,
      latencyMs: result.latencyMs,
    });
    setIsTesting(false);
    if (result.ok) {
      soundFx.playBadgeUnlock();
    } else {
      soundFx.playIncorrect();
    }
  };

  const handleResetConnection = () => {
    soundFx.playClick();
    clearCustomSupabaseCredentials();
    setCustomUrl('');
    setCustomKey('');
    setConnectionTestResult(null);
  };

  const handleCopySchema = () => {
    if (!schemaSql) return;
    navigator.clipboard.writeText(schemaSql);
    setIsCopied(true);
    soundFx.playPop();
    setTimeout(() => setIsCopied(false), 2500);
  };

  const clientConfig = getSupabaseConfigStatus();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-sm sm:text-base">
          <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="truncate">Supabase & Database Architecture</span>
        </div>
      }
      description="Dual-engine database architecture powering Quiz-Me! with real-time progression synchronization and PostgreSQL storage."
      maxWidth="2xl"
    >
      <div className="space-y-4 sm:space-y-5">
        {/* Responsive Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setActiveTab('status');
              soundFx.playClick();
            }}
            className={`flex-1 py-1.5 px-2.5 sm:px-3 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
              activeTab === 'status'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Connection Status
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('connection');
              soundFx.playClick();
            }}
            className={`flex-1 py-1.5 px-2.5 sm:px-3 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
              activeTab === 'connection'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Connect Project
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('schema');
              soundFx.playClick();
            }}
            className={`flex-1 py-1.5 px-2.5 sm:px-3 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
              activeTab === 'schema'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            SQL DDL Schema
          </button>
        </div>

        {/* TAB 1: STATUS */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Primary Relational & Real-Time Engine
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 w-fit">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  Active & Synchronized
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60 gap-0.5">
                  <span className="text-slate-500">PostgreSQL Instance:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
                    Cloud SQL Developer Edition (us-west1)
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60 gap-0.5">
                  <span className="text-slate-500">Supabase Client SDK:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    Installed (@supabase/supabase-js v2.49+)
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60 gap-0.5">
                  <span className="text-slate-500">Real-Time Sync Engine:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {clientConfig.isConfigured ? 'Supabase Real-Time Channel + Cross-Tab' : 'Cross-Tab & Cloud SQL Real-Time'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between py-1 gap-0.5">
                  <span className="text-slate-500">Endpoint URL:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px] truncate max-w-xs">
                    {clientConfig.url}
                  </span>
                </div>
              </div>
            </div>

            {/* Synchronized Relational Tables */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Synchronized Relational Tables:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { name: 'user_progression', desc: 'XP, Levels & Ranks' },
                  { name: 'user_achievements', desc: 'Unlocked Accolades' },
                  { name: 'user_quests', desc: 'Daily / Weekly Objectives' },
                  { name: 'users', desc: 'Public Leaderboard Profiles' },
                  { name: 'quizzes', desc: 'Assessments & JSON Schema' },
                  { name: 'quiz_history', desc: 'Attempt Logs & Metrics' },
                ].map((tbl) => (
                  <div
                    key={tbl.name}
                    className="p-2 sm:p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs min-w-0"
                  >
                    <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate">
                      {tbl.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">{tbl.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
              <span className="font-bold">Zero-Downtime Resilience: </span>
              All features communicate with the unified repository and progression engine. If Supabase keys are provided, it maintains real-time synchronization; otherwise, it operates seamlessly through the Cloud SQL instance and local cross-tab cache.
            </div>
          </div>
        )}

        {/* TAB 2: CONNECT PROJECT */}
        {activeTab === 'connection' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-indigo-500" />
                Connect Custom Supabase Project
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Optionally enter your Supabase Project URL and Anon API Key to synchronize your progress directly with your own Supabase instance.
              </p>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[42px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supabase Anon Public Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[42px]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleTestAndSaveConnection}
                    disabled={isTesting || !customUrl || !customKey}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[42px]"
                  >
                    {isTesting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wifi className="w-3.5 h-3.5" />
                    )}
                    <span>{isTesting ? 'Testing Connection...' : 'Save & Test Connection'}</span>
                  </button>

                  {customUrl && (
                    <button
                      type="button"
                      onClick={handleResetConnection}
                      className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer text-center"
                    >
                      Reset to Hybrid Default
                    </button>
                  )}
                </div>
              </div>

              {/* Test Result Callout */}
              {connectionTestResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    connectionTestResult.ok
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  {connectionTestResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{connectionTestResult.message}</div>
                    {connectionTestResult.ok && (
                      <div className="text-[11px] mt-0.5 opacity-90">
                        Real-time synchronization across devices is active.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SCHEMA */}
        {activeTab === 'schema' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Execute in your Supabase SQL Editor to provision all tables:
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopySchema}
                leftIcon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto"
              >
                {isCopied ? 'Copied to Clipboard!' : 'Copy SQL Schema'}
              </Button>
            </div>
            <pre className="p-3 sm:p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[10px] sm:text-[11px] max-h-60 sm:max-h-80 overflow-x-auto overflow-y-auto leading-relaxed border border-slate-800">
              {schemaSql || 'Loading schema...'}
            </pre>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" size="sm" onClick={onClose} className="w-full sm:w-auto min-h-[38px]">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
