import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical,
  Monitor,
  ExternalLink,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isInIframe, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'android' | 'ios' | 'desktop'>(
    isIOS ? 'ios' : isAndroid ? 'android' : 'desktop'
  );
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Suppress install UI if already running as an installed standalone PWA
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        // User dismissed native dialog; keep button available
      }
      return;
    }

    // Set default platform tab cleanly before opening modal
    setSelectedPlatform(isIOS ? 'ios' : isAndroid ? 'android' : 'desktop');
    setShowGuideModal(true);
  };

  const handleCopyUrl = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '/';

  return (
    <>
      <button
        id="btn-pwa-install"
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-[11px] shadow-xs transition-colors cursor-pointer shrink-0"
        title="Install Shri Shyam ATS on your mobile or desktop device"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-stone-200 shadow-2xl overflow-hidden text-stone-900">
            {/* Header */}
            <div className="bg-emerald-950 text-white px-5 py-4 flex items-center justify-between border-b border-amber-500/30">
              <div className="flex items-center gap-3">
                <img
                  src={`${import.meta.env.BASE_URL}pwa-192x192.png`}
                  alt="Shyam ATS Icon"
                  className="w-10 h-10 rounded-xl border border-amber-400/50 shadow-sm"
                />
                <div>
                  <h3 id="pwa-install-title" className="text-sm font-bold text-white">
                    Install Shyam ATS on Device
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    Shri Shyam Consulting • Offline-Ready App
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-900 cursor-pointer transition-colors"
                aria-label="Close install guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* If running inside an iframe preview, inform user to open top-level tab */}
              {isInIframe && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <p className="text-amber-950 font-medium leading-relaxed">
                    You are viewing inside an embedded preview frame. Browsers require opening the app in a full browser tab to trigger device installation:
                  </p>
                  <div className="flex items-center gap-2">
                    <a
                      href={currentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                      <span>Open in New Tab to Install</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-semibold cursor-pointer transition-colors"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUrl ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Platform Switcher Tabs */}
              <div className="grid grid-cols-3 gap-1.5 bg-stone-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('android')}
                  className={`py-1.5 px-2 rounded-md font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    selectedPlatform === 'android'
                      ? 'bg-white text-emerald-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('ios')}
                  className={`py-1.5 px-2 rounded-md font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    selectedPlatform === 'ios'
                      ? 'bg-white text-emerald-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>iPhone / iPad</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('desktop')}
                  className={`py-1.5 px-2 rounded-md font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    selectedPlatform === 'desktop'
                      ? 'bg-white text-emerald-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
              </div>

              {/* Platform-Specific Instructions */}
              {selectedPlatform === 'android' && (
                <ol className="space-y-2.5 text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <span>
                      Open this app in <strong>Google Chrome</strong> or <strong>Edge</strong> on your Android phone.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <span className="flex items-center gap-1 flex-wrap">
                      Tap the <MoreVertical className="w-3.5 h-3.5 inline text-stone-700" /> <strong>Menu</strong> icon in the top-right corner.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <span>
                      Select <strong>Add to Home screen</strong> or <strong>Install app</strong> and confirm <strong>Install</strong>.
                    </span>
                  </li>
                </ol>
              )}

              {selectedPlatform === 'ios' && (
                <ol className="space-y-2.5 text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <span>
                      Open this link in <strong>Safari</strong> on your iPhone or iPad.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <span className="flex items-center gap-1 flex-wrap">
                      Tap the <Share className="w-3.5 h-3.5 inline text-sky-600" /> <strong>Share</strong> button in the Safari toolbar.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <span className="flex items-center gap-1 flex-wrap">
                      Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline text-stone-700" /> <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
                    </span>
                  </li>
                </ol>
              )}

              {selectedPlatform === 'desktop' && (
                <ol className="space-y-2.5 text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <span>
                      Open the app in a full <strong>Chrome</strong> or <strong>Microsoft Edge</strong> window.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <span>
                      Click the <strong>Install</strong> icon on the right side of the browser address bar (or open browser menu → <strong>Cast, save, and share → Install page as app</strong>).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <span>
                      Click <strong>Install</strong> to launch Shyam ATS in its own standalone desktop window.
                    </span>
                  </li>
                </ol>
              )}

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold cursor-pointer transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
