import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { ToastMessage } from '@/types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const config = {
  success: { icon: CheckCircle2, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', iconColor: 'text-green-500' },
  error: { icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', iconColor: 'text-red-500' },
  warning: { icon: AlertTriangle, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', iconColor: 'text-orange-500' },
  info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', iconColor: 'text-blue-500' },
};

export function Toast({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[60] space-y-2 max-w-sm">
      {toasts.map(t => {
        const c = config[t.type];
        const Icon = c.icon;
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 ${c.bg} ${c.border} border rounded-xl px-4 py-3 shadow-lg animate-[slideIn_0.2s_ease-out]`}
          >
            <Icon className={`w-5 h-5 ${c.iconColor} shrink-0 mt-0.5`} />
            <p className={`text-sm font-medium ${c.text} flex-1`}>{t.message}</p>
            <button onClick={() => onDismiss(t.id)} className={`${c.iconColor} hover:opacity-70`}>
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
