export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  minimumStock: number;
  aisle: string;
  shelf: string;
  row: string;
}

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Alert {
  id: string;
  type: 'out-of-stock' | 'low-stock' | 'high-traffic' | 'restock-completed' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'critical' | 'warning' | 'info' | 'success';
}

export interface CustomerAnalytics {
  totalToday: number;
  avgPerHour: number;
  peakHour: string;
  returningPercent: number;
  avgVisitDuration: string;
}

export interface CustomerTraffic {
  hour: string;
  customers: number;
}

export interface SalesRecord {
  day: string;
  sales: number;
  customers: number;
}

export interface CategorySales {
  category: string;
  revenue: number;
  units: number;
}

export interface ProductPerformance {
  name: string;
  unitsSold: number;
  revenue: number;
  trend: 'up' | 'down' | 'flat';
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  customersDetected: number;
  queueLength: number;
}

export interface StoreLocation {
  id: string;
  label: string;
  category: string;
  aisle: string;
  col: number;
  row: number;
}

export interface StoreSettings {
  storeName: string;
  location: string;
  lowStockAlerts: boolean;
  outOfStockAlerts: boolean;
  highTrafficAlerts: boolean;
  dailySalesReport: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface SearchResult {
  type: 'product' | 'alert' | 'analytics';
  title: string;
  subtitle: string;
  page: string;
}

export interface AIInsight {
  icon: string;
  title: string;
  text: string;
  type: 'sales' | 'inventory' | 'customer' | 'recommendation';
}

// === Supabase types ===

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'owner';
  phone: string | null;
  created_at: string;
}

export interface Store {
  id: string;
  owner_id: string | null;
  name: string;
  location: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface StoreProduct {
  id: string;
  store_id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  minimum_stock: number;
  aisle: string;
  shelf: string;
  row: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  store_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  notes: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  store_product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  store?: Store;
}

export interface StoreProductWithStore extends StoreProduct {
  store?: Store;
}

export interface CartItem {
  store_product_id: string;
  store_id: string;
  store_name: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  stock: number;
}
