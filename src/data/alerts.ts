import type { Alert } from '@/types';

export const demoAlerts: Alert[] = [
  { id: 'a01', type: 'out-of-stock', title: 'Out of Stock', message: 'Britannia Bread is currently out of stock.', timestamp: '2026-10-04T08:15:00', read: false, severity: 'critical' },
  { id: 'a02', type: 'low-stock', title: 'Low Stock', message: 'Amul Milk 1L has fallen below the minimum stock level.', timestamp: '2026-10-04T08:30:00', read: false, severity: 'warning' },
  { id: 'a03', type: 'low-stock', title: 'Low Stock', message: 'Tata Salt 1kg has only 8 units remaining.', timestamp: '2026-10-04T09:00:00', read: false, severity: 'warning' },
  { id: 'a04', type: 'low-stock', title: 'Low Stock', message: 'Haldiram Bhujia 200g has only 3 units remaining.', timestamp: '2026-10-04T09:05:00', read: false, severity: 'warning' },
  { id: 'a05', type: 'low-stock', title: 'Low Stock', message: 'Amul Cheese 200g is below minimum stock level.', timestamp: '2026-10-04T09:10:00', read: false, severity: 'warning' },
  { id: 'a06', type: 'high-traffic', title: 'High Traffic', message: 'Customer traffic is unusually high near Checkout.', timestamp: '2026-10-04T10:00:00', read: false, severity: 'info' },
  { id: 'a07', type: 'restock-completed', title: 'Restock Completed', message: 'Surf Excel 1kg inventory has been updated.', timestamp: '2026-10-04T07:45:00', read: true, severity: 'success' },
  { id: 'a08', type: 'low-stock', title: 'Low Stock', message: 'Real Orange Juice 1L is below minimum stock level.', timestamp: '2026-10-04T09:15:00', read: false, severity: 'warning' },
  { id: 'a09', type: 'info', title: 'Daily Report Ready', message: 'Daily sales report for Sunday is now available.', timestamp: '2026-10-04T06:00:00', read: true, severity: 'info' },
  { id: 'a10', type: 'low-stock', title: 'Low Stock', message: 'Surf Excel 1kg has only 6 units remaining.', timestamp: '2026-10-04T09:20:00', read: false, severity: 'warning' },
  { id: 'a11', type: 'high-traffic', title: 'High Traffic', message: 'Peak traffic expected between 6 PM and 8 PM today.', timestamp: '2026-10-04T05:30:00', read: true, severity: 'info' },
];
