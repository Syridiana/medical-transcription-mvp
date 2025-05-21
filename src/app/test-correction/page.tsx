'use client';

import { useState, useEffect } from 'react';
import { TranscriptionResponse } from '@/components/audio/types';
import { TranscriptionDisplay } from '@/components/audio/TranscriptionDisplay';

export default function TestCorrectionPage() {
  const [transcription, setTranscription] = useState<TranscriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/test-correction');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Datos recibidos del endpoint de prueba:', data);
      
      setTranscription(data);
      
    } catch (err) {
      console.error('Error fetching test data:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Prueba de Correcciones de Transcripción</h1>
        <p className="text-gray-600">Esta página prueba la visualización de correcciones de transcripción</p>
        
        <div className="mt-4">
          <button 
            onClick={fetchTestData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Recargar Datos de Prueba
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <TranscriptionDisplay 
            isLoading={isLoading}
            error={error}
            transcription={transcription}
            hasAudioFile={true}
          />
        </div>
      )}
    </div>
  );
} 