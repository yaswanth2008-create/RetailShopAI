import { useState, useMemo } from 'react';
import { Search, Package, MapPin, Layers, Ruler, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { Product } from '@/types';
import { fuzzySearchProducts } from '@/utils/search';
import { getStockStatus } from '@/utils/insights';

interface ProductSearchProps {
  products: Product[];
  onProductFound: (aisle: string) => void;
}

export function ProductSearch({ products, onProductFound }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const results = useMemo(() => {
    if (!submitted.trim()) return [];
    return fuzzySearchProducts(products, submitted).slice(0, 5);
  }, [submitted, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSubmitted(query);
      const found = fuzzySearchProducts(products, query)[0];
      if (found) onProductFound(found.aisle);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="What product are you looking for?"
          className="w-full pl-12 pr-4 py-4 text-base bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 shadow-sm"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Find
        </button>
      </form>

      {submitted && results.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <XCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">No products found</p>
          <p className="text-sm text-slate-500 mt-1">No matches for "{submitted}". Try a different search term.</p>
        </div>
      )}

      {results.map(p => {
        const status = getStockStatus(p);
        return (
          <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.category} · SKU: {p.sku}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                status === 'In Stock' ? 'bg-green-100 text-green-700' :
                status === 'Low Stock' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {status === 'In Stock' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {status === 'Low Stock' && <AlertTriangle className="w-3.5 h-3.5" />}
                {status === 'Out of Stock' && <XCircle className="w-3.5 h-3.5" />}
                {status === 'In Stock' ? 'Product Found ✓' : status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[10px] text-slate-500">Aisle</p>
                  <p className="text-sm font-semibold text-slate-800">{p.aisle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[10px] text-slate-500">Shelf</p>
                  <p className="text-sm font-semibold text-slate-800">Shelf {p.shelf}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                <div>
                  <p className="text-[10px] text-slate-500">Row</p>
                  <p className="text-sm font-semibold text-slate-800">Row {p.row}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                <Ruler className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[10px] text-slate-500">Distance</p>
                  <p className="text-sm font-semibold text-slate-800">{15 + (parseInt(p.row) || 1) * 3}m</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <span className="text-xs text-slate-500">Availability: </span>
                <span className={`text-sm font-semibold ${
                  status === 'Out of Stock' ? 'text-red-600' : 'text-slate-800'
                }`}>
                  {p.stock} units available
                </span>
              </div>
              <span className="text-sm font-bold text-slate-700">₹{p.price.toLocaleString('en-IN')}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
