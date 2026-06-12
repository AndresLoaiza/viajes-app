import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Heart } from 'lucide-react';
import { checkAccessCode, storeIdentity } from '../../lib/identity';
import type { TravelerId } from '../../types/trip';

const TRAVELERS: { id: TravelerId; name: string; initial: string; color: string }[] = [
  { id: 'andres', name: 'Andrés', initial: 'A', color: '#009C3B' },
  { id: 'melisa', name: 'Melisa', initial: 'M', color: '#1B6CA8' },
];

/**
 * Puerta de entrada: código secreto (paso 1) → elegir quién eres (paso 2).
 * La identidad queda en localStorage; no se vuelve a pedir.
 */
export default function AccessGate({ onUnlocked }: { onUnlocked: (id: TravelerId) => void }) {
  const [step, setStep] = useState<'code' | 'who'>('code');
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  async function submit() {
    if (!code.trim() || checking) return;
    setChecking(true);
    const ok = await checkAccessCode(code);
    setChecking(false);
    if (ok) {
      setError(false);
      setStep('who');
    } else {
      setError(true);
    }
  }

  function pick(id: TravelerId) {
    storeIdentity(id);
    onUnlocked(id);
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 bg-warm-white relative overflow-hidden">
      {/* Franjas decorativas Brasil */}
      <div aria-hidden className="absolute top-0 inset-x-0 h-1.5 bg-brasil-green" />
      <div aria-hidden className="absolute top-1.5 inset-x-0 h-1.5 bg-brasil-yellow" />

      <AnimatePresence mode="wait">
        {step === 'code' ? (
          <motion.div
            key="code"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center bg-brasil-green/10"
            >
              <Lock className="w-7 h-7 text-brasil-green" aria-hidden />
            </motion.div>
            <h1 className="font-display font-bold text-3xl text-gray-800">Nuestros Viajes</h1>
            <p className="text-gray-500 mt-1 mb-6">Un rincón solo para nosotros dos</p>

            <motion.div
              animate={error ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.45 }}
            >
              <label htmlFor="access-code" className="sr-only">Código secreto</label>
              <input
                id="access-code"
                type="password"
                inputMode="text"
                autoComplete="off"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(false); }}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="Código secreto"
                className={`w-full text-center text-lg rounded-2xl border-2 px-4 py-3.5 outline-none transition-colors duration-200 bg-white
                  ${error ? 'border-red-400' : 'border-sand-dark focus:border-brasil-green'}`}
              />
            </motion.div>
            {error && (
              <p role="alert" className="text-red-500 text-sm mt-2">
                Ese no es… pista: nuestro destino + año 😉
              </p>
            )}
            <button
              onClick={submit}
              disabled={checking || !code.trim()}
              className="mt-4 w-full min-h-12 rounded-2xl font-display font-bold text-lg text-white bg-brasil-green
                disabled:opacity-50 cursor-pointer transition-opacity duration-200 hover:opacity-90"
            >
              {checking ? 'Verificando…' : 'Entrar'}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="who"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center bg-brasil-yellow/30"
            >
              <Heart className="w-7 h-7 text-brasil-blue" aria-hidden />
            </motion.div>
            <h2 className="font-display font-bold text-2xl text-gray-800">¿Quién eres?</h2>
            <p className="text-gray-500 mt-1 mb-6">Solo se pregunta una vez</p>

            <div className="grid grid-cols-2 gap-4">
              {TRAVELERS.map((t, i) => (
                <motion.button
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.1 }}
                  onClick={() => pick(t.id)}
                  className="rounded-3xl bg-white border-2 border-sand-dark p-6 flex flex-col items-center gap-3
                    cursor-pointer transition-shadow duration-200 hover:shadow-lg focus-visible:outline-2"
                  style={{ outlineColor: t.color }}
                >
                  <span
                    className="w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-3xl text-white"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.initial}
                  </span>
                  <span className="font-display font-bold text-lg text-gray-800">{t.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
