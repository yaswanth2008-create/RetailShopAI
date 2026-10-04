import { Store, MapPin, Bell, Save, RotateCcw, ToggleLeft, ToggleRight } from 'lucide-react';
import type { StoreSettings } from '@/types';

interface SettingsProps {
  settings: StoreSettings;
  onSave: (s: StoreSettings) => void;
  onReset: () => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', msg: string) => void;
}

export function Settings({ settings, onSave, onReset, showToast }: SettingsProps) {
  const handleToggle = (key: keyof StoreSettings) => {
    onSave({ ...settings, [key]: !settings[key] });
  };

  const handleSave = () => {
    onSave(settings);
    showToast('success', 'Settings saved successfully');
  };

  const handleReset = () => {
    onReset();
    showToast('info', 'Demo data has been reset');
  };

  const toggles: { key: keyof StoreSettings; label: string; desc: string }[] = [
    { key: 'lowStockAlerts', label: 'Low-Stock Alerts', desc: 'Get notified when products fall below minimum stock' },
    { key: 'outOfStockAlerts', label: 'Out-of-Stock Alerts', desc: 'Get notified when products run out completely' },
    { key: 'highTrafficAlerts', label: 'High-Traffic Alerts', desc: 'Get notified during unusual customer traffic' },
    { key: 'dailySalesReport', label: 'Daily Sales Report', desc: 'Receive a daily summary of sales performance' },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your store information and alert preferences.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-slate-900">Store Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
            <input
              type="text"
              value={settings.storeName}
              onChange={e => onSave({ ...settings, storeName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={settings.location}
                onChange={e => onSave({ ...settings, location: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-orange-600" />
          <h2 className="font-semibold text-slate-900">Alert Settings</h2>
        </div>
        <div className="space-y-1">
          {toggles.map(t => {
            const enabled = settings[t.key] as boolean;
            return (
              <div
                key={t.key}
                className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                onClick={() => handleToggle(t.key)}
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{t.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                </div>
                <button className="shrink-0 ml-4" aria-label={`Toggle ${t.label}`}>
                  {enabled ? (
                    <ToggleRight className="w-8 h-8 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-300" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm"
        >
          <Save className="w-4 h-4" /> Save Settings
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50"
        >
          <RotateCcw className="w-4 h-4" /> Reset Demo Data
        </button>
      </div>
    </div>
  );
}
