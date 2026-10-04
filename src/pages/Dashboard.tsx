import { DollarSign, Users, Package, AlertTriangle, Brain, Sparkles } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { ChartCard } from '@/components/ChartCard';
import { CameraCard } from '@/components/CameraCard';
import type { Product, Camera, SalesRecord, CustomerTraffic } from '@/types';
import { generateInsights, getLowStockProducts, getOutOfStockProducts } from '@/utils/insights';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useState } from 'react';

interface DashboardProps {
  products: Product[];
  sales: SalesRecord[];
  traffic: CustomerTraffic[];
  cameras: Camera[];
  onSimulateCamera: (id: string) => void;
}

const insightColors: Record<string, string> = {
  sales: 'border-l-blue-500 bg-blue-50/50',
  inventory: 'border-l-orange-500 bg-orange-50/50',
  customer: 'border-l-purple-500 bg-purple-50/50',
  recommendation: 'border-l-green-500 bg-green-50/50',
};

export function Dashboard({ products, sales, traffic, cameras, onSimulateCamera }: DashboardProps) {
  const [activeCameras, setActiveCameras] = useState(cameras);

  const todaySales = sales[sales.length - 1]?.sales ?? 0;
  const yesterdaySales = sales[sales.length - 2]?.sales ?? 0;
  const salesDiff = Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100);

  const todayCustomers = sales[sales.length - 1]?.customers ?? 0;
  const yesterdayCustomers = sales[sales.length - 2]?.customers ?? 0;
  const customerDiff = Math.round(((todayCustomers - yesterdayCustomers) / yesterdayCustomers) * 100);

  const totalStock = products.reduce((a, b) => a + b.stock, 0);
  const lowStock = getLowStockProducts(products);
  const outOfStock = getOutOfStockProducts(products);
  const insights = generateInsights(products, sales, traffic);

  const peakHour = traffic.reduce((max, t) => (t.customers > max.customers ? t : max), traffic[0]);

  const handleSimulate = (id: string) => {
    setActiveCameras(prev => prev.map(c =>
      c.id === id
        ? {
            ...c,
            customersDetected: c.customersDetected > 0 ? Math.max(1, Math.floor(Math.random() * 30) + 5) : 0,
            queueLength: c.location.toLowerCase().includes('checkout') ? Math.floor(Math.random() * 10) : 0,
          }
        : c
    ));
    onSimulateCamera(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">Good morning, Store Owner</h1>
          <span className="text-2xl">👋</span>
        </div>
        <p className="text-slate-500 mt-1">Here is your store's performance today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Sales" value={`₹${todaySales.toLocaleString('en-IN')}`} icon={DollarSign} trend={`${salesDiff > 0 ? '+' : ''}${salesDiff}% from yesterday`} trendDirection={salesDiff >= 0 ? 'up' : 'down'} color="blue" />
        <StatCard label="Customers Today" value={todayCustomers.toLocaleString('en-IN')} icon={Users} trend={`${customerDiff > 0 ? '+' : ''}${customerDiff}%`} trendDirection={customerDiff >= 0 ? 'up' : 'down'} color="green" />
        <StatCard label="Products in Stock" value={totalStock.toLocaleString('en-IN')} icon={Package} color="purple" />
        <StatCard label="Low Stock Items" value={lowStock.length.toString()} icon={AlertTriangle} trend={outOfStock.length > 0 ? `${outOfStock.length} out of stock` : undefined} trendDirection="warning" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Sales Overview" subtitle="Daily sales for the past week">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Sales']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Customer Traffic" subtitle="Customers by hour — peak hours highlighted">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={traffic}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip formatter={(v) => [`${v} customers`, 'Traffic']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Line dataKey="customers" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }}>
                {traffic.map((entry, i) => (
                  <Cell key={i} fill={entry.customers >= peakHour.customers * 0.8 ? '#ef4444' : '#8b5cf6'} />
                ))}
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">AI-Powered Store Insights</h2>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" /> Auto-Generated
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((ins, i) => (
            <div key={i} className={`rounded-xl border border-slate-200 border-l-4 ${insightColors[ins.type]} p-4`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{ins.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{ins.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{ins.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Smart Camera Monitoring</h2>
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">DEMO SIMULATION</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCameras.map(cam => (
            <CameraCard key={cam.id} camera={cam} onSimulate={handleSimulate} />
          ))}
        </div>
      </div>
    </div>
  );
}
