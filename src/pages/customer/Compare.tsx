import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { Search, Plus, Check, TrendingDown, TrendingUp, Package, ArrowRight } from 'lucide-react';
import type { Store, StoreProduct, StoreProductWithStore } from '@/types';

interface CompareProps {
  searchQuery: string;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', msg: string) => void;
}

export function Compare({ searchQuery, showToast }: CompareProps) {
  const { addItem } = useCart();
  const [allProducts, setAllProducts] = useState<StoreProductWithStore[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    Promise.all([
      supabase.from('stores').select('*').eq('is_active', true),
      supabase.from('store_products').select('*, store:stores(*)').order('name'),
    ]).then(([storesRes, productsRes]) => {
      setStores((storesRes.data as Store[]) || []);
      setAllProducts((productsRes.data as StoreProductWithStore[]) || []);
      setLoading(false);
    });
  }, []);

  // Group products by name to compare prices
  const productComparisons = useMemo(() => {
    const q = (searchQuery || localSearch).toLowerCase();
    let products = allProducts;
    if (q) products = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    if (categoryFilter !== 'All') products = products.filter(p => p.category === categoryFilter);

    const grouped: Record<string, { name: string; category: string; entries: StoreProductWithStore[] }> = {};
    for (const p of products) {
      if (!grouped[p.name]) grouped[p.name] = { name: p.name, category: p.category, entries: [] };
      grouped[p.name].entries.push(p);
    }

    return Object.values(grouped)
      .filter(g => g.entries.length > 0)
      .map(g => {
        const prices = g.entries.map(e => e.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        return { ...g, minPrice, maxPrice, savings: maxPrice - minPrice };
      })
      .sort((a, b) => b.savings - a.savings);
  }, [allProducts, searchQuery, localSearch, categoryFilter]);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(allProducts.map(p => p.category))).sort()];
  }, [allProducts]);

  const handleAddToCart = (product: StoreProductWithStore) => {
    if (!product.store || product.stock === 0) return;
    addItem(product, product.store as Store);
    showToast('success', `${product.name} from ${product.store.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Compare Prices</h1>
        <p className="text-slate-500 mt-1">Find the best deals across {stores.length} stores. Compare prices for the same product.</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder="Search products to compare..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {productComparisons.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500">No products found to compare</p>
        </div>
      ) : (
        <div className="space-y-4">
          {productComparisons.map(group => (
            <div key={group.name} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                <div>
                  <h3 className="font-semibold text-slate-900">{group.name}</h3>
                  <p className="text-xs text-slate-500">{group.category}</p>
                </div>
                {group.savings > 0 && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <TrendingDown className="w-4 h-4" />
                    Save up to ₹{group.savings}
                  </span>
                )}
              </div>
              <div className="divide-y divide-slate-100">
                {group.entries
                  .sort((a, b) => a.price - b.price)
                  .map((entry, idx) => {
                    const isBest = idx === 0 && group.savings > 0;
                    const outOfStock = entry.stock === 0;
                    return (
                      <div key={entry.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isBest ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {entry.store?.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{entry.store?.name}</p>
                            <p className={`text-xs ${outOfStock ? 'text-red-500' : entry.stock <= entry.minimum_stock ? 'text-orange-500' : 'text-slate-500'}`}>
                              {outOfStock ? 'Out of stock' : `${entry.stock} in stock`}
                            </p>
                          </div>
                          {isBest && (
                            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              BEST PRICE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-lg font-bold ${isBest ? 'text-green-600' : 'text-slate-900'}`}>
                            ₹{entry.price}
                          </span>
                          <button
                            onClick={() => handleAddToCart(entry)}
                            disabled={outOfStock}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                              outOfStock ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                              isBest ? 'bg-green-600 text-white hover:bg-green-700' :
                               'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" /> Add
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
