'use client';

import { Music, X } from 'lucide-react';

interface AudioProgressProps {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  audioName: string;
  onDelete: () => void;
}

export function AudioProgress({ isPlaying, duration, currentTime, audioName, onDelete }: AudioProgressProps) {
  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-full ${isPlaying ? 'bg-teal-100' : 'bg-gray-100'}`}>
          <Music className={`w-4 h-4 ${isPlaying ? 'text-teal-600' : 'text-gray-500'}`} />
        </div>

        <p className="text-sm font-medium text-gray-700 truncate">{audioName || 'Audio'}</p>

        <button
          onClick={onDelete}
          type="button"
          className="p-1.5 rounded-full hover:bg-red-100 transition-colors group ml-auto"
          aria-label="Eliminar audio"
        >
          <X className="w-4 h-4 text-red-500 group-hover:text-red-600" />
        </button>
      </div>

      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        {/* Fondo de la barra de progreso */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-gray-300/50"></div>

        {/* Barra de progreso */}
        <div
          className="absolute h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        >
          {/* Línea brillante superior */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
} 