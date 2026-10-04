import { Users, Clock, TrendingUp, Repeat, Timer, DollarSign, Award, Tag } from 'lucide-react';
import { ChartCard } from '@/components/ChartCard';
import { StatCard } from '@/components/StatCard';
import type { SalesRecord, CustomerTraffic, CategorySales, ProductPerformance } from '@/types';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp as TrendUp, TrendingDown as TrendDown, Minus } from 'lucide-react';

interface AnalyticsProps {
  sales: SalesRecord[];
  traffic: CustomerTraffic[];
  categorySales: CategorySales[];
  productPerformance: ProductPerformance[];
}

const pieColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export function Analytics({ sales, traffic, categorySales, productPerformance }: AnalyticsProps) {
  const totalToday = traffic.reduce((a, b) => a + b.customers, 0);
  const avgPerHour = Math.round(totalToday / traffic.length);
  const peakHour = traffic.reduce((max, t) => (t.customers > max.customers ? t : max), traffic[0]);

  const todaySales = sales[sales.length - 1]?.sales ?? 0;
  const weeklyTotal = sales.reduce((a, b) => a + b.sales, 0);
  const monthlyTotal = Math.round(weeklyTotal * 4.3);
  const avgOrderValue = Math.round(todaySales / (sales[sales.length - 1]?.customers ?? 1));
  const bestProduct = [...productPerformance].sort((a, b) => b.revenue - a.revenue)[0];
  const bestCategory = [...categorySales].sort((a, b) => b.revenue - a.revenue)[0];

  const trendIcon = (trend: string) => {
    if (trend === 'up') return <TrendUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customer Analytics</h1>
        <p className="text-slate-500 mt-1">Understand your store's customer traffic patterns.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-slate-500">Total Today</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalToday.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-green-600" />
            <span className="text-sm text-slate-500">Avg / Hour</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{avgPerHour}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-slate-500">Peak Hour</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{peakHour.hour}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Repeat className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-slate-500">Returning %</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">42%</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-slate-500">Avg Visit Duration</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">18 min</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Customer Traffic Chart" subtitle="Customers throughout the day">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={traffic}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip formatter={(v) => [`${v} customers`, 'Traffic']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Line type="monotone" dataKey="customers" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Peak Hours" subtitle="Bar chart showing busy periods">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={traffic}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip formatter={(v) => [`${v} customers`, 'Count']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Bar dataKey="customers" radius={[4, 4, 0, 0]}>
                {traffic.map((entry, i) => (
                  <Cell key={i} fill={entry.customers >= peakHour.customers * 0.8 ? '#ef4444' : '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Sales Analytics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Today's Sales" value={`₹${todaySales.toLocaleString('en-IN')}`} icon={DollarSign} color="blue" />
          <StatCard label="Weekly Sales" value={`₹${weeklyTotal.toLocaleString('en-IN')}`} icon={DollarSign} color="green" />
          <StatCard label="Monthly Sales" value={`₹${monthlyTotal.toLocaleString('en-IN')}`} icon={DollarSign} color="purple" />
          <StatCard label="Avg Order Value" value={`₹${avgOrderValue.toLocaleString('en-IN')}`} icon={DollarSign} color="orange" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Best-Selling Product</p>
              <p className="font-bold text-slate-900">{bestProduct.name}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Tag className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Best-Performing Category</p>
              <p className="font-bold text-slate-900">{bestCategory.category}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Weekly Sales" subtitle="Bar chart of daily sales">
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

        <ChartCard title="Category Performance" subtitle="Revenue by product category">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categorySales} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
                {categorySales.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Product Performance</h3>
          <p className="text-xs text-slate-500 mt-0.5">Sales by product with trend indicators</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-5 py-3 font-semibold text-slate-600">Product</th>
                <th className="px-5 py-3 font-semibold text-slate-600 text-right">Units Sold</th>
                <th className="px-5 py-3 font-semibold text-slate-600 text-right">Revenue</th>
                <th className="px-5 py-3 font-semibold text-slate-600 text-center">Trend</th>
              </tr>
            </thead>
            <tbody>
              {productPerformance.map((p, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <td className="px-5 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{p.unitsSold}</td>
                  <td className="px-5 py-3 text-right font-medium text-slate-700">₹{p.revenue.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3 text-center">{trendIcon(p.trend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
