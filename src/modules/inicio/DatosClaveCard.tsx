import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Phone, ShieldAlert } from 'lucide-react';

// Números de emergencia oficiales de los países del viaje (datos públicos).
const EMERGENCY = [
  { flag: '🇧🇷', country: 'Brasil', nums: [['Policía', '190'], ['Ambulancia (SAMU)', '192'], ['Bomberos', '193']] },
  { flag: '🇦🇷', country: 'Argentina', nums: [['Emergencias', '911'], ['Ambulancia (SAME)', '107'], ['Bomberos', '100']] },
] as const;

/** Datos clave del viaje: números de emergencia con llamada de un toque. Offline. */
export default function DatosClaveCard() {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-3xl bg-white border border-sand-dark overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full min-h-14 px-5 flex items-center gap-2 cursor-pointer"
      >
        <ShieldAlert className="w-5 h-5 text-red-500" aria-hidden />
        <span className="font-display font-bold text-lg text-gray-800 flex-1 text-left">Datos clave</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              <p className="text-xs text-gray-400 -mt-1">Números de emergencia</p>
              {EMERGENCY.map((c) => (
                <div key={c.country}>
                  <p className="font-semibold text-gray-700 text-sm mb-1.5">{c.flag} {c.country}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {c.nums.map(([label, num]) => (
                      <a
                        key={num}
                        href={`tel:${num}`}
                        className="rounded-xl bg-red-50 border border-red-100 px-2 py-2 text-center transition-colors duration-200 hover:bg-red-100"
                      >
                        <span className="flex items-center justify-center gap-1 font-display font-bold text-red-600 text-lg leading-none">
                          <Phone className="w-3.5 h-3.5" aria-hidden /> {num}
                        </span>
                        <span className="block text-[11px] text-gray-500 mt-0.5 leading-tight">{label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
