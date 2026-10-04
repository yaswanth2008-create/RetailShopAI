import { useState, useMemo } from 'react';
import { Plus, Search, Package2, AlertTriangle } from 'lucide-react';
import { ProductTable } from '@/components/ProductTable';
import { Modal } from '@/components/Modal';
import type { Product } from '@/types';
import { getStockStatus, getLowStockProducts } from '@/utils/insights';

interface InventoryProps {
  products: Product[];
  onSave: (p: Product) => void;
  onDelete: (p: Product) => void;
  onRestock: (p: Product) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', msg: string) => void;
}

const categories = ['Grocery', 'Dairy', 'Beverages', 'Bakery', 'Household', 'Personal Care', 'Snacks'];

const emptyForm: Product = {
  id: '', name: '', category: 'Grocery', sku: '', price: 0, stock: 0, minimumStock: 0, aisle: '', shelf: '', row: '',
};

export function Inventory({ products, onSave, onDelete, onRestock, showToast }: InventoryProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Product>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (statusFilter !== 'All') {
        const status = getStockStatus(p);
        if (status !== statusFilter) return false;
      }
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const lowStockProducts = getLowStockProducts(products);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, id: Math.random().toString(36).substring(2, 9) });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ ...p });
    setErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.aisle.trim()) e.aisle = 'Aisle is required';
    if (!form.shelf.trim()) e.shelf = 'Shelf is required';
    if (form.price < 0) e.price = 'Price cannot be negative';
    if (form.stock < 0) e.stock = 'Stock cannot be negative';
    if (form.minimumStock < 0) e.minimumStock = 'Minimum stock cannot be negative';
    const dup = products.find(p => p.sku === form.sku && p.id !== form.id);
    if (dup) e.sku = 'A product with this SKU already exists';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      showToast('error', 'Please fix the errors in the form');
      return;
    }
    onSave(form);
    setModalOpen(false);
    showToast('success', editing ? 'Product updated successfully' : 'Product added successfully');
  };

  const handleDelete = (p: Product) => {
    onDelete(p);
    showToast('info', `${p.name} has been deleted`);
  };

  const handleRestock = () => {
    if (restockProduct) {
      onRestock(restockProduct);
      showToast('success', `Restock request created for ${restockProduct.name}`);
      setRestockProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-500 mt-1">{products.length} products · {lowStockProducts.length} low stock</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <h2 className="font-semibold text-orange-800 text-sm">AI Inventory Alerts</h2>
          </div>
          <div className="space-y-2">
            {lowStockProducts.map(p => {
              const status = getStockStatus(p);
              return (
                <div key={p.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${status === 'Out of Stock' ? 'bg-red-500' : 'bg-orange-500'}`} />
                    <span className="text-sm font-medium text-slate-800">{p.name}</span>
                    <span className="text-xs text-slate-500">
                      {status === 'Out of Stock'
                        ? 'Out of stock.'
                        : `Only ${p.stock} units remaining. Minimum stock is ${p.minimumStock}.`}
                    </span>
                  </div>
                  <button
                    onClick={() => setRestockProduct(p)}
                    className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
                  >
                    Restock
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 p-4 border-b border-slate-100 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or SKU..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="All">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Package2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No products found</p>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <ProductTable products={filtered} onEdit={openEdit} onDelete={handleDelete} />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add New Product'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="e.g., Tata Salt 1kg"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
            <input
              type="text"
              value={form.sku}
              onChange={e => setForm({ ...form, sku: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono"
              placeholder="e.g., GRO-001"
            />
            {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={e => setForm({ ...form, price: Math.max(0, Number(e.target.value)) })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Stock</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={e => setForm({ ...form, stock: Math.max(0, Number(e.target.value)) })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Stock</label>
            <input
              type="number"
              min="0"
              value={form.minimumStock}
              onChange={e => setForm({ ...form, minimumStock: Math.max(0, Number(e.target.value)) })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            {errors.minimumStock && <p className="text-xs text-red-500 mt-1">{errors.minimumStock}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Aisle</label>
            <input
              type="text"
              value={form.aisle}
              onChange={e => setForm({ ...form, aisle: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="e.g., Aisle 2"
            />
            {errors.aisle && <p className="text-xs text-red-500 mt-1">{errors.aisle}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Shelf</label>
            <input
              type="text"
              value={form.shelf}
              onChange={e => setForm({ ...form, shelf: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="e.g., B"
            />
            {errors.shelf && <p className="text-xs text-red-500 mt-1">{errors.shelf}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Row</label>
            <input
              type="text"
              value={form.row}
              onChange={e => setForm({ ...form, row: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="e.g., 3"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">
            {editing ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </Modal>

      <Modal open={!!restockProduct} onClose={() => setRestockProduct(null)} title="Confirm Restock" size="sm">
        {restockProduct && (
          <div>
            <p className="text-sm text-slate-700">
              Restock request created for <span className="font-semibold">{restockProduct.name}</span>.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Current stock: {restockProduct.stock} units · Minimum: {restockProduct.minimumStock} units
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setRestockProduct(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleRestock} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Confirm Restock</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
