import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, CheckCircle2, Store, Package } from 'lucide-react';
import type { CartItem } from '@/types';

interface CartPageProps {
  onNavigate: (page: string) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', msg: string) => void;
}

export function CartPage({ onNavigate, showToast }: CartPageProps) {
  const { items, removeItem, updateQuantity, clearCart, total, count } = useCart();
  const { profile } = useAuth();
  const [placing, setPlacing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // Group items by store
  const itemsByStore = items.reduce<Record<string, { storeName: string; items: CartItem[]; subtotal: number }>>((acc, item) => {
    if (!acc[item.store_id]) acc[item.store_id] = { storeName: item.store_name, items: [], subtotal: 0 };
    acc[item.store_id].items.push(item);
    acc[item.store_id].subtotal += item.unit_price * item.quantity;
    return acc;
  }, {});

  const handlePlaceOrder = async () => {
    if (!profile || items.length === 0) return;
    setPlacing(true);

    try {
      // Place an order per store
      for (const [storeId, group] of Object.entries(itemsByStore)) {
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            customer_id: profile.id,
            store_id: storeId,
            total_amount: group.subtotal,
            status: 'pending',
            notes: notes || null,
          })
          .select()
          .single();

        if (orderError) throw orderError;

        const orderItems = group.items.map(item => ({
          order_id: order.id,
          store_product_id: item.store_product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw itemsError;

        // Decrement stock
        for (const item of group.items) {
          await supabase.rpc('decrement_stock', {
            product_id: item.store_product_id,
            qty: item.quantity,
          }).then(({ error }) => {
            // If RPC doesn't exist, do manual update
            if (error) {
              supabase
                .from('store_products')
                .select('stock')
                .eq('id', item.store_product_id)
                .single()
                .then(({ data }) => {
                  if (data) {
                    supabase
                      .from('store_products')
                      .update({ stock: Math.max(0, (data as { stock: number }).stock - item.quantity) })
                      .eq('id', item.store_product_id);
                  }
                });
            }
          });
        }
      }

      const orderCount = Object.keys(itemsByStore).length;
      setOrderComplete(`${orderCount} order${orderCount > 1 ? 's' : ''} placed successfully!`);
      clearCart();
      showToast('success', 'Your order has been placed!');
    } catch (err) {
      showToast('error', 'Failed to place order: ' + (err as Error).message);
    } finally {
      setPlacing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{orderComplete}</h2>
        <p className="text-slate-500 mt-2">You can track your orders in the Orders section.</p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => { setOrderComplete(null); onNavigate('orders'); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-sm"
          >
            View Orders <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setOrderComplete(null); onNavigate('home'); }}
            className="px-5 py-2.5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 text-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-slate-500 mt-2">Browse stores and add products to get started.</p>
        <button
          onClick={() => onNavigate('stores')}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-sm mx-auto"
        >
          Browse Stores <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>
        <p className="text-slate-500 mt-1">{count} item{count !== 1 ? 's' : ''} from {Object.keys(itemsByStore).length} store{Object.keys(itemsByStore).length > 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(itemsByStore).map(([storeId, group]) => (
            <div key={storeId} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                <Store className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-sm text-slate-800">{group.storeName}</span>
                <span className="text-xs text-slate-500 ml-auto">{group.items.length} item{group.items.length > 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {group.items.map(item => (
                  <div key={item.store_product_id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.product_name}</p>
                      <p className="text-xs text-slate-500">₹{item.unit_price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.store_product_id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                      >
                        <Minus className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.store_product_id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-slate-900 w-16 text-right">
                      ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => removeItem(item.store_product_id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-right">
                <span className="text-xs text-slate-500">Subtotal: </span>
                <span className="text-sm font-bold text-slate-900">₹{group.subtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-red-500 font-medium hover:text-red-600 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" /> Clear cart
          </button>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-20">
            <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4">
              {Object.entries(itemsByStore).map(([_, group]) => (
                <div key={group.storeName} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{group.storeName}</span>
                  <span className="font-medium text-slate-800">₹{group.subtotal.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-xl font-bold text-blue-600">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Order notes (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any special instructions..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
              />
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {placing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Place Order <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <p className="text-xs text-slate-400 mt-3 text-center">
              Orders are placed with each store separately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
