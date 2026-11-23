import React from 'react';

interface BrandProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const ShriShyamLogo: React.FC<BrandProps> = ({ size = 'md', showTagline = true }) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className="flex items-center gap-3">
      {/* Brand Crest with Royal Peacock, Crown & Gold Accent */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-950 via-[#152a1a] to-[#0c1a0f] border border-amber-500/40 shadow-md ${
          isSm ? 'w-10 h-10' : isLg ? 'w-16 h-16' : 'w-12 h-12'
        }`}
      >
        <svg
          viewBox="0 0 100 100"
          className={isSm ? 'w-8 h-8' : isLg ? 'w-13 h-13' : 'w-10 h-10'}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Crown */}
          <path
            d="M30 35 L40 18 L50 28 L60 18 L70 35 Z"
            fill="url(#goldGrad)"
            stroke="#F59E0B"
            strokeWidth="1.5"
          />
          {/* Circular Peacock Feather halo */}
          <circle cx="50" cy="55" r="28" stroke="url(#goldGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="50" cy="55" r="22" fill="#064E3B" opacity="0.6" />
          {/* Peacock feather eye / center motif */}
          <ellipse cx="50" cy="54" rx="14" ry="17" fill="#047857" />
          <ellipse cx="50" cy="54" rx="9" ry="12" fill="#0284C7" />
          <circle cx="50" cy="54" r="5" fill="#1E1B4B" />
          <circle cx="50" cy="52" r="2" fill="#38BDF8" />
          {/* Divine Flute & Om Accent */}
          <rect x="22" y="80" width="56" height="5" rx="2.5" fill="url(#goldGrad)" stroke="#B45309" strokeWidth="0.8" />
          <circle cx="34" cy="82.5" r="1" fill="#152a1a" />
          <circle cx="42" cy="82.5" r="1" fill="#152a1a" />
          <circle cx="50" cy="82.5" r="1" fill="#152a1a" />
          <circle cx="58" cy="82.5" r="1" fill="#152a1a" />
          <circle cx="66" cy="82.5" r="1" fill="#152a1a" />
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h1
            className={`font-extrabold tracking-wider uppercase text-emerald-950 font-serif ${
              isSm ? 'text-base' : isLg ? 'text-2xl' : 'text-lg'
            }`}
            style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}
          >
            Shri Shyam <span className="text-amber-700">Consulting</span>
          </h1>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
            Govt. Regd.
          </span>
        </div>
        {showTagline && (
          <p className="text-xs text-stone-600 flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-stone-800">Naukri Resdex &amp; AI Calling ATS</span>
            <span className="text-stone-400">•</span>
            <span className="text-amber-900 font-medium">Paras Complex, Durg, CG</span>
          </p>
        )}
      </div>
    </div>
  );
};
