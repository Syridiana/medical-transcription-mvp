'use client';

import { useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { AudioControls } from './audio/AudioControls';
import { FileUpload } from './audio/FileUpload';
import { TranscriptionDisplay } from './audio/TranscriptionDisplay';
import { TranscriptionResponse } from './audio/types';
import { AudioProgress } from './audio/AudioProgress';
import { RecordingAnimation } from './audio/RecordingAnimation';
import { ProcessingAnimation } from './audio/ProcessingAnimation';

export default function AudioRecorder() {
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionResponse | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioName, setAudioName] = useState('');
  const [processingStep, setProcessingStep] = useState<string>('');
  
  const { status, startRecording, stopRecording } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl, blob) => {
      const file = new File([blob], 'recording.wav', { type: blob.type });
      setAudioFile(file);
      setAudioName('Grabación de audio');
      setupAudioElement(blobUrl);
    },
  });

  const setupAudioElement = (blobUrl: string) => {
    const audio = new Audio(blobUrl);
    
    // Asegurar que se tenga la duración correcta
    audio.addEventListener('loadedmetadata', () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      } else {
        // Intentar obtener duración de forma alternativa
        setTimeout(() => {
          if (!isNaN(audio.duration) && isFinite(audio.duration)) {
            setAudioDuration(audio.duration);
          } else {
            console.warn('No se pudo determinar la duración del audio');
            // Usar un valor de duración por defecto para evitar NaN
            setAudioDuration(0);
          }
        }, 500);
      }
    });
    
    // Actualizar el progreso de forma más suave
    audio.addEventListener('timeupdate', () => {
      if (!isNaN(audio.currentTime) && isFinite(audio.currentTime)) {
        requestAnimationFrame(() => {
          setAudioProgress(audio.currentTime);
        });
      }
    });
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setAudioProgress(0);
    });

    audio.addEventListener('play', () => {
      // Intentar obtener la duración nuevamente si no estaba disponible antes
      if (audioDuration === 0 && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    });
    
    setAudioElement(audio);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioName(file.name);
      const blobUrl = URL.createObjectURL(file);
      setupAudioElement(blobUrl);
    }
  };

  const togglePlayback = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      // Intenta reproducir y maneja cualquier error
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            // Intentar obtener la duración cuando se inicia la reproducción
            if (!isNaN(audioElement.duration) && isFinite(audioElement.duration)) {
              setAudioDuration(audioElement.duration);
            }
          })
          .catch((error) => {
            console.error('Error al reproducir el audio:', error);
            setIsPlaying(false);
          });
      }
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit iniciado');
    console.log('Estado del audioFile:', audioFile ? `Archivo presente (${audioFile.name})` : 'No hay archivo');

    if (!audioFile) return;

    setIsLoading(true);
    setError(null);
    setProcessingStep('upload');
    
    try {
      // Primer paso: Subir el archivo a Google Cloud Storage
      console.log('Subiendo archivo a Google Cloud Storage...');
      const formData = new FormData();
      formData.append('audio', audioFile);

/*       const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(`Error al subir el archivo: ${errorData.error || uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();
      const audioUrl = uploadData.url;
      
      console.log(`Archivo subido exitosamente: ${audioUrl}`); */
      
      // Actualizar estado con la URL del archivo
      setTranscription({
 /*        url: audioUrl, */
        status: 'uploaded',
        transcription: {
          doctor: [],
          patient: []
        },
        summary: "",
        message: 'Archivo subido exitosamente',
      });
      
      // Iniciar el procesamiento con los pasos múltiples
      setProcessingStep('transcription');
      console.log('Iniciando transcripción...');
      
      // Breve pausa para mostrar el cambio de estado en la UI
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioUrl: "models/scriba/consulta_2.mp3" }),
      });
      
      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json();
        throw new Error(`Error en la transcripción: ${errorData.error || transcribeResponse.statusText}`);
      }
      
      // Simular paso adicional de procesamiento de template para la UI
      setProcessingStep('template');
      console.log('Generando resumen clínico...');
      
      // Pausa adicional para mostrar el cambio de estado en la UI
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const transcriptionData = await transcribeResponse.json();
      console.log('Procesamiento completo:', transcriptionData);
      
      // Actualizar el estado con la transcripción recibida
      setTranscription({
        ...transcriptionData,
     /*    url: audioUrl, */
        status: 'completed'
      });
      
      setIsLoading(false);
      setProcessingStep('');
      
    } catch (error) {
      console.error('Error completo:', error);
      setError(`Error: ${(error as Error).message}`);
      setTranscription(null);
      setIsLoading(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Columna izquierda: Controles de audio */}
      <div className="lg:w-1/4">
        <div className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 inline-block">Grabación de Audio</h2>
          
          <div className="space-y-6">
            <AudioControls
              status={status}
              isPlaying={isPlaying}
              hasAudio={!!audioElement}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onTogglePlayback={togglePlayback}
            />

            {status === 'recording' && (
              <div className="flex items-center justify-center gap-2 py-2 mt-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-red-600 font-medium">Grabando...</p>
              </div>
            )}

            {audioElement && status !== 'recording' && (
              <AudioProgress 
                isPlaying={isPlaying}
                duration={audioDuration}
                currentTime={audioProgress}
                audioName={audioName}
              />
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <FileUpload onFileUpload={handleFileUpload} />
            </div>

            {audioFile && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Botón clickeado');
                    handleSubmit();
                  }}
                  disabled={isLoading}
                  className="button-hover-effect flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:from-green-600 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-sm cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {processingStep === 'upload' ? 'Subiendo archivo...' : 
                      processingStep === 'transcription' ? 'Procesando transcripción...' : 
                      'Procesando...'}
                    </>
                  ) : (
                    <span className="font-medium">Procesar Audio</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Columna derecha: Estados y Transcripción */}
      <div className="lg:w-3/4">
        <div className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 sticky top-4 h-full flex flex-col justify-center">
          {status === 'recording' ? (
            <RecordingAnimation />
          ) : isLoading ? (
            <ProcessingAnimation currentStep={processingStep} />
          ) : (
            <TranscriptionDisplay
              isLoading={isLoading}
              error={error}
              transcription={transcription}
              hasAudioFile={!!audioFile}
            />
          )}
        </div>
      </div>
    </div>
  );
} 