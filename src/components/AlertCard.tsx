import { AlertCircle, AlertTriangle, Info, CheckCircle2, Trash2, X } from 'lucide-react';
import type { Alert } from '@/types';

interface AlertCardProps {
  alert: Alert;
  onMarkRead: (id: string) => void;
  onDelete?: (id: string) => void;
}

const severityConfig = {
  critical: { icon: AlertCircle, dot: 'bg-red-500', border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-red-700', label: 'bg-red-100 text-red-700' },
  warning: { icon: AlertTriangle, dot: 'bg-orange-500', border: 'border-l-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', label: 'bg-orange-100 text-orange-700' },
  info: { icon: Info, dot: 'bg-yellow-500', border: 'border-l-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'bg-yellow-100 text-yellow-700' },
  success: { icon: CheckCircle2, dot: 'bg-green-500', border: 'border-l-green-500', bg: 'bg-green-50', text: 'text-green-700', label: 'bg-green-100 text-green-700' },
};

export function AlertCard({ alert, onMarkRead, onDelete }: AlertCardProps) {
  const c = severityConfig[alert.severity];
  const Icon = c.icon;

  return (
    <div className={`flex items-start gap-3 bg-white rounded-xl border border-slate-200 border-l-4 ${c.border} p-4 ${alert.read ? 'opacity-60' : ''}`}>
      <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${c.label}`}>
            {alert.title}
          </span>
          {!alert.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
        </div>
        <p className="text-sm text-slate-700 mt-1">{alert.message}</p>
        <p className="text-xs text-slate-400 mt-1">
          {new Date(alert.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!alert.read && (
          <button
            onClick={() => onMarkRead(alert.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Mark as read"
            title="Mark as read"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(alert.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
            aria-label="Delete alert"
            title="Delete"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
