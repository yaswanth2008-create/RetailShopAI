import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { Store as StoreIcon, Search, Plus, Check, Package, MapPin, ChevronRight } from 'lucide-react';
import type { Store, StoreProduct } from '@/types';

interface StoresProps {
  searchQuery: string;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', msg: string) => void;
}

export function Stores({ searchQuery, showToast }: StoresProps) {
  const { addItem } = useCart();
  const [stores, setStores] = useState<Store[]>([]);
  const [productsByStore, setProductsByStore] = useState<Record<string, StoreProduct[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    supabase
      .from('stores')
      .select('*')
      .eq('is_active', true)
      .order('created_at')
      .then(({ data }) => {
        const storeList = (data as Store[]) || [];
        setStores(storeList);
        Promise.all(
          storeList.map(s =>
            supabase.from('store_products').select('*').eq('store_id', s.id).order('name')
          )
        ).then(results => {
          const map: Record<string, StoreProduct[]> = {};
          storeList.forEach((s, i) => {
            map[s.id] = (results[i].data as StoreProduct[]) || [];
          });
          setProductsByStore(map);
          setLoading(false);
        });
      });
  }, []);

  const categories = useMemo(() => {
    if (!selectedStore) return [];
    const products = productsByStore[selectedStore.id] || [];
    return ['All', ...Array.from(new Set(products.map(p => p.category)))];
  }, [selectedStore, productsByStore]);

  const filteredProducts = useMemo(() => {
    if (!selectedStore) return [];
    let products = productsByStore[selectedStore.id] || [];
    const q = (searchQuery || localSearch).toLowerCase();
    if (q) products = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    if (categoryFilter !== 'All') products = products.filter(p => p.category === categoryFilter);
    return products;
  }, [selectedStore, productsByStore, categoryFilter, searchQuery, localSearch]);

  const handleAddToCart = (product: StoreProduct, store: Store) => {
    addItem(product, store);
    showToast('success', `${product.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (selectedStore) {
    const products = productsByStore[selectedStore.id] || [];
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => setSelectedStore(null)} className="text-blue-600 font-medium hover:text-blue-700">
            Stores
          </button>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700 font-medium">{selectedStore.name}</span>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{selectedStore.name}</h1>
              <p className="text-blue-100 text-sm mt-1">{selectedStore.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-blue-100">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedStore.location}</span>
                <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {products.length} products</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search in this store..."
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

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(p => (
              <StoreProductCard key={p.id} product={p} store={selectedStore} onAdd={() => handleAddToCart(p, selectedStore)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Browse Stores</h1>
        <p className="text-slate-500 mt-1">{stores.length} stores available in your area</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map(store => {
          const products = productsByStore[store.id] || [];
          const categories = new Set(products.map(p => p.category));
          return (
            <button
              key={store.id}
              onClick={() => setSelectedStore(store)}
              className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <StoreIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Open</span>
              </div>
              <h3 className="font-bold text-slate-900">{store.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{store.description}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {store.location}</span>
                <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {products.length} items</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {Array.from(categories).slice(0, 4).map(c => (
                  <span key={c} className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{c}</span>
                ))}
                {categories.size > 4 && <span className="text-[10px] text-slate-400">+{categories.size - 4} more</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StoreProductCard({ product, store, onAdd }: { product: StoreProduct; store: Store; onAdd: () => void }) {
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock === 0;

  const handleAdd = () => {
    if (outOfStock) return;
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-slate-900 text-sm truncate">{product.name}</h3>
      <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
      <div className="flex items-end justify-between mt-3">
        <div>
          <p className="text-lg font-bold text-slate-900">₹{product.price}</p>
          <p className={`text-xs ${outOfStock ? 'text-red-500' : product.stock <= product.minimum_stock ? 'text-orange-500' : 'text-green-600'}`}>
            {outOfStock ? 'Out of stock' : `${product.stock} available`}
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            added ? 'bg-green-100 text-green-700' :
            outOfStock ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
            'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {added ? <><Check className="w-3.5 h-3.5" /> Added</> : <><Plus className="w-3.5 h-3.5" /> Add</>}
        </button>
      </div>
    </div>
  );
}
