import { ShoppingBag, ShoppingCart, LogOut, Home, Store, Search, Package } from 'lucide-react';

export type CustomerPageId = 'home' | 'stores' | 'compare' | 'orders' | 'cart';

interface CustomerHeaderProps {
  cartCount: number;
  onNavigate: (page: CustomerPageId) => void;
  current: CustomerPageId;
  userName: string;
  onSignOut: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const navItems: { id: CustomerPageId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'stores', label: 'Stores', icon: Store },
  { id: 'compare', label: 'Compare Prices', icon: Search },
  { id: 'orders', label: 'My Orders', icon: Package },
];

export function CustomerHeader({ cartCount, onNavigate, current, userName, onSignOut, searchQuery, onSearchChange }: CustomerHeaderProps) {
  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-sm border-b border-slate-200 flex items-center px-4 gap-3">
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <span className="font-bold text-slate-900 text-sm hidden sm:block">RetailMind AI</span>
      </div>

      <nav className="hidden md:flex items-center gap-1 ml-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" /> {item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex-1 max-w-xs ml-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white"
          />
        </div>
      </div>

      <button
        onClick={() => onNavigate('cart')}
        className="relative p-2 rounded-lg hover:bg-slate-100"
        aria-label="Cart"
      >
        <ShoppingCart className="w-5 h-5 text-slate-600" />
        {cartCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>

      <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:flex flex-col leading-tight">
          <span className="text-xs font-semibold text-slate-800">{userName}</span>
          <span className="text-[10px] text-slate-500">Customer</span>
        </div>
        <button onClick={onSignOut} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-500" aria-label="Sign out">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around py-1.5 z-30">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg ${
                active ? 'text-blue-600' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
