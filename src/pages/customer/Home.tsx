import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Store as StoreIcon, Search, ShoppingCart, Package, TrendingUp, ArrowRight, Plus, Check, Star, MapPin } from 'lucide-react';
import type { Store, StoreProduct, StoreProductWithStore } from '@/types';

interface CustomerHomeProps {
  onNavigate: (page: string) => void;
  searchQuery: string;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', msg: string) => void;
}

export function CustomerHome({ onNavigate, searchQuery, showToast }: CustomerHomeProps) {
  const { profile } = useAuth();
  const { addItem } = useCart();
  const [stores, setStores] = useState<Store[]>([]);
  const [allProducts, setAllProducts] = useState<StoreProductWithStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('stores').select('*').eq('is_active', true).order('created_at'),
      supabase.from('store_products').select('*, store:stores(*)').order('created_at'),
    ]).then(([storesRes, productsRes]) => {
      setStores((storesRes.data as Store[]) || []);
      setAllProducts((productsRes.data as StoreProductWithStore[]) || []);
      setLoading(false);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allProducts.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 12);
  }, [searchQuery, allProducts]);

  const featuredProducts = useMemo(() => {
    const seen = new Set<string>();
    const result: StoreProductWithStore[] = [];
    for (const p of allProducts) {
      if (!seen.has(p.name) && p.stock > 0) {
        seen.add(p.name);
        result.push(p);
      }
      if (result.length >= 8) break;
    }
    return result;
  }, [allProducts]);

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

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-10 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Hello, {profile?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-lg">
            Compare prices across {stores.length} stores, order groceries online, and get the best deals in {stores[0]?.location || 'your area'}.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => onNavigate('stores')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-sm"
            >
              Browse Stores <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('compare')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/25 transition-colors text-sm border border-white/20"
            >
              <Search className="w-4 h-4" /> Compare Prices
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Stores Available', value: stores.length, icon: StoreIcon, color: 'text-blue-600 bg-blue-50' },
          { label: 'Products Listed', value: allProducts.length, icon: Package, color: 'text-green-600 bg-green-50' },
          { label: 'Categories', value: new Set(allProducts.map(p => p.category)).size, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
          { label: 'Best Deals', value: 'Daily', icon: Star, color: 'text-orange-600 bg-orange-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Search results */}
      {searchQuery.trim() && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Search results for "{searchQuery}" ({filteredProducts.length})
          </h2>
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No products found. Try a different search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} onAdd={() => handleAddToCart(p, p.store as Store)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Featured products */}
      {!searchQuery.trim() && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Featured Products</h2>
            <button onClick={() => onNavigate('stores')} className="text-sm text-blue-600 font-medium hover:text-blue-700">
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.map(p => (
              <ProductCard key={p.id} product={p} onAdd={() => handleAddToCart(p, p.store as Store)} />
            ))}
          </div>
        </div>
      )}

      {/* Stores preview */}
      {!searchQuery.trim() && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Popular Stores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map(store => {
              const productCount = allProducts.filter(p => p.store_id === store.id).length;
              return (
                <button
                  key={store.id}
                  onClick={() => onNavigate('stores')}
                  className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <StoreIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Open</span>
                  </div>
                  <h3 className="font-bold text-slate-900">{store.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{store.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {store.location}</span>
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {productCount} items</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: StoreProductWithStore; onAdd: () => void }) {
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
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm truncate">{product.name}</h3>
          <p className="text-xs text-slate-500">{product.category}</p>
        </div>
        {product.store && (
          <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0 ml-2">
            {product.store.name}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between mt-3">
        <div>
          <p className="text-lg font-bold text-slate-900">₹{product.price}</p>
          <p className={`text-xs ${outOfStock ? 'text-red-500' : product.stock <= product.minimum_stock ? 'text-orange-500' : 'text-green-600'}`}>
            {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
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
