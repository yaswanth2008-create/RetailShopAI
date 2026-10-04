import { Camera, Video, RefreshCw } from 'lucide-react';
import type { Camera as CameraType } from '@/types';

interface CameraCardProps {
  camera: CameraType;
  onSimulate: (id: string) => void;
}

export function CameraCard({ camera, onSimulate }: CameraCardProps) {
  const isCheckout = camera.location.toLowerCase().includes('checkout');

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 right-0 h-px bg-green-400 animate-[scan_3s_linear_infinite]" />
        </div>
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Video className="w-10 h-10" />
          <span className="text-xs font-medium">Camera Feed (Demo)</span>
        </div>
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 rounded px-2 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-green-400 font-medium">REC</span>
        </div>
        <div className="absolute top-2 right-2 text-[10px] text-slate-400 font-mono">
          {camera.name}
        </div>
        <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 font-mono">
          AI Vision System Active (Demo Simulation)
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-sm text-slate-800">{camera.name}</span>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Online
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">Location: {camera.location}</p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-50 rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-slate-800">{camera.customersDetected}</p>
            <p className="text-[10px] text-slate-500">Customers Detected</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-slate-800">{isCheckout ? camera.queueLength : '—'}</p>
            <p className="text-[10px] text-slate-500">{isCheckout ? 'Queue Length' : 'N/A'}</p>
          </div>
        </div>

        <button
          onClick={() => onSimulate(camera.id)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Simulate New Scan
        </button>
      </div>
    </div>
  );
}
