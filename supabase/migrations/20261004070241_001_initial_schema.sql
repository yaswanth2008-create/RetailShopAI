/*
# RetailMind AI — Initial Database Schema

## Overview
Creates the full multi-tenant schema for RetailMind AI, a retail digitalisation platform
with two user roles: **shop owners** who manage stores/inventory, and **customers** who
browse stores, compare prices, and place grocery orders.

## New Tables

1. **profiles** — Extends Supabase auth.users with role (customer/owner) and display name.
2. **stores** — Stores owned by shop owners.
3. **store_products** — Products belonging to a store with stock and pricing.
4. **orders** — Orders placed by customers at a store.
5. **order_items** — Line items for each order.

## Security (RLS)
- profiles: users can read/update only their own profile.
- stores: owners CRUD their own; customers read active stores.
- store_products: owners CRUD their store's products; customers view products from active stores.
- orders: customers see/create their own; owners see and update orders for their store.
- order_items: accessible through parent order ownership.
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'owner')),
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

-- ============ STORES ============
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text NOT NULL DEFAULT '',
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_stores" ON stores;
CREATE POLICY "select_stores" ON stores FOR SELECT
TO authenticated USING (owner_id = auth.uid() OR is_active = true);

DROP POLICY IF EXISTS "insert_stores" ON stores;
CREATE POLICY "insert_stores" ON stores FOR INSERT
TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "update_stores" ON stores;
CREATE POLICY "update_stores" ON stores FOR UPDATE
TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "delete_stores" ON stores;
CREATE POLICY "delete_stores" ON stores FOR DELETE
TO authenticated USING (owner_id = auth.uid());

-- ============ STORE_PRODUCTS ============
CREATE TABLE IF NOT EXISTS store_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Grocery',
  sku text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0 CHECK (price >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  minimum_stock integer NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
  aisle text NOT NULL DEFAULT '',
  shelf text NOT NULL DEFAULT '',
  row text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_store_products" ON store_products;
CREATE POLICY "select_store_products" ON store_products FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = store_products.store_id AND stores.owner_id = auth.uid())
  OR
  EXISTS (SELECT 1 FROM stores WHERE stores.id = store_products.store_id AND stores.is_active = true)
);

DROP POLICY IF EXISTS "insert_store_products" ON store_products;
CREATE POLICY "insert_store_products" ON store_products FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = store_products.store_id AND stores.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "update_store_products" ON store_products;
CREATE POLICY "update_store_products" ON store_products FOR UPDATE
TO authenticated USING (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = store_products.store_id AND stores.owner_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = store_products.store_id AND stores.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "delete_store_products" ON store_products;
CREATE POLICY "delete_store_products" ON store_products FOR DELETE
TO authenticated USING (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = store_products.store_id AND stores.owner_id = auth.uid())
);

-- ============ ORDERS ============
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  total_amount numeric NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_orders" ON orders;
CREATE POLICY "select_orders" ON orders FOR SELECT
TO authenticated USING (
  customer_id = auth.uid()
  OR
  EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "insert_orders" ON orders;
CREATE POLICY "insert_orders" ON orders FOR INSERT
TO authenticated WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "update_orders" ON orders;
CREATE POLICY "update_orders" ON orders FOR UPDATE
TO authenticated USING (
  customer_id = auth.uid()
  OR
  EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid())
) WITH CHECK (
  customer_id = auth.uid()
  OR
  EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "delete_orders" ON orders;
CREATE POLICY "delete_orders" ON orders FOR DELETE
TO authenticated USING (customer_id = auth.uid());

-- ============ ORDER_ITEMS ============
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  store_product_id uuid REFERENCES store_products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_order_items" ON order_items;
CREATE POLICY "select_order_items" ON order_items FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
  OR
  EXISTS (SELECT 1 FROM orders JOIN stores ON stores.id = orders.store_id WHERE orders.id = order_items.order_id AND stores.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "insert_order_items" ON order_items;
CREATE POLICY "insert_order_items" ON order_items FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
);

DROP POLICY IF EXISTS "update_order_items" ON order_items;
CREATE POLICY "update_order_items" ON order_items FOR UPDATE
TO authenticated USING (
  EXISTS (SELECT 1 FROM orders JOIN stores ON stores.id = orders.store_id WHERE orders.id = order_items.order_id AND stores.owner_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM orders JOIN stores ON stores.id = orders.store_id WHERE orders.id = order_items.order_id AND stores.owner_id = auth.uid())
);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_store_products_store ON store_products(store_id);
CREATE INDEX IF NOT EXISTS idx_store_products_category ON store_products(category);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
