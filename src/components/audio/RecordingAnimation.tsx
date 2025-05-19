'use client';

import { Mic, Volume2 } from 'lucide-react';

export function RecordingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-8 relative">
        <div className="absolute -inset-4 bg-red-400/20 animate-ping rounded-full opacity-75"></div>
        <div className="absolute -inset-8 bg-red-400/10 animate-pulse rounded-full opacity-50"></div>
        <div className="absolute -inset-16 bg-red-400/5 rounded-full opacity-30"></div>
        <div className="relative bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-full shadow-lg">
          <Mic className="w-10 h-10 text-white" />
        </div>
      </div>
      
      <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4 text-center">Grabando Consulta</h2>
      
      <div className="flex justify-center items-center space-x-1 mb-6 h-12">
        <div className="w-1 h-5 bg-red-400 rounded-full animate-sound-wave"></div>
        <div className="w-1 h-8 bg-red-500 rounded-full animate-sound-wave-fast"></div>
        <div className="w-1 h-12 bg-red-600 rounded-full animate-sound-wave"></div>
        <div className="w-1 h-8 bg-red-500 rounded-full animate-sound-wave-slow"></div>
        <div className="w-1 h-10 bg-red-400 rounded-full animate-sound-wave-fast"></div>
        <div className="w-1 h-6 bg-red-500 rounded-full animate-sound-wave"></div>
        <div className="w-1 h-9 bg-red-600 rounded-full animate-sound-wave-slow"></div>
        <div className="w-1 h-7 bg-red-400 rounded-full animate-sound-wave-fast"></div>
        <div className="w-1 h-5 bg-red-500 rounded-full animate-sound-wave"></div>
      </div>
      
      <div className="flex items-center text-gray-600 dark:text-gray-300 space-x-1 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full shadow-sm">
        <Volume2 className="w-4 h-4 text-red-500 animate-pulse" />
        <p className="text-sm">Hable con claridad para obtener mejores resultados</p>
      </div>
    </div>
  );
} 