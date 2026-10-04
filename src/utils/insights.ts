import type { Product, SalesRecord, CustomerTraffic, AIInsight, StockStatus } from '@/types';

export function getStockStatus(product: Product): StockStatus {
  if (product.stock === 0) return 'Out of Stock';
  if (product.stock <= product.minimumStock) return 'Low Stock';
  return 'In Stock';
}

export function getLowStockProducts(products: Product[]): Product[] {
  return products.filter(p => p.stock <= p.minimumStock);
}

export function getOutOfStockProducts(products: Product[]): Product[] {
  return products.filter(p => p.stock === 0);
}

export function generateInsights(
  products: Product[],
  sales: SalesRecord[],
  traffic: CustomerTraffic[]
): AIInsight[] {
  const lowStock = getLowStockProducts(products);
  const outOfStock = getOutOfStockProducts(products);
  const weekendSales = sales.filter(s => s.day === 'Saturday' || s.day === 'Sunday');
  const weekdaySales = sales.filter(s => s.day !== 'Saturday' && s.day !== 'Sunday');
  const avgWeekend = weekendSales.reduce((a, b) => a + b.sales, 0) / weekendSales.length;
  const avgWeekday = weekdaySales.reduce((a, b) => a + b.sales, 0) / weekdaySales.length;
  const weekendDiff = Math.round(((avgWeekend - avgWeekday) / avgWeekday) * 100);

  const peakTraffic = traffic.reduce((max, t) => (t.customers > max.customers ? t : max), traffic[0]);
  const peakHourIdx = traffic.indexOf(peakTraffic);
  const peakHourEnd = traffic[Math.min(peakHourIdx + 1, traffic.length - 1)];

  return [
    {
      icon: '📈',
      title: 'Sales Insight',
      text: `Weekend sales are approximately ${weekendDiff}% higher than weekday sales.`,
      type: 'sales',
    },
    {
      icon: '📦',
      title: 'Inventory Insight',
      text: `${lowStock.length} products are below their minimum stock level. ${outOfStock.length} are completely out of stock.`,
      type: 'inventory',
    },
    {
      icon: '👥',
      title: 'Customer Insight',
      text: `Peak customer traffic occurs between ${peakTraffic.hour} and ${peakHourEnd.hour}.`,
      type: 'customer',
    },
    {
      icon: '💡',
      title: 'Recommendation',
      text: `Consider increasing staff availability during the ${peakTraffic.hour}–${peakHourEnd.hour} period for better service.`,
      type: 'recommendation',
    },
  ];
}
