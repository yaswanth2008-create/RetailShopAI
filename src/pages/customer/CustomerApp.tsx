import { useState } from 'react';
import { CustomerHeader, type CustomerPageId } from '@/components/CustomerHeader';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CustomerHome as Home } from '@/pages/customer/Home';
import { Stores } from '@/pages/customer/Stores';
import { Compare } from '@/pages/customer/Compare';
import { CartPage } from '@/pages/customer/CartPage';
import { Orders } from '@/pages/customer/Orders';

export function CustomerApp() {
  const [page, setPage] = useState<CustomerPageId>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const { toasts, showToast, dismiss } = useToast();
  const { count } = useCart();
  const { profile, signOut } = useAuth();

  const handleNavigate = (p: string) => {
    setPage(p as CustomerPageId);
    if (p !== 'stores' && p !== 'compare') setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <CustomerHeader
        cartCount={count}
        onNavigate={handleNavigate}
        current={page}
        userName={profile?.full_name || 'Customer'}
        onSignOut={signOut}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full pb-20 md:pb-6">
        {page === 'home' && <Home onNavigate={handleNavigate} searchQuery={searchQuery} showToast={showToast} />}
        {page === 'stores' && <Stores searchQuery={searchQuery} showToast={showToast} />}
        {page === 'compare' && <Compare searchQuery={searchQuery} showToast={showToast} />}
        {page === 'cart' && <CartPage onNavigate={handleNavigate} showToast={showToast} />}
        {page === 'orders' && <Orders onNavigate={handleNavigate} />}
      </main>
      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
