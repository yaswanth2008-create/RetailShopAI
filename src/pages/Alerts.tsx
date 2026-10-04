import { useState, useMemo } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { AlertCard } from '@/components/AlertCard';
import type { Alert } from '@/types';

interface AlertsProps {
  alerts: Alert[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
}

type FilterType = 'all' | 'unread' | 'critical' | 'warning' | 'info' | 'success';

export function Alerts({ alerts, onMarkRead, onMarkAllRead, onDelete }: AlertsProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return alerts;
    if (filter === 'unread') return alerts.filter(a => !a.read);
    return alerts.filter(a => a.severity === filter);
  }, [alerts, filter]);

  const unreadCount = alerts.filter(a => !a.read).length;

  const filters: { id: FilterType; label: string; count?: number }[] = [
    { id: 'all', label: 'All Alerts', count: alerts.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'critical', label: 'Critical' },
    { id: 'warning', label: 'Warning' },
    { id: 'info', label: 'Info' },
    { id: 'success', label: 'Success' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-900">Alerts & Notifications</h1>
          </div>
          <p className="text-slate-500 mt-1">{unreadCount} unread · {alerts.length} total</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
          >
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
              filter === f.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
            {f.count !== undefined && (
              <span className={`ml-1.5 ${filter === f.id ? 'text-blue-100' : 'text-slate-400'}`}>{f.count}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No alerts found</p>
          <p className="text-sm text-slate-400 mt-1">
            {filter === 'unread' ? 'All alerts have been read' : 'No alerts match this filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <AlertCard key={a.id} alert={a} onMarkRead={onMarkRead} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
