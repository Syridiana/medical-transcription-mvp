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
import { ConsentModal } from './ConsentModal';

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
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showAnonymizeStep, setShowAnonymizeStep] = useState(false);
  const [isAnonymizing, setIsAnonymizing] = useState(false);

  const { status, startRecording, stopRecording } = useReactMediaRecorder({
    audio: true,
    onStop: async (blobUrl, blob) => {
      const timestamp = new Date().getTime();
      const audioFileName = `recording_${timestamp}.wav`;
      const file = new File([blob], audioFileName, { type: blob.type });
      
      // Crear un nuevo elemento de audio temporal para obtener la duración
      const tempAudio = new Audio(blobUrl);
      
      // Esperar a que se carguen los metadatos
      await new Promise((resolve) => {
        tempAudio.addEventListener('loadedmetadata', resolve, { once: true });
        tempAudio.addEventListener('canplay', resolve, { once: true });
      });
      
      // Asegurarnos de tener la duración antes de configurar el audio principal
      if (!isNaN(tempAudio.duration) && isFinite(tempAudio.duration)) {
        setAudioDuration(tempAudio.duration);
      }
      
      setAudioFile(file);
      setAudioName(audioFileName);
      setupAudioElement(blobUrl);
    },
  });

  const clearAudio = () => {
    if (audioElement) {
      audioElement.pause();
      URL.revokeObjectURL(audioElement.src);
    }
    setAudioFile(null);
    setAudioElement(null);
    setAudioProgress(0);
    setAudioDuration(0);
    setAudioName('');
    setIsPlaying(false);
  };

  const setupAudioElement = (blobUrl: string) => {
    // Limpiar el audio anterior si existe
    if (audioElement) {
      audioElement.pause();
      URL.revokeObjectURL(audioElement.src);
    }

    const audio = new Audio(blobUrl);
    
    // Resetear todos los estados
    setIsPlaying(false);
    setAudioProgress(0);
    
    // Manejar la carga de metadatos
    audio.addEventListener('loadedmetadata', () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    });

    // También intentar obtener la duración cuando esté listo para reproducir
    audio.addEventListener('canplay', () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    });
    
    // Actualizar el progreso
    audio.addEventListener('timeupdate', () => {
      if (!isNaN(audio.currentTime) && isFinite(audio.currentTime)) {
        setAudioProgress(audio.currentTime);
        // También verificar la duración aquí por si acaso
        if (audioDuration === 0 && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setAudioDuration(audio.duration);
        }
      }
    });
    
    // Manejar el fin de la reproducción
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setAudioProgress(0);
    });

    // Manejar pausas
    audio.addEventListener('pause', () => {
      setIsPlaying(false);
    });

    // Manejar play
    audio.addEventListener('play', () => {
      setIsPlaying(true);
      // Verificar la duración al comenzar la reproducción
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    });
    
    setAudioElement(audio);
  };

  const handleStartRecording = () => {
    clearAudio();
    setTranscription(null);
    setShowConsentModal(true);
  };

  const handleConsent = () => {
    setShowConsentModal(false);
    startRecording();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      clearAudio();
      setAudioFile(file);
      setAudioName(file.name);
      const blobUrl = URL.createObjectURL(file);
      setupAudioElement(blobUrl);
      setTranscription(null);
    }
  };

  const togglePlayback = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch((error) => {
        console.error('Error al reproducir el audio:', error);
        setIsPlaying(false);
      });
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
      const formData = new FormData();
      formData.append('audio', audioFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(`Error al subir el archivo: ${errorData.error || uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();
      const audioUrl = uploadData.url;
      
      console.log(`Archivo subido exitosamente: ${audioUrl}`);
      
      setTranscription({
        status: 'uploaded',
        transcription: {
          doctor: [],
          patient: []
        },
        summary: "",
        message: 'Archivo subido exitosamente',
      });
      
      setProcessingStep('transcription');
      console.log('Iniciando transcripción...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioUrl: audioUrl }),
      });
      
      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json();
        throw new Error(`Error en la transcripción: ${errorData.error || transcribeResponse.statusText}`);
      }
      
      setProcessingStep('template');
      console.log('Generando resumen clínico...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const transcriptionData = await transcribeResponse.json();
      console.log('Procesamiento completo:', transcriptionData);
      
      setTranscription({
        ...transcriptionData,
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

  const handleInitialProcessing = async () => {
    setIsLoading(true);
    // Simular procesamiento inicial
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setShowAnonymizeStep(true);
  };

  const handleAnonymize = async () => {
    setIsAnonymizing(true);
    // Simular procesamiento de anonimización
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsAnonymizing(false);
    setShowAnonymizeStep(false);
    // Ejecutar el proceso real
    handleSubmit();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/4">
        <div className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 inline-block">
            Grabación de Audio
          </h2>
          
          <div className="space-y-6">
            <AudioControls
              status={status}
              isPlaying={isPlaying}
              hasAudio={!!audioElement}
              onStartRecording={handleStartRecording}
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
                onDelete={clearAudio}
              />
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <FileUpload onFileUpload={handleFileUpload} />
            </div>

            {audioFile && !showAnonymizeStep && !isLoading && !transcription && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={handleInitialProcessing}
                  className="button-hover-effect flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:from-green-600 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-sm cursor-pointer"
                >
                  <span className="font-medium">Procesar Audio</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:w-3/4">
        <div className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 sticky top-4 h-full flex flex-col justify-center">
          {status === 'recording' ? (
            <RecordingAnimation />
          ) : isLoading ? (
            <ProcessingAnimation currentStep={processingStep} />
          ) : showAnonymizeStep ? (
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="text-center space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 p-3">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-8 w-8 text-violet-600 dark:text-violet-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                    Anonimización de Audio
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 max-w-md">
                  Antes de continuar con la transcripción, nuestro modelo se encargará de anonimizar cualquier información sensible o personal que pueda contener el audio.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleAnonymize}
                  disabled={isAnonymizing}
                  className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md group disabled:opacity-50"
                >
                  {isAnonymizing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="font-medium">Anonimizando...</span>
                    </>
                  ) : (
                    <>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 transition-transform group-hover:scale-110" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Anonimizar Audio</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                Este paso es necesario para proteger la privacidad de los pacientes
              </p>
            </div>
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

      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onConsent={handleConsent}
      />
    </div>
  );
} 