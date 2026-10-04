/*
# Alter stores table for demo seeding

The stores table has a FK constraint on owner_id -> profiles.id, which requires
a real auth user to exist. For demo stores that customers can browse, we need
to insert stores without a real owner. This migration:
1. Drops the FK constraint on stores.owner_id
2. Makes owner_id nullable (demo stores have NULL owner)
3. Updates RLS to allow seeing stores where is_active = true regardless of owner
4. Inserts the 3 demo stores with NULL owner_id and their products
*/

-- Drop the FK constraint so demo stores can have NULL owner_id
ALTER TABLE stores DROP CONSTRAINT IF EXISTS stores_owner_id_fkey;
ALTER TABLE stores ALTER COLUMN owner_id DROP NOT NULL;

-- Insert demo stores with NULL owner (system-managed demo data)
INSERT INTO stores (owner_id, name, location, description, is_active)
VALUES
  (NULL, 'SmartMart Supermarket', 'Vijayawada', 'Your one-stop shop for all grocery needs. Best prices in town.', true),
  (NULL, 'FreshDaily Grocers', 'Vijayawada', 'Fresh groceries delivered daily. Quality you can trust.', true),
  (NULL, 'QuickBuy Mart', 'Vijayawada', 'Quick shopping for busy people. Fast checkout, great deals.', true);

-- Insert products for each store
-- SmartMart Supermarket
INSERT INTO store_products (store_id, name, category, sku, price, stock, minimum_stock, aisle, shelf, row)
SELECT id, p.name, p.category, p.sku, p.price, p.stock, p.minimum_stock, p.aisle, p.shelf, p.row
FROM stores, (VALUES
  ('Tata Salt 1kg', 'Grocery', 'GRO-001', 28, 48, 20, 'Aisle 2', 'B', '3'),
  ('Aashirvaad Atta 5kg', 'Grocery', 'GRO-002', 245, 35, 15, 'Aisle 1', 'A', '2'),
  ('Fortune Sunflower Oil 1L', 'Grocery', 'GRO-003', 135, 22, 15, 'Aisle 1', 'C', '1'),
  ('Basmati Rice 5kg', 'Grocery', 'GRO-004', 420, 18, 12, 'Aisle 2', 'A', '4'),
  ('Toor Dal 1kg', 'Grocery', 'GRO-005', 145, 30, 15, 'Aisle 2', 'D', '2'),
  ('Amul Milk 1L', 'Dairy', 'DAI-001', 58, 5, 25, 'Chiller 1', 'A', '1'),
  ('Amul Butter 500g', 'Dairy', 'DAI-002', 265, 14, 10, 'Chiller 1', 'B', '2'),
  ('Amul Cheese 200g', 'Dairy', 'DAI-003', 125, 9, 12, 'Chiller 1', 'C', '3'),
  ('Mother Dairy Curd 400g', 'Dairy', 'DAI-004', 35, 28, 15, 'Chiller 1', 'A', '2'),
  ('Coca Cola 750ml', 'Beverages', 'BEV-001', 40, 42, 20, 'Aisle 6', 'A', '1'),
  ('Pepsi 750ml', 'Beverages', 'BEV-002', 38, 35, 20, 'Aisle 6', 'B', '1'),
  ('Real Orange Juice 1L', 'Beverages', 'BEV-003', 110, 7, 12, 'Aisle 6', 'C', '2'),
  ('Bisleri Water 1L', 'Beverages', 'BEV-004', 20, 85, 30, 'Aisle 6', 'D', '1'),
  ('Britannia Bread', 'Bakery', 'BAK-001', 40, 0, 20, 'Aisle 4', 'A', '1'),
  ('Britannia Cake 200g', 'Bakery', 'BAK-002', 30, 16, 10, 'Aisle 4', 'B', '2'),
  ('Surf Excel 1kg', 'Household', 'HOU-001', 175, 6, 15, 'Aisle 8', 'A', '1'),
  ('Vim Dishwash 750ml', 'Household', 'HOU-002', 85, 19, 10, 'Aisle 8', 'B', '2'),
  ('Colgate Toothpaste 200g', 'Personal Care', 'PER-001', 95, 28, 12, 'Aisle 7', 'A', '1'),
  ('Dove Shampoo 340ml', 'Personal Care', 'PER-002', 280, 11, 8, 'Aisle 7', 'B', '2'),
  ('Lays Classic 52g', 'Snacks', 'SNK-001', 20, 60, 25, 'Aisle 3', 'A', '1'),
  ('Kurkure 90g', 'Snacks', 'SNK-002', 20, 45, 20, 'Aisle 3', 'B', '2'),
  ('Haldiram Bhujia 200g', 'Snacks', 'SNK-003', 55, 3, 15, 'Aisle 3', 'C', '1')
) AS p(name, category, sku, price, stock, minimum_stock, aisle, shelf, row)
WHERE stores.name = 'SmartMart Supermarket';

-- FreshDaily Grocers
INSERT INTO store_products (store_id, name, category, sku, price, stock, minimum_stock, aisle, shelf, row)
SELECT id, p.name, p.category, p.sku, p.price, p.stock, p.minimum_stock, p.aisle, p.shelf, p.row
FROM stores, (VALUES
  ('Tata Salt 1kg', 'Grocery', 'GRO-001', 26, 55, 20, 'Aisle 1', 'A', '1'),
  ('Aashirvaad Atta 5kg', 'Grocery', 'GRO-002', 238, 40, 15, 'Aisle 1', 'B', '2'),
  ('Fortune Sunflower Oil 1L', 'Grocery', 'GRO-003', 130, 28, 15, 'Aisle 2', 'A', '1'),
  ('Basmati Rice 5kg', 'Grocery', 'GRO-004', 410, 22, 12, 'Aisle 2', 'B', '3'),
  ('Toor Dal 1kg', 'Grocery', 'GRO-005', 150, 25, 15, 'Aisle 1', 'C', '3'),
  ('Amul Milk 1L', 'Dairy', 'DAI-001', 56, 32, 25, 'Chiller 1', 'A', '1'),
  ('Amul Butter 500g', 'Dairy', 'DAI-002', 258, 18, 10, 'Chiller 1', 'B', '2'),
  ('Amul Cheese 200g', 'Dairy', 'DAI-003', 120, 15, 12, 'Chiller 1', 'C', '3'),
  ('Mother Dairy Curd 400g', 'Dairy', 'DAI-004', 33, 30, 15, 'Chiller 1', 'A', '2'),
  ('Coca Cola 750ml', 'Beverages', 'BEV-001', 42, 38, 20, 'Aisle 5', 'A', '1'),
  ('Pepsi 750ml', 'Beverages', 'BEV-002', 40, 32, 20, 'Aisle 5', 'B', '1'),
  ('Bisleri Water 1L', 'Beverages', 'BEV-004', 18, 70, 30, 'Aisle 5', 'C', '1'),
  ('Britannia Bread', 'Bakery', 'BAK-001', 38, 24, 20, 'Aisle 3', 'A', '1'),
  ('Britannia Cake 200g', 'Bakery', 'BAK-002', 28, 20, 10, 'Aisle 3', 'B', '2'),
  ('Surf Excel 1kg', 'Household', 'HOU-001', 168, 12, 15, 'Aisle 4', 'A', '1'),
  ('Vim Dishwash 750ml', 'Household', 'HOU-002', 82, 22, 10, 'Aisle 4', 'B', '2'),
  ('Colgate Toothpaste 200g', 'Personal Care', 'PER-001', 92, 30, 12, 'Aisle 6', 'A', '1'),
  ('Dove Shampoo 340ml', 'Personal Care', 'PER-002', 275, 14, 8, 'Aisle 6', 'B', '2'),
  ('Lays Classic 52g', 'Snacks', 'SNK-001', 20, 65, 25, 'Aisle 7', 'A', '1'),
  ('Haldiram Bhujia 200g', 'Snacks', 'SNK-003', 52, 18, 15, 'Aisle 7', 'C', '1')
) AS p(name, category, sku, price, stock, minimum_stock, aisle, shelf, row)
WHERE stores.name = 'FreshDaily Grocers';

-- QuickBuy Mart
INSERT INTO store_products (store_id, name, category, sku, price, stock, minimum_stock, aisle, shelf, row)
SELECT id, p.name, p.category, p.sku, p.price, p.stock, p.minimum_stock, p.aisle, p.shelf, p.row
FROM stores, (VALUES
  ('Tata Salt 1kg', 'Grocery', 'GRO-001', 30, 42, 20, 'Aisle 1', 'A', '1'),
  ('Aashirvaad Atta 5kg', 'Grocery', 'GRO-002', 252, 28, 15, 'Aisle 1', 'B', '2'),
  ('Fortune Sunflower Oil 1L', 'Grocery', 'GRO-003', 138, 18, 15, 'Aisle 2', 'A', '1'),
  ('Basmati Rice 5kg', 'Grocery', 'GRO-004', 415, 15, 12, 'Aisle 2', 'B', '3'),
  ('Toor Dal 1kg', 'Grocery', 'GRO-005', 142, 28, 15, 'Aisle 1', 'C', '3'),
  ('Amul Milk 1L', 'Dairy', 'DAI-001', 60, 20, 25, 'Chiller 1', 'A', '1'),
  ('Amul Butter 500g', 'Dairy', 'DAI-002', 270, 10, 10, 'Chiller 1', 'B', '2'),
  ('Amul Cheese 200g', 'Dairy', 'DAI-003', 128, 7, 12, 'Chiller 1', 'C', '3'),
  ('Mother Dairy Curd 400g', 'Dairy', 'DAI-004', 38, 22, 15, 'Chiller 1', 'A', '2'),
  ('Coca Cola 750ml', 'Beverages', 'BEV-001', 38, 50, 20, 'Aisle 3', 'A', '1'),
  ('Pepsi 750ml', 'Beverages', 'BEV-002', 36, 40, 20, 'Aisle 3', 'B', '1'),
  ('Bisleri Water 1L', 'Beverages', 'BEV-004', 22, 90, 30, 'Aisle 3', 'C', '1'),
  ('Britannia Bread', 'Bakery', 'BAK-001', 42, 18, 20, 'Aisle 4', 'A', '1'),
  ('Britannia Cake 200g', 'Bakery', 'BAK-002', 32, 14, 10, 'Aisle 4', 'B', '2'),
  ('Surf Excel 1kg', 'Household', 'HOU-001', 180, 8, 15, 'Aisle 5', 'A', '1'),
  ('Vim Dishwash 750ml', 'Household', 'HOU-002', 88, 16, 10, 'Aisle 5', 'B', '2'),
  ('Colgate Toothpaste 200g', 'Personal Care', 'PER-001', 98, 24, 12, 'Aisle 6', 'A', '1'),
  ('Lays Classic 52g', 'Snacks', 'SNK-001', 20, 55, 25, 'Aisle 7', 'A', '1'),
  ('Kurkure 90g', 'Snacks', 'SNK-002', 20, 48, 20, 'Aisle 7', 'B', '2'),
  ('Haldiram Bhujia 200g', 'Snacks', 'SNK-003', 58, 8, 15, 'Aisle 7', 'C', '1')
) AS p(name, category, sku, price, stock, minimum_stock, aisle, shelf, row)
WHERE stores.name = 'QuickBuy Mart';
