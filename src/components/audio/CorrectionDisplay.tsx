'use client';

import { TranscriptionError } from './types';

interface CorrectionDisplayProps {
  errors?: TranscriptionError[];
}

export function CorrectionDisplay({ errors }: CorrectionDisplayProps) {
  // Logs para depuración
  console.log('CorrectionDisplay recibió errores:', errors);
  
  if (!errors || errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">No se detectaron correcciones</h3>
        <p className="text-gray-500 mt-2">La transcripción no requirió ajustes significativos</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Correcciones realizadas</h3>
        <p className="text-gray-500 text-sm">El sistema ha realizado las siguientes correcciones a la transcripción original:</p>
      </div>
      
      <div className="space-y-4">
        {errors.map((error, index) => (
          <div 
            key={index} 
            className={`border rounded-lg p-4 ${error.impacto_medico ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}
          >
            <div className="flex items-start mb-3">
              <div className={`p-1 rounded-full mr-2 ${error.impacto_medico ? 'bg-red-100' : 'bg-amber-100'}`}>
                {error.impacto_medico ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="font-medium text-sm">
                {error.impacto_medico ? 
                  'Error con impacto médico potencial' : 
                  'Corrección general sin impacto médico'}
              </div>
            </div>
            
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">Texto original (línea {error.linea}):</div>
              <div className="bg-white p-2 rounded border border-gray-200 text-sm text-red-600 line-through">
                {error.original}
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">Texto corregido:</div>
              <div className="bg-white p-2 rounded border border-gray-200 text-sm text-green-600 font-medium">
                {error.corregido}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 