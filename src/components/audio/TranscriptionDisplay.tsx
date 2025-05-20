'use client';

import { useState } from 'react';
import { TranscriptionResponse } from './types';
import { Summary } from './Summary';

type TranscriptionDisplayProps = {
  isLoading: boolean;
  error: string | null;
  transcription: TranscriptionResponse | null;
  hasAudioFile: boolean;
};

type TabType = 'transcription' | 'summary';

export function TranscriptionDisplay({  error, transcription, hasAudioFile }: TranscriptionDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabType>('transcription');

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-red-500 font-medium">{error}</p>
        <p className="text-sm text-gray-500 mt-2">Por favor, intenta nuevamente</p>
      </div>
    );
  }

  if (!hasAudioFile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Bienvenido a la Transcripción Médica</h3>
        <p className="text-gray-500 mt-2">Graba una conversación o sube un archivo de audio para comenzar</p>
      </div>
    );
  }

  if (!transcription) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Audio Listo</h3>
        <p className="text-gray-500 mt-2">Presiona &ldquo;Procesar Audio&rdquo; para generar la transcripción</p>
      </div>
    );
  }

  // Verificar si la transcripción está vacía
  const hasTranscriptionContent = !!(
    (transcription.transcription?.doctor && transcription.transcription.doctor.length > 0) || 
    (transcription.transcription?.patient && transcription.transcription.patient.length > 0) || 
    (transcription.summary && transcription.summary.length > 0) ||
    (transcription.raw_transcription && transcription.raw_transcription.length > 0)
  );

  if (!hasTranscriptionContent) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Sin Resultados</h3>
        <p className="text-gray-500 mt-2">No se pudo generar una transcripción para este audio</p>
        <p className="text-xs text-gray-400 mt-4">El servicio de transcripción está en proceso de integración</p>
      </div>
    );
  }

  // Sistema de pestañas para la transcripción
  return (
    <div className='h-[calc(100vh-22rem)] max-h-[800px] flex flex-col border border-gray-200 rounded-lg overflow-hidden'>
      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => setActiveTab('transcription')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-all duration-200 focus:outline-none cursor-pointer
          ${activeTab === 'transcription' 
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
            : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Transcripción
        </button>
        
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-all duration-200 focus:outline-none cursor-pointer
          ${activeTab === 'summary' 
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' 
            : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Resumen Médico
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'transcription' && transcription.transcription?.doctor && transcription.transcription?.patient ? (
        <div className="flex-grow overflow-y-auto scrollbar-custom animate-fade-in-up pt-4 pb-2 px-4">
          <div className="space-y-6">
            {transcription.transcription.doctor.map((doctorText, index) => {
              const patientText = transcription.transcription?.patient?.[index] || '';
              
              return (
                <div key={index} className="space-y-4 pb-4 border-b border-gray-100 last:border-b-0">
                  {/* Número de intercambio */}
                  <div className="flex justify-center">
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                      Intercambio {index + 1}
                    </span>
                  </div>
                  
                  {/* Turno del médico - solo mostrar si hay contenido */}
                  {doctorText && (
                    <div className="flex space-x-4 transition-all duration-300 transform hover:translate-x-1">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-2xl rounded-tl-none shadow-sm border border-blue-100">
                          <div className="font-semibold text-blue-700 mb-1 text-sm">Doctor</div>
                          <p className="text-gray-800 text-sm">{doctorText}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Turno del paciente - solo mostrar si hay contenido */}
                  {patientText && (
                    <div className="flex space-x-4 justify-end transition-all duration-300 transform hover:translate-x-[-0.25rem]">
                      <div className="flex-1">
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-3 rounded-2xl rounded-tr-none shadow-sm border border-purple-100">
                          <div className="font-semibold text-purple-700 mb-1 text-sm">Paciente</div>
                          <p className="text-gray-800 text-sm">{patientText}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto scrollbar-custom animate-fade-in-up pt-4">
          <Summary summary={transcription.summary || ''} />
        </div>
      )}
    </div>
  );
} 