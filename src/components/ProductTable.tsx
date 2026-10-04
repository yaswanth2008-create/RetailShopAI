import { Edit2, Trash2, Package2 } from 'lucide-react';
import type { Product } from '@/types';
import { getStockStatus } from '@/utils/insights';

interface ProductTableProps {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}

const statusStyles: Record<string, string> = {
  'In Stock': 'bg-green-100 text-green-700',
  'Low Stock': 'bg-orange-100 text-orange-700',
  'Out of Stock': 'bg-red-100 text-red-700',
};

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">No products found</p>
        <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="px-4 py-3 font-semibold text-slate-600">Product</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Category</th>
            <th className="px-4 py-3 font-semibold text-slate-600">SKU</th>
            <th className="px-4 py-3 font-semibold text-slate-600 text-right">Stock</th>
            <th className="px-4 py-3 font-semibold text-slate-600 text-right">Min</th>
            <th className="px-4 py-3 font-semibold text-slate-600 text-right">Price</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Location</th>
            <th className="px-4 py-3 font-semibold text-slate-600 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => {
            const status = getStockStatus(p);
            return (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-3 text-slate-600">{p.category}</td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">{p.stock}</td>
                <td className="px-4 py-3 text-right text-slate-500">{p.minimumStock}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-700">₹{p.price.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles[status]}`}>
                    {status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{p.aisle}, Shelf {p.shelf}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEdit(p)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(p)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
