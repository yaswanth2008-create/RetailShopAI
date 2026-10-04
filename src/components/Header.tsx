import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, X, Check } from 'lucide-react';

interface NotificationItem {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface HeaderProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: { type: string; title: string; subtitle: string; page: string }[];
  onSearchResultClick: (page: string) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAllRead: () => void;
}

export function Header({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  searchResults,
  onSearchResultClick,
  unreadCount,
  onMarkAllRead,
  notifications,
}: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);



  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-sm border-b border-slate-200 flex items-center px-4 gap-3">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      <div className="relative flex-1 max-w-lg" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => { onSearchChange(e.target.value); setShowSearch(true); }}
          onFocus={() => setShowSearch(true)}
          placeholder="Search products, alerts, analytics..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all"
        />
        {showSearch && searchQuery.trim() && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-30">
            {searchResults.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">No results found for "{searchQuery}"</div>
            ) : (
              searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => { onSearchResultClick(r.page); setShowSearch(false); onSearchChange(''); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{r.type}</span>
                    <span className="text-sm font-medium text-slate-800">{r.title}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{r.subtitle}</div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setShowNotif(s => !s)}
          className="relative p-2 rounded-lg hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotif && (
          <div className="absolute top-full mt-1 right-0 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="font-semibold text-sm text-slate-800">Notifications</span>
              <button
                onClick={onMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-500">No notifications</div>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className="flex items-start gap-2.5 px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                      n.type === 'error' ? 'bg-red-500' :
                      n.type === 'warning' ? 'bg-orange-500' :
                      n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            SO
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-xs font-semibold text-slate-800">Store Owner</span>
            <span className="text-[10px] text-slate-500">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
