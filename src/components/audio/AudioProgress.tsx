'use client';

import { Music, X } from 'lucide-react';

interface AudioProgressProps {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  audioName: string;
  onDelete?: () => void;
}

export function AudioProgress({ isPlaying, duration, currentTime, audioName, onDelete }: AudioProgressProps) {
  // Formatear el tiempo en formato mm:ss
  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time) || time < 0) {
      return '0:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Calcular porcentaje de progreso
  const progressPercentage = (duration > 0 && isFinite(duration) && !isNaN(duration))
    ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
    : 0;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 rounded-full ${isPlaying ? 'bg-teal-100 dark:bg-teal-900/20' : 'bg-gray-100 dark:bg-gray-800/40'}`}>
          <Music className={`w-4 h-4 ${isPlaying ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{audioName || 'Audio'}</p>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors group"
            title="Eliminar audio"
          >
            <X className="w-4 h-4 text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300" />
          </button>
        )}
      </div>
      
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        {/* Track de fondo */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50"></div>
        
        {/* Barra de progreso */}
        <div 
          className={`absolute top-0 left-0 h-full ${isPlaying ? 'bg-gradient-to-r from-teal-500 to-cyan-500' : 'bg-gradient-to-r from-teal-500/90 to-cyan-500/90'}`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
        
        {/* Brillo superior */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30 dark:bg-white/10"></div>
        
        {/* Cursor */}
        <div 
          className={`absolute top-0 h-full aspect-square rounded-full ${isPlaying ? 'bg-white shadow-md' : 'bg-white/90'} transform -translate-x-1/2`}
          style={{ left: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
} 