import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudOff, RefreshCw } from 'lucide-react';
import { pendingCount, subscribe } from '../lib/outbox';

/** Píldora discreta: avisa cuando no hay conexión o hay cambios sin sincronizar. */
export default function SyncIndicator() {
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(pendingCount());

  useEffect(() => {
    const upd = () => { setOnline(navigator.onLine); setPending(pendingCount()); };
    const unsub = subscribe(upd);
    window.addEventListener('online', upd);
    window.addEventListener('offline', upd);
    const iv = setInterval(upd, 4000); // refresca el conteo mientras drena la cola
    return () => { unsub(); window.removeEventListener('online', upd); window.removeEventListener('offline', upd); clearInterval(iv); };
  }, []);

  const show = !online || pending > 0;
  const offline = !online;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="fixed top-[max(0.5rem,env(safe-area-inset-top))] inset-x-0 z-[60] flex justify-center pointer-events-none"
          role="status"
          aria-live="polite"
        >
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg
              ${offline ? 'bg-amber-500 text-white' : 'bg-brasil-blue text-white'}`}
          >
            {offline ? (
              <>
                <CloudOff className="w-3.5 h-3.5" aria-hidden />
                Sin conexión{pending > 0 ? ` · ${pending} guardado${pending > 1 ? 's' : ''}` : ''}
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden />
                Sincronizando {pending} cambio{pending > 1 ? 's' : ''}…
              </>
            )}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
