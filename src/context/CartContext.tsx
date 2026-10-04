import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CartItem, StoreProduct, Store } from '@/types';

interface CartContextValue {
  items: CartItem[];
  addItem: (product: StoreProduct, store: Store) => void;
  removeItem: (storeProductId: string) => void;
  updateQuantity: (storeProductId: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  total: 0,
  count: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: StoreProduct, store: Store) => {
    setItems(prev => {
      const existing = prev.find(i => i.store_product_id === product.id);
      if (existing) {
        return prev.map(i =>
          i.store_product_id === product.id
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
            : i
        );
      }
      return [
        ...prev,
        {
          store_product_id: product.id,
          store_id: store.id,
          store_name: store.name,
          product_name: product.name,
          unit_price: product.price,
          quantity: 1,
          stock: product.stock,
        },
      ];
    });
  };

  const removeItem = (storeProductId: string) => {
    setItems(prev => prev.filter(i => i.store_product_id !== storeProductId));
  };

  const updateQuantity = (storeProductId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(storeProductId);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.store_product_id === storeProductId
          ? { ...i, quantity: Math.min(qty, i.stock) }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
