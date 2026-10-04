import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Package, Clock, Store as StoreIcon, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import type { OrderWithItems, OrderItem, Store } from '@/types';

interface OrdersProps {
  onNavigate: (page: string) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  ready: 'bg-green-100 text-green-700',
  delivered: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-700',
};

export function Orders({ onNavigate }: OrdersProps) {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!profile) return;
    loadOrders();
  }, [profile]);

  const loadOrders = async () => {
    if (!profile) return;
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', profile.id)
      .order('created_at', { ascending: false });

    if (!orderData || orderData.length === 0) {
      setLoading(false);
      return;
    }

    const storeIds = [...new Set(orderData.map(o => o.store_id))];
    const { data: storesData } = await supabase
      .from('stores')
      .select('*')
      .in('id', storeIds);

    const storeMap: Record<string, Store> = {};
    (storesData as Store[] || []).forEach(s => { storeMap[s.id] = s; });

    const ordersWithItems = await Promise.all(
      (orderData as OrderWithItems[]).map(async order => {
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        return { ...order, items: (items as OrderItem[]) || [], store: storeMap[order.store_id] };
      })
    );

    setOrders(ordersWithItems);
    setLoading(false);
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No orders yet</h2>
        <p className="text-slate-500 mt-2">Start shopping to place your first order!</p>
        <button
          onClick={() => onNavigate('stores')}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-sm mx-auto"
        >
          <ShoppingBag className="w-4 h-4" /> Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
        <p className="text-slate-500 mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleExpand(order.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <StoreIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900 text-sm">{order.store?.name || 'Store'}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] || statusColors.pending}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span className="text-sm font-bold text-slate-900">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                {expanded.has(order.id) ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {expanded.has(order.id) && (
              <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/30">
                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">{item.product_name}</span>
                        <span className="text-xs text-slate-400">× {item.quantity}</span>
                      </div>
                      <span className="font-medium text-slate-800">
                        ₹{(Number(item.unit_price) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
                {order.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500"><span className="font-medium">Notes:</span> {order.notes}</p>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Total</span>
                  <span className="text-lg font-bold text-blue-600">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500">
                    Order placed at {new Date(order.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
