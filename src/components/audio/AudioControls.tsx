'use client';

import { CircleStop, Mic, Pause, Play, Music } from 'lucide-react';

interface AudioControlsProps {
  status: string;
  isPlaying: boolean;
  hasAudio: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTogglePlayback: () => void;
}

export function AudioControls({
  status,
  isPlaying,
  hasAudio,
  onStartRecording,
  onStopRecording,
  onTogglePlayback,
}: AudioControlsProps) {
  const isRecording = status === 'recording';
  
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {!isRecording ? (
        <button
          onClick={onStartRecording}
          className="button-hover-effect flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50 cursor-pointer text-sm"
        >
          <div className="bg-white/20 rounded-full p-1">
            <Mic className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium">Iniciar Grabación</span>
        </button>
      ) : (
        <button
          onClick={onStopRecording}
          className="button-hover-effect flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full hover:from-red-700 hover:to-pink-700 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 animate-pulse cursor-pointer text-sm"
        >
          <div className="bg-white/20 rounded-full p-1">
            <CircleStop className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium">Detener Grabación</span>
        </button>
      )}

      {hasAudio && !isRecording && (
        <button
          onClick={onTogglePlayback}
          className={`button-hover-effect flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r ${isPlaying ? 'from-teal-600 to-cyan-700' : 'from-teal-500 to-cyan-600'} text-white rounded-full hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 cursor-pointer text-sm`}
        >
          <div className="bg-white/20 rounded-full p-1">
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </div>
          <span className="font-medium flex items-center gap-1">
            {isPlaying ? 'Pausar' : 'Reproducir'} 
            {isPlaying && <Music className="w-3.5 h-3.5 ml-1 animate-pulse" />}
          </span>
        </button>
      )}
    </div>
  );
} 