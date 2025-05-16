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

// Mock data for testing
const mockTranscription: TranscriptionResponse = {
  transcription: {
    doctor: [
      "Buenos días, ¿cómo se encuentra hoy?",
      "Cuénteme un poco más sobre ese dolor de cabeza. ¿Cuándo comenzó?",
      "¿Ha tomado algún medicamento para aliviarlo?",
      "Vamos a revisarlo. ¿Ha tenido fiebre o algún otro síntoma asociado?",
      "Bien, basado en sus síntomas, parece ser una migraña tensional. Le voy a recetar un analgésico y le recomendaría descansar y mantenerse hidratado.",
      "También sería bueno que limitara el tiempo frente a pantallas por unos días y que intentara técnicas de relajación.",
      "¿Tiene alguna otra pregunta o preocupación que quiera comentarme?"
    ],
    patient: [
      "Buen día doctor, no muy bien. He tenido un dolor de cabeza bastante fuerte desde ayer.",
      "Comenzó ayer por la tarde, después del trabajo. Es como una presión en toda la cabeza, especialmente en la parte frontal.",
      "Tomé un ibuprofeno anoche, pero solo me alivió temporalmente. Esta mañana el dolor volvió.",
      "No he tenido fiebre, pero sí algo de rigidez en el cuello y me siento más cansado de lo normal. También he estado trabajando muchas horas frente a la computadora esta semana.",
      "Entiendo doctor. ¿Cree que podría ser algo más grave?",
      "Lo haré, doctor. ¿Debería volver si el dolor persiste más de algunos días?",
      "No, creo que eso es todo. Gracias por su tiempo y recomendaciones."
    ]
  },
  summary: "El paciente consulta por cefalea de inicio reciente (24 horas), de tipo tensional, sin fiebre, asociada a rigidez cervical y fatiga. Refiere uso prolongado de pantallas y respuesta parcial a ibuprofeno. Se diagnostica migraña tensional, se indica analgesia, reposo, hidratación, reducción de exposición a pantallas y técnicas de relajación. Se recomienda seguimiento si persisten los síntomas."
};

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
  const [showMockData, setShowMockData] = useState(false);

  // Usar la transcripción real o la simulada si showMockData está activo
  const displayTranscription = transcription || (showMockData ? mockTranscription : null);

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
    if (!audioFile) return;

    setIsLoading(true);
    setError(null);
    try {
      // Para desarrollo/demostración
      setShowMockData(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      
      // Comentado para desarrollo/demostración
      /*
      const formData = new FormData();
      formData.append('audio', audioFile);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error en el procesamiento del audio');

      const data = await response.json();
      setTranscription(data);
      setIsLoading(false);
      */
    } catch (error) {
      console.error('Error:', error);
      setError('Hubo un error al procesar el audio. Por favor, intenta nuevamente.');
      setTranscription(null);
      setIsLoading(false);
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
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="button-hover-effect flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:from-green-600 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-sm cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
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
            <ProcessingAnimation />
          ) : (
            <TranscriptionDisplay
              isLoading={isLoading}
              error={error}
              transcription={displayTranscription}
              hasAudioFile={!!audioFile}
            />
          )}
        </div>
      </div>
    </div>
  );
} 