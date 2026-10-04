import type { StoreLocation } from '@/types';

export const storeLocations: StoreLocation[] = [
  { id: 'loc1', label: 'Aisle 1', category: 'Grocery', aisle: 'Aisle 1', col: 0, row: 0 },
  { id: 'loc2', label: 'Aisle 2', category: 'Grocery', aisle: 'Aisle 2', col: 1, row: 0 },
  { id: 'loc3', label: 'Aisle 3', category: 'Snacks', aisle: 'Aisle 3', col: 2, row: 0 },
  { id: 'loc4', label: 'Aisle 4', category: 'Bakery', aisle: 'Aisle 4', col: 0, row: 1 },
  { id: 'loc5', label: 'Aisle 5', category: 'Dairy', aisle: 'Chiller 1', col: 1, row: 1 },
  { id: 'loc6', label: 'Aisle 6', category: 'Beverages', aisle: 'Aisle 6', col: 2, row: 1 },
  { id: 'loc7', label: 'Aisle 7', category: 'Personal Care', aisle: 'Aisle 7', col: 0, row: 2 },
  { id: 'loc8', label: 'Aisle 8', category: 'Household', aisle: 'Aisle 8', col: 1, row: 2 },
  { id: 'loc9', label: 'Checkout', category: 'Checkout', aisle: 'Checkout', col: 2, row: 2 },
];
