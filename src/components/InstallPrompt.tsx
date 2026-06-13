import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share, X } from 'lucide-react';

type BeforeInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'pwa-install-dismissed';

/** Banner discreto para instalar la PWA. Android/Chrome usa beforeinstallprompt; iOS muestra un hint. */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPrompt | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem(DISMISS_KEY)) return; } catch { /* sin storage → seguir */ }

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    if (isIOS) { setIosHint(true); setShow(true); return; }

    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as BeforeInstallPrompt); setShow(true); };
    const onInstalled = () => setShow(false);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  function dismiss() {
    setShow(false);
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="fixed inset-x-3 bottom-[6rem] z-50 max-w-xl mx-auto"
          role="dialog"
          aria-label="Instalar la app"
        >
          <div className="rounded-2xl bg-white shadow-lg border border-sand-dark px-4 py-3 flex items-center gap-3">
            <img src="/viajes-app/pwa-192x192.png" alt="" className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-sm text-gray-800">Instalar Nuestros Viajes</p>
              {iosHint ? (
                <p className="text-xs text-gray-500 leading-snug">
                  Toca <Share className="inline w-3.5 h-3.5 -mt-0.5" aria-hidden /> Compartir y luego “Añadir a inicio”.
                </p>
              ) : (
                <p className="text-xs text-gray-500">Ábrela como app y úsala sin datos.</p>
              )}
            </div>
            {!iosHint && (
              <button
                onClick={install}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-brasil-blue text-white font-bold text-sm px-3 py-2 cursor-pointer transition-opacity duration-200 hover:opacity-90"
              >
                <Download className="w-4 h-4" aria-hidden /> Instalar
              </button>
            )}
            <button
              onClick={dismiss}
              aria-label="Cerrar"
              className="shrink-0 min-w-9 min-h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
