import React, { createContext, useContext, useState, useCallback, useId } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(({ type, title, message }: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => showToast({ type: 'success', title, message }), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast({ type: 'error', title, message }), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast({ type: 'info', title, message }), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      {/* Accessible Live Region for Toasts */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto rounded-xl p-4 shadow-lg border flex items-start gap-3 transition-all duration-200 transform translate-y-0 ${
              t.type === 'success'
                ? 'bg-white border-[#D2B9E0] text-[#370D48]'
                : t.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-950'
                : 'bg-white border-[#A375A1] text-[#370D48]'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#580F69]" aria-hidden="true" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-[#580F69]" aria-hidden="true" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-tight">{t.title}</h4>
              {t.message && <p className="text-xs text-[#240D2F]/80 mt-1 leading-snug">{t.message}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-[#370D48]/60 hover:text-[#370D48] p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#580F69]"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};
