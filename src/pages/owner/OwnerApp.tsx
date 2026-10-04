import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Sidebar, type PageId } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { Dashboard } from '@/pages/Dashboard';
import { Inventory } from '@/pages/Inventory';
import { Analytics } from '@/pages/Analytics';
import { ProductFinder } from '@/pages/ProductFinder';
import { Alerts } from '@/pages/Alerts';
import { Settings } from '@/pages/Settings';
import { weeklySales, customerTraffic, categorySales, productPerformance, demoCameras } from '@/data/analytics';
import { demoAlerts } from '@/data/alerts';
import { defaultSettings } from '@/data/settings';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { fuzzySearchProducts } from '@/utils/search';
import type { Product, Alert, StoreSettings, StoreProduct, Store, Order, OrderItem } from '@/types';

export function OwnerApp() {
  const { profile, signOut } = useAuth();
  const [page, setPage] = useState<PageId>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toasts, showToast, dismiss } = useToast();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useLocalStorage<Alert[]>('rm_alerts', demoAlerts);
  const [settings, setSettings] = useLocalStorage<StoreSettings>('rm_settings', defaultSettings);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', profile.id)
        .maybeSingle();

      if (storeData) {
        const s = storeData as Store;
        setStore(s);
        const { data: prodData } = await supabase
          .from('store_products')
          .select('*')
          .eq('store_id', s.id)
          .order('name');
        setProducts((prodData as StoreProduct[]) || []);

        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('store_id', s.id)
          .order('created_at', { ascending: false });
        setOrders((orderData as Order[]) || []);
      }
      setLoading(false);
    })();
  }, [profile]);

  const refreshProducts = useCallback(async () => {
    if (!store) return;
    const { data } = await supabase.from('store_products').select('*').eq('store_id', store.id).order('name');
    setProducts((data as StoreProduct[]) || []);
  }, [store]);

  const handleSaveProduct = useCallback(async (p: Product) => {
    if (!store) return;
    const dbProduct = {
      store_id: store.id,
      name: p.name,
      category: p.category,
      sku: p.sku,
      price: p.price,
      stock: p.stock,
      minimum_stock: p.minimumStock,
      aisle: p.aisle,
      shelf: p.shelf,
      row: p.row,
    };

    const existing = products.find(sp => sp.id === p.id);
    if (existing) {
      const { error } = await supabase.from('store_products').update(dbProduct).eq('id', p.id);
      if (error) { showToast('error', 'Failed to update product: ' + error.message); return; }
    } else {
      const { error } = await supabase.from('store_products').insert(dbProduct);
      if (error) { showToast('error', 'Failed to add product: ' + error.message); return; }
    }
    await refreshProducts();
  }, [store, products, refreshProducts, showToast]);

  const handleDeleteProduct = useCallback(async (p: Product) => {
    const { error } = await supabase.from('store_products').delete().eq('id', p.id);
    if (error) { showToast('error', 'Failed to delete product'); return; }
    await refreshProducts();
  }, [refreshProducts, showToast]);

  const handleRestock = useCallback(async (p: Product) => {
    const newStock = p.minimumStock * 2;
    const { error } = await supabase.from('store_products').update({ stock: newStock }).eq('id', p.id);
    if (error) { showToast('error', 'Failed to restock'); return; }
    await refreshProducts();
    const newAlert: Alert = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'restock-completed',
      title: 'Restock Completed',
      message: `${p.name} inventory has been updated to ${newStock} units.`,
      timestamp: new Date().toISOString(),
      read: false,
      severity: 'success',
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, [refreshProducts, setAlerts, showToast]);

  const handleMarkAlertRead = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, [setAlerts]);

  const handleMarkAllAlertsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }, [setAlerts]);

  const handleDeleteAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, [setAlerts]);

  // Convert StoreProduct[] to Product[] for existing components
  const mappedProducts: Product[] = useMemo(() =>
    products.map(sp => ({
      id: sp.id,
      name: sp.name,
      category: sp.category,
      sku: sp.sku,
      price: sp.price,
      stock: sp.stock,
      minimumStock: sp.minimum_stock,
      aisle: sp.aisle,
      shelf: sp.shelf,
      row: sp.row,
    })), [products]);

  const unreadAlerts = alerts.filter(a => !a.read);

  const notifications = useMemo(() => {
    const notifs: { type: 'error' | 'warning' | 'info' | 'success'; message: string }[] = [];
    const outOfStock = mappedProducts.filter(p => p.stock === 0);
    const lowStock = mappedProducts.filter(p => p.stock > 0 && p.stock <= p.minimumStock);
    if (outOfStock.length > 0) notifs.push({ type: 'error', message: `${outOfStock.length} products are out of stock` });
    if (lowStock.length > 0) notifs.push({ type: 'warning', message: `${lowStock.length} products have low inventory` });
    if (orders.length > 0) notifs.push({ type: 'info', message: `${orders.length} new orders received` });
    notifs.push({ type: 'success', message: 'Daily sales report is ready' });
    return notifs;
  }, [mappedProducts, orders]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return [];
    const results: { type: string; title: string; subtitle: string; page: PageId }[] = [];
    const productMatches = fuzzySearchProducts(mappedProducts, q).slice(0, 3);
    productMatches.forEach(p => {
      results.push({ type: 'Product', title: p.name, subtitle: `${p.category} · ${p.aisle} · Stock: ${p.stock}`, page: 'inventory' });
    });
    const alertMatches = alerts.filter(a =>
      a.title.toLowerCase().includes(q.toLowerCase()) || a.message.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 3);
    alertMatches.forEach(a => {
      results.push({ type: 'Alert', title: a.title, subtitle: a.message, page: 'alerts' });
    });
    return results.slice(0, 8);
  }, [searchQuery, mappedProducts, alerts]);

  const handleNavigate = (p: string) => {
    setPage(p as PageId);
    setMobileOpen(false);
  };

  const handleResetData = useCallback(() => {
    setAlerts(demoAlerts);
    setSettings(defaultSettings);
    showToast('info', 'Local data has been reset');
  }, [setAlerts, setSettings, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        current={page}
        onNavigate={setPage}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        alertCount={unreadAlerts.length}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleSidebar={() => setMobileOpen(o => !o)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResults={searchResults}
          onSearchResultClick={handleNavigate}
          notifications={notifications}
          unreadCount={unreadAlerts.length}
          onMarkAllRead={handleMarkAllAlertsRead}
        />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
          {page === 'dashboard' && (
            <Dashboard
              products={mappedProducts}
              sales={weeklySales}
              traffic={customerTraffic}
              cameras={demoCameras}
              onSimulateCamera={() => showToast('info', 'Camera scan simulated (Demo)')}
            />
          )}
          {page === 'inventory' && (
            <Inventory
              products={mappedProducts}
              onSave={handleSaveProduct}
              onDelete={handleDeleteProduct}
              onRestock={handleRestock}
              showToast={showToast}
            />
          )}
          {page === 'analytics' && (
            <Analytics
              sales={weeklySales}
              traffic={customerTraffic}
              categorySales={categorySales}
              productPerformance={productPerformance}
            />
          )}
          {page === 'product-finder' && (
            <ProductFinder products={mappedProducts} />
          )}
          {page === 'alerts' && (
            <Alerts
              alerts={alerts}
              onMarkRead={handleMarkAlertRead}
              onMarkAllRead={handleMarkAllAlertsRead}
              onDelete={handleDeleteAlert}
            />
          )}
          {page === 'settings' && (
            <Settings
              settings={settings}
              onSave={setSettings}
              onReset={handleResetData}
              showToast={showToast}
            />
          )}
        </main>
      </div>
      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
