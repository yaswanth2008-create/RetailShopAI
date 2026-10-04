import { useState } from 'react';
import { ProductSearch } from '@/components/ProductSearch';
import { StoreMap } from '@/components/StoreMap';
import type { Product } from '@/types';

interface ProductFinderProps {
  products: Product[];
}

export function ProductFinder({ products }: ProductFinderProps) {
  const [highlightAisle, setHighlightAisle] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Smart Product Finder</h1>
        <p className="text-slate-500 mt-1">Search for any product and find its exact location in the store.</p>
      </div>

      <ProductSearch products={products} onProductFound={(aisle) => setHighlightAisle(aisle)} />

      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Store Map</h2>
        <StoreMap highlightAisle={highlightAisle} />
        {highlightAisle && (
          <p className="text-sm text-blue-600 mt-3 text-center font-medium">
            Highlighting: {highlightAisle}
          </p>
        )}
      </div>
    </div>
  );
}
