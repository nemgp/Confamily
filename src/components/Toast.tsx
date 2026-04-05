import { useEffect, useState, createContext, useContext, useCallback, ReactNode } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
type Toast = { id: string; message: string; type: ToastType };

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons = { success: Check, error: AlertCircle, info: Info };
const colors = {
  success: { bg: 'rgba(39,174,96,0.95)', icon: '#fff' },
  error: { bg: 'rgba(231,76,60,0.95)', icon: '#fff' },
  info: { bg: 'rgba(52,152,219,0.95)', icon: '#fff' },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const Icon = icons[toast.type];
  const color = colors[toast.type];

  useEffect(() => {
    // Trigger enter animation
    const t1 = setTimeout(() => setVisible(true), 10);
    // Auto-remove after 3.5s
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [toast.id, onRemove]);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 18px', borderRadius: '14px',
        background: color.bg,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        color: '#fff', fontSize: '0.95rem', fontWeight: 500,
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minWidth: '260px', maxWidth: '360px',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color={color.icon} />
      </div>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#fff', opacity: 0.7, display: 'flex' }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: '80px', right: '20px', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
