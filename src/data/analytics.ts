import type { SalesRecord, CustomerTraffic, CategorySales, ProductPerformance, Camera } from '@/types';

export const weeklySales: SalesRecord[] = [
  { day: 'Monday', sales: 38200, customers: 980 },
  { day: 'Tuesday', sales: 41500, customers: 1020 },
  { day: 'Wednesday', sales: 36500, customers: 910 },
  { day: 'Thursday', sales: 42800, customers: 1050 },
  { day: 'Friday', sales: 51200, customers: 1180 },
  { day: 'Saturday', sales: 58400, customers: 1340 },
  { day: 'Sunday', sales: 48650, customers: 1284 },
];

export const customerTraffic: CustomerTraffic[] = [
  { hour: '9 AM', customers: 45 },
  { hour: '10 AM', customers: 72 },
  { hour: '11 AM', customers: 95 },
  { hour: '12 PM', customers: 128 },
  { hour: '1 PM', customers: 110 },
  { hour: '2 PM', customers: 85 },
  { hour: '3 PM', customers: 92 },
  { hour: '4 PM', customers: 105 },
  { hour: '5 PM', customers: 142 },
  { hour: '6 PM', customers: 178 },
  { hour: '7 PM', customers: 165 },
  { hour: '8 PM', customers: 120 },
];

export const categorySales: CategorySales[] = [
  { category: 'Grocery', revenue: 185000, units: 820 },
  { category: 'Dairy', revenue: 92500, units: 680 },
  { category: 'Beverages', revenue: 78200, units: 1120 },
  { category: 'Bakery', revenue: 45600, units: 540 },
  { category: 'Household', revenue: 62300, units: 380 },
  { category: 'Personal Care', revenue: 54100, units: 290 },
  { category: 'Snacks', revenue: 38900, units: 950 },
];

export const productPerformance: ProductPerformance[] = [
  { name: 'Amul Milk 1L', unitsSold: 245, revenue: 14210, trend: 'up' },
  { name: 'Tata Salt 1kg', unitsSold: 182, revenue: 5096, trend: 'up' },
  { name: 'Coca Cola 750ml', unitsSold: 165, revenue: 6600, trend: 'up' },
  { name: 'Britannia Bread', unitsSold: 143, revenue: 5720, trend: 'down' },
  { name: 'Aashirvaad Atta 5kg', unitsSold: 98, revenue: 24010, trend: 'up' },
  { name: 'Surf Excel 1kg', unitsSold: 87, revenue: 15225, trend: 'down' },
  { name: 'Lays Classic 52g', unitsSold: 76, revenue: 1520, trend: 'up' },
  { name: 'Bisleri Water 1L', unitsSold: 64, revenue: 1280, trend: 'flat' },
];

export const demoCameras: Camera[] = [
  { id: 'cam01', name: 'Camera 01', location: 'Entrance', status: 'online', customersDetected: 24, queueLength: 0 },
  { id: 'cam02', name: 'Camera 02', location: 'Grocery Aisle', status: 'online', customersDetected: 17, queueLength: 0 },
  { id: 'cam03', name: 'Camera 03', location: 'Checkout', status: 'online', customersDetected: 0, queueLength: 6 },
];
