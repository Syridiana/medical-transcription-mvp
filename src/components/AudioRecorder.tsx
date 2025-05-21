'use client';

import { useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { AudioControls } from './audio/AudioControls';
import { FileUpload } from './audio/FileUpload';
import { TranscriptionDisplay } from './audio/TranscriptionDisplay';
import { TranscriptionResponse } from './audio/types';
import { RecordingAnimation } from './audio/RecordingAnimation';
import { ProcessingAnimation } from './audio/ProcessingAnimation';
import { ConsentModal } from './ConsentModal';
import { MessageCircleMore, Pause, Play, Music, FileText, X } from 'lucide-react';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [bucketUrl, setBucketUrl] = useState<string>('');

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const { status, startRecording, stopRecording } = useReactMediaRecorder({
    audio: true,
    onStop: async (blobUrl, blob) => {
      console.log('🎤 Grabación detenida, procesando audio...');
      const timestamp = new Date().getTime();
      const audioFileName = `recording_${timestamp}.wav`;
      const file = new File([blob], audioFileName, { type: blob.type });
      
      console.log('📁 Archivo creado:', audioFileName);
      setAudioFile(file);
      setAudioName(audioFileName);

      // Subir el archivo inmediatamente
      await handleUpload(file);
    },
  });

  const handleUpload = async (file: File) => {
    console.log('📤 Subiendo archivo al bucket...', file.name, file.size, file.type);
    setIsLoading(true);
    setProcessingStep('upload');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', file);

      console.log('🔄 Enviando solicitud a /api/upload');
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Respuesta recibida:', uploadResponse.status, uploadResponse.statusText);
      
      if (!uploadResponse.ok) {
        let errorMessage = 'Error al subir el archivo';
        try {
          const errorData = await uploadResponse.json();
          errorMessage = `Error: ${errorData.error || uploadResponse.statusText}`;
        } catch {
          errorMessage = `Error (${uploadResponse.status}): ${uploadResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const uploadData = await uploadResponse.json();
      console.log('✅ Archivo subido exitosamente al bucket:', uploadData);
      
      if (!uploadData.url) {
        throw new Error('No se recibió la URL del archivo subido');
      }
      
      setBucketUrl(uploadData.url);
      
      // Iniciar proceso de anonimización automáticamente
      await handleAnonymize(uploadData.url);

    } catch (error) {
      console.error('❌ Error al subir el archivo:', error);
      setError(`Error al subir el archivo: ${(error as Error).message}`);
      setIsLoading(false);
      setAudioFile(null); // Limpiar el archivo en caso de error
    }
  };

  const handleAnonymize = async (audioUrl: string) => {
    console.log('🎭 Iniciando proceso de anonimización con URL:', audioUrl);
    setProcessingStep('anonymization');

    try {
      const response = await fetch('/api/anonymize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error en la anonimización: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('✨ Audio anonimizado:', data);

      if (data.anonymizedAudioUrl) {
        console.log('🎵 Descargando audio anonimizado:', data.anonymizedAudioUrl);
        const proxyUrl = `/api/audio?url=${encodeURIComponent(data.anonymizedAudioUrl)}`;
        const audioResponse = await fetch(proxyUrl);
        
        if (!audioResponse.ok) {
          throw new Error('No se pudo descargar el audio anonimizado');
        }

        const blob = await audioResponse.blob();
        const blobUrl = URL.createObjectURL(blob);
        console.log('✅ Audio anonimizado listo para reproducción');
        
        setupAudioElement(blobUrl);
        setAudioName('Audio Anonimizado');
      } else {
        throw new Error('No se recibió la URL del audio anonimizado');
      }

    } catch (error) {
      console.error('❌ Error en el proceso de anonimización:', error);
      setError(`Error: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
      setProcessingStep('');
    }
  };

  const handleProcess = async () => {
    if (!bucketUrl) {
      setError('No hay audio para procesar');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('transcription');

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioUrl: bucketUrl }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar el audio');
      }

      const data = await response.json();
      console.log('Respuesta completa de transcripción:', data);
      
      // Verificar si hay correcciones para informar al usuario
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        console.log(`Se encontraron ${data.errors.length} correcciones en la transcripción`);
        
        // Si hay correcciones con impacto médico, mostrar un aviso
        const medicalImpactErrors = data.errors.filter((err: {impacto_medico: boolean}) => err.impacto_medico);
        if (medicalImpactErrors.length > 0) {
          const message = `Se han realizado ${data.errors.length} correcciones (${medicalImpactErrors.length} con posible impacto médico). Revise la pestaña "Correcciones".`;
          setError(message);
          setTimeout(() => setError(null), 10000); // Limpiar el mensaje después de 10 segundos
        }
      } else {
        console.log('No se encontraron correcciones en la transcripción o el formato es incorrecto');
        
        // Asegurarse de que errors sea un array vacío si no existe o no es un array
        if (!data.errors || !Array.isArray(data.errors)) {
          data.errors = [];
        }
      }
      
      setTranscription(data);
    } catch (error) {
      console.error('Error al procesar:', error);
      setError(`Error al procesar: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const clearAudio = () => {
    console.log('🧹 Limpiando estado del audio');
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
    setBucketUrl('');
    setTranscription(null);
    setError(null);
  };

  const setupAudioElement = (blobUrl: string) => {
    console.log('🎵 Configurando nuevo elemento de audio:', blobUrl);
    if (audioElement) {
      console.log('🔄 Limpiando audio anterior');
      audioElement.pause();
      URL.revokeObjectURL(audioElement.src);
    }

    const audio = new Audio(blobUrl);
    
    setIsPlaying(false);
    setAudioProgress(0);
    
    audio.addEventListener('loadedmetadata', () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        console.log('📊 Metadatos cargados, duración:', audio.duration);
        setAudioDuration(audio.duration);
      }
    });

    audio.addEventListener('canplay', () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        console.log('🎵 Audio listo para reproducir, duración actualizada:', audio.duration);
        setAudioDuration(audio.duration);
      }
    });
    
    audio.addEventListener('timeupdate', () => {
      if (!isNaN(audio.currentTime) && isFinite(audio.currentTime)) {
        setAudioProgress(audio.currentTime);
      }
    });
    
    audio.addEventListener('ended', () => {
      console.log('🔚 Reproducción finalizada');
      setIsPlaying(false);
      setAudioProgress(0);
    });

    audio.addEventListener('pause', () => {
      console.log('⏸️ Audio pausado');
      setIsPlaying(false);
    });

    audio.addEventListener('play', () => {
      console.log('▶️ Audio reproduciendo');
      setIsPlaying(true);
    });
    
    setAudioElement(audio);
  };

  const handleStartRecording = () => {
    clearAudio();
    setShowConsentModal(true);
  };

  const handleConsent = () => {
    setShowConsentModal(false);
    startRecording();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📁 Nuevo archivo seleccionado:', file.name, file.size, file.type);
      
      // Validar el tipo y tamaño del archivo
      const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/webm'];
      if (!validTypes.includes(file.type) && !file.type.startsWith('audio/')) {
        setError('Tipo de archivo no soportado. Por favor, sube un archivo de audio (WAV, MP3, M4A).');
        event.target.value = '';
        return;
      }
      
      // Tamaño máximo: 10MB
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('El archivo es demasiado grande. El tamaño máximo es 10MB.');
        event.target.value = '';
        return;
      }
      
      // Limpiar completamente el estado actual
      clearAudio();
      setError(null);
      
      // Procesar el archivo inmediatamente
      setAudioFile(file);
      setAudioName(file.name);
      handleUpload(file);
      
      // Resetear el valor del input para permitir seleccionar el mismo archivo nuevamente
      if (event.target.value) {
        event.target.value = '';
      }
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

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/4">
        <div className="backdrop-blur-sm bg-white/50 rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 inline-block">
            Grabación de Audio
          </h2>
          
          <div className="space-y-6">
            <AudioControls
              status={status}
              isPlaying={isPlaying}
              hasAudio={false}
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

            <div className="border-t border-gray-200 pt-6">
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:w-3/4">
        <div className="backdrop-blur-sm bg-white/50 rounded-xl p-6 shadow-lg border border-gray-100 min-h-[65vh] flex flex-col justify-center">
          {status === 'recording' ? (
            <div className="flex items-center justify-center h-full">
              <RecordingAnimation />
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <ProcessingAnimation currentStep="anonymization" />
              {error && (
                <div className="absolute bottom-4 mx-auto max-w-md p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                  <p className="text-sm">{error}</p>
                  <button 
                    onClick={() => {
                      clearAudio();
                      setError(null);
                      setIsLoading(false);
                    }}
                    className="mt-2 px-3 py-1 bg-red-200 text-red-700 hover:bg-red-300 rounded-md text-xs font-medium transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                  <p className="text-sm">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="mt-2 px-3 py-1 bg-red-200 text-red-700 hover:bg-red-300 rounded-md text-xs font-medium transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              )}
              
              {!audioElement && !transcription && (
                <div className="flex flex-col items-center justify-center flex-1 space-y-6">
                  <div className="rounded-full bg-blue-100 p-4">
                    <MessageCircleMore className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      Bienvenido a la Transcripción Médica
                    </h3>
                    <p className="text-gray-600">
                      Graba una conversación o sube un archivo de audio para comenzar
                    </p>
                  </div>
                </div>
              )}

              {audioElement && !isProcessing && !transcription && (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100 p-8">
                    
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-teal-50 rounded-full">
                        <Music className="w-10 h-10 text-teal-500" />
                      </div>
                    </div>
                    
                    <div className="space-y-5 mb-8">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${isPlaying ? 'bg-teal-100' : 'bg-gray-100'}`}>
                          <Music className={`w-4 h-4 ${isPlaying ? 'text-teal-600' : 'text-gray-500'}`} />
                        </div>

                        <p className="text-sm font-medium text-gray-700 truncate">{audioName || 'Audio Anonimizado'}</p>

                        <button
                          onClick={clearAudio}
                          type="button"
                          className="p-1.5 rounded-full hover:bg-red-100 transition-colors group ml-auto"
                          aria-label="Eliminar audio"
                        >
                          <X className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                          {/* Fondo de la barra de progreso */}
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-gray-300/50"></div>

                          {/* Barra de progreso */}
                          <div
                            className="absolute h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300 ease-in-out"
                            style={{ width: `${audioDuration > 0 ? (audioProgress / audioDuration) * 100 : 0}%` }}
                          >
                            {/* Línea brillante superior */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
                          </div>
                        </div>

                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{formatTime(audioProgress)}</span>
                          <span>{formatTime(audioDuration)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center items-center gap-4">
                      <button
                        onClick={togglePlayback}
                        className={`button-hover-effect flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r ${isPlaying ? 'from-teal-600 to-cyan-700' : 'from-teal-500 to-cyan-600'} text-white rounded-full hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 cursor-pointer`}
                      >
                        <div className="bg-white/20 rounded-full p-1">
                          {isPlaying ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className="font-medium text-xs">
                          {isPlaying ? 'Pausar' : 'Reproducir'} 
                        </span>
                      </button>
                      
                      <button
                        onClick={handleProcess}
                        className="button-hover-effect flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-full hover:from-violet-600 hover:to-indigo-700 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50 cursor-pointer"
                      >
                        <div className="bg-white/20 rounded-full p-1">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium text-xs">Procesar</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!isProcessing && !transcription && audioElement && (
                <></>
              )}

              {isProcessing && (
                <div className="flex items-center justify-center h-full">
                  <ProcessingAnimation currentStep={processingStep} />
                </div>
              )}

              {transcription && (
                <TranscriptionDisplay
                  isLoading={isLoading}
                  error={error}
                  transcription={transcription}
                  hasAudioFile={!!audioFile}
                />
              )}
            </div>
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