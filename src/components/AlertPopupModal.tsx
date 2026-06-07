import React from 'react';
import { useBrecho } from '../BrechoContext';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

export const AlertPopupModal: React.FC = () => {
  const { alertPopup, closeAlert } = useBrecho();

  if (!alertPopup) return null;

  const { isOpen, message, title, type } = alertPopup;

  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-900',
      icon: <CheckCircle2 className="h-10 w-10 text-emerald-600" />,
      btnBg: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      accentColor: 'text-emerald-700',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-900',
      icon: <AlertCircle className="h-10 w-10 text-amber-500" />,
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
      accentColor: 'text-amber-700',
    },
    error: {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-900',
      icon: <XCircle className="h-10 w-10 text-rose-600" />,
      btnBg: 'bg-rose-700 hover:bg-rose-800 text-white',
      accentColor: 'text-rose-700',
    },
    info: {
      bg: 'bg-stone-50 border-stone-200',
      text: 'text-stone-900',
      icon: <Info className="h-10 w-10 text-emerald-700" />,
      btnBg: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      accentColor: 'text-emerald-700',
    },
  }[type || 'info'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop animado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAlert}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
          />

          {/* Card animado de Alerta */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className={`relative w-full max-w-sm bg-white rounded-2xl border border-stone-200/80 shadow-2xl p-6 overflow-hidden z-10`}
            id="alert-custom-popup"
          >
            {/* Decoração superior estilosa */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-emerald-600 via-emerald-700 to-amber-500" />

            {/* Ícone fechar no canto superior */}
            <button
              onClick={closeAlert}
              className="absolute top-4 right-4 p-1 hover:bg-stone-105 rounded-lg text-stone-400 hover:text-stone-600 transition cursor-pointer"
              title="Fechar"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Layout Conteúdo */}
            <div className="flex flex-col items-center text-center mt-3">
              <div className="mb-4">
                {config.icon}
              </div>

              <h3 className="text-base font-bold text-stone-850 tracking-tight leading-tight mb-2">
                {title || 'Aviso'}
              </h3>

              <div className="text-stone-600 text-xs leading-relaxed max-w-xs font-medium mb-6">
                {message}
              </div>

              <button
                type="button"
                onClick={closeAlert}
                className={`w-full py-3 ${config.btnBg} rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer focus:outline-none`}
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
