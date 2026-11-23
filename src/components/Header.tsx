import React from 'react';
import { ShriShyamLogo } from './ShriShyamLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  Bot, 
  Kanban, 
  CalendarCheck, 
  Briefcase,
  Globe,
  Lock,
  LogOut,
  Home
} from 'lucide-react';

export type TabType = 'home' | 'resdex' | 'ai-calling' | 'ats' | 'interviews' | 'job-postings';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  candidateCount: number;
  scheduledCount: number;
  callingQueueCount: number;
  userEmail?: string | null;
  userName?: string | null;
  userPhotoUrl?: string | null;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  candidateCount,
  scheduledCount,
  callingQueueCount,
  userEmail,
  userName,
  userPhotoUrl,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 shadow-xs">
      {/* Top Corporate Bar with direct contact, website & encrypted auth status */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>Paras Complex, Durg, CG (491001)</span>
            </span>
            <span className="hidden md:inline text-stone-600">|</span>
            <a
              href="https://www.shrishyamconsulting.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-300 hover:text-white transition-colors font-medium"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>www.shrishyamconsulting.in</span>
            </a>
            <span className="hidden md:inline text-stone-600">|</span>
            <a
              href="tel:8269715615"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold tracking-wide">8269715615</span>
            </a>
            <span className="hidden md:inline text-stone-600">|</span>
            <a
              href="mailto:info@shrishyamconsulting.in"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>info@shrishyamconsulting.in</span>
            </a>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <PWAInstallButton />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-700/50 text-[11px] font-medium">
              <Lock className="w-3 h-3 text-amber-300" />
              <span className="hidden sm:inline">AES-256 Encrypted</span>
            </span>
            {userEmail && (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-700">
                {userPhotoUrl ? (
                  <img
                    src={userPhotoUrl}
                    alt={userName || userEmail}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full border border-emerald-500/60 object-cover"
                  />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-emerald-800 text-amber-300 text-[10px] font-bold flex items-center justify-center">
                    {(userName || userEmail).charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-[11px] text-stone-300 hidden md:inline truncate max-w-[160px]" title={userEmail}>
                  {userName || userEmail}
                </span>
                {onSignOut && (
                  <button
                    id="btn-sign-out"
                    type="button"
                    onClick={onSignOut}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-[11px] font-semibold cursor-pointer transition-colors"
                    title="Sign out and switch Google account"
                  >
                    <LogOut className="w-3 h-3 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <ShriShyamLogo />

        {/* Action Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            id="tab-home"
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'home'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            id="tab-resdex"
            onClick={() => setActiveTab('resdex')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'resdex'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Resdex Search</span>
            <span
              className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'resdex'
                  ? 'bg-emerald-950 text-emerald-200'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              {candidateCount}
            </span>
          </button>

          <button
            id="tab-calling"
            onClick={() => setActiveTab('ai-calling')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ai-calling'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-400" />
            <span>AI Calling Agent</span>
            {callingQueueCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            )}
          </button>

          <button
            id="tab-ats"
            onClick={() => setActiveTab('ats')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ats'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>ATS Pipeline</span>
          </button>

          <button
            id="tab-interviews"
            onClick={() => setActiveTab('interviews')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'interviews'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Interviews</span>
            {scheduledCount > 0 && (
              <span
                className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'interviews'
                    ? 'bg-emerald-950 text-emerald-200'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {scheduledCount}
              </span>
            )}
          </button>

          <button
            id="tab-jobs"
            onClick={() => setActiveTab('job-postings')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'job-postings'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Job Postings</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
