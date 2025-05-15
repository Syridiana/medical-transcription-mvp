'use client';

import { MicrophoneIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { TranscriptionResponse } from './types';

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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-600">Procesando audio...</p>
        <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos momentos</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-lg text-red-600 mb-2">Error</p>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (transcription) {
    return (
      <>
        <h2 className="text-xl font-semibold mb-4">Transcripción</h2>
        <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div>
            <h3 className="font-medium text-blue-600 mb-2">Doctor:</h3>
            {transcription.transcription.doctor.map((text, index) => (
              <p key={index} className="text-gray-700 mb-2">{text}</p>
            ))}
          </div>
          <div>
            <h3 className="font-medium text-green-600 mb-2">Paciente:</h3>
            {transcription.transcription.patient.map((text, index) => (
              <p key={index} className="text-gray-700 mb-2">{text}</p>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (hasAudioFile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <DocumentTextIcon className="w-12 h-12 text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Audio Listo para Procesar</h2>
        <p className="text-gray-600">
          Haz click en el botón "Procesar Audio" para comenzar la transcripción
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <MicrophoneIcon className="w-12 h-12 text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Esperando Audio</h2>
      <p className="text-gray-600">
        Graba un nuevo audio o sube un archivo existente para comenzar
      </p>
      <p className="text-sm text-gray-500 mt-4">
        Formatos soportados: WAV, MP3, M4A
      </p>
    </div>
  );
} 