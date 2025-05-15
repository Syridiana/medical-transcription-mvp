'use client';

import { MicrophoneIcon, StopIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

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
  return (
    <div className="flex justify-center gap-4">
      {status !== 'recording' ? (
        <button
          onClick={onStartRecording}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MicrophoneIcon className="w-5 h-5" />
          Iniciar Grabación
        </button>
      ) : (
        <button
          onClick={onStopRecording}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <StopIcon className="w-5 h-5" />
          Detener Grabación
        </button>
      )}

      {hasAudio && (
        <button
          onClick={onTogglePlayback}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {isPlaying ? (
            <>
              <PauseIcon className="w-5 h-5" />
              Pausar
            </>
          ) : (
            <>
              <PlayIcon className="w-5 h-5" />
              Reproducir
            </>
          )}
        </button>
      )}
    </div>
  );
} 