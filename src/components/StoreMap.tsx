import { storeLocations } from '@/data/storeLocations';
import { DoorOpen } from 'lucide-react';

interface StoreMapProps {
  highlightAisle?: string | null;
}

export function StoreMap({ highlightAisle }: StoreMapProps) {
  const grid: (typeof storeLocations[0] | null)[][] = [[null, null, null], [null, null, null], [null, null, null]];
  storeLocations.forEach(loc => {
    if (loc.row < 3 && loc.col < 3) grid[loc.row][loc.col] = loc;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full">
          <DoorOpen className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">ENTRANCE</span>
        </div>
      </div>
      <div className="space-y-3">
        {grid.map((row, ri) => (
          <div key={ri} className="grid grid-cols-3 gap-3">
            {row.map((cell, ci) => {
              if (!cell) return <div key={ci} className="rounded-lg border border-dashed border-slate-200" />;
              const isHighlighted = highlightAisle && cell.aisle === highlightAisle;
              const isCheckout = cell.category === 'Checkout';
              return (
                <div
                  key={ci}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    isHighlighted
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-400 scale-[1.02]'
                      : isCheckout
                      ? 'border-slate-300 bg-slate-800 text-white'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <p className={`font-bold text-sm ${isCheckout ? 'text-white' : 'text-slate-800'}`}>{cell.label}</p>
                  <p className={`text-xs mt-0.5 ${isCheckout ? 'text-slate-300' : 'text-slate-500'}`}>{cell.category}</p>
                  {isHighlighted && (
                    <p className="text-[10px] text-blue-600 font-semibold mt-1">● Located Here</p>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
