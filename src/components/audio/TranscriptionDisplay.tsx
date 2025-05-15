'use client';

import { TranscriptionResponse } from './types';
import { FileText, Mic, TriangleAlert } from 'lucide-react';

interface TranscriptionDisplayProps {
  isLoading: boolean;
  error: string | null;
  transcription: TranscriptionResponse | null;
  hasAudioFile: boolean;
}

export function TranscriptionDisplay({
  isLoading,
  error,
  transcription,
  hasAudioFile,
}: TranscriptionDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-violet-100 dark:border-violet-900/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-600 dark:border-t-violet-400 animate-spin"></div>
        </div>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mt-6">Procesando audio...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Esto puede tomar unos momentos</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
          <TriangleAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Error</p>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">{error}</p>
      </div>
    );
  }

  if (transcription) {
    return (
      <>
        <h2 className="text-xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 inline-block">Transcripción</h2>
        <div className="space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 pr-2">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/10 p-4 rounded-xl">
            <h3 className="font-medium text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              Doctor:
            </h3>
            {transcription.transcription.doctor.map((text, index) => (
              <p key={index} className="text-gray-700 dark:text-gray-300 mb-2 pl-4 border-l-2 border-blue-200 dark:border-blue-800">{text}</p>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/10 p-4 rounded-xl">
            <h3 className="font-medium text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></span>
              Paciente:
            </h3>
            {transcription.transcription.patient.map((text, index) => (
              <p key={index} className="text-gray-700 dark:text-gray-300 mb-2 pl-4 border-l-2 border-green-200 dark:border-green-800">{text}</p>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (hasAudioFile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-5 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-5 animate-pulse">
          <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Audio Listo para Procesar</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Haz click en el botón Procesar Audio para comenzar la transcripción
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-violet-400/20 to-indigo-400/20 rounded-full blur-xl opacity-70 animate-pulse"></div>
        <div className="p-5 bg-gray-100 dark:bg-gray-800/40 rounded-full mb-5 relative">
          <Mic className="w-10 h-10 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Esperando Audio</h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md">
        Graba un nuevo audio o sube un archivo existente para comenzar
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-4 bg-gray-100/50 dark:bg-gray-800/30 px-3 py-1.5 rounded-full inline-block">
        Formatos soportados: WAV, MP3, M4A
      </p>
    </div>
  );
} 