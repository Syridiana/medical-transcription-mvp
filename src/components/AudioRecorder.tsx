'use client';

import { useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { AudioControls } from './audio/AudioControls';
import { FileUpload } from './audio/FileUpload';
import { TranscriptionDisplay } from './audio/TranscriptionDisplay';
import { Summary } from './audio/Summary';
import { TranscriptionResponse } from './audio/types';

export default function AudioRecorder() {
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionResponse | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl, blob) => {
      const file = new File([blob], 'recording.wav', { type: blob.type });
      setAudioFile(file);
      const audio = new Audio(blobUrl);
      audio.addEventListener('ended', () => setIsPlaying(false));
      setAudioElement(audio);
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const blobUrl = URL.createObjectURL(file);
      const audio = new Audio(blobUrl);
      audio.addEventListener('ended', () => setIsPlaying(false));
      setAudioElement(audio);
    }
  };

  const togglePlayback = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSubmit = async () => {
    if (!audioFile) return;

    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error en el procesamiento del audio');

      const data = await response.json();
      setTranscription(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Hubo un error al procesar el audio. Por favor, intenta nuevamente.');
      setTranscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Columna izquierda: Controles de audio */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Grabación de Audio</h2>
          
          <div className="space-y-4">
            <AudioControls
              status={status}
              isPlaying={isPlaying}
              hasAudio={!!audioElement}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onTogglePlayback={togglePlayback}
            />

            <FileUpload onFileUpload={handleFileUpload} />

            {audioFile && (
              <div className="flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  {isLoading ? 'Procesando...' : 'Procesar Audio'}
                </button>
              </div>
            )}
          </div>
        </div>

        {transcription && <Summary summary={transcription.summary} />}
      </div>

      {/* Columna derecha: Estados y Transcripción */}
      <div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-4">
          <TranscriptionDisplay
            isLoading={isLoading}
            error={error}
            transcription={transcription}
            hasAudioFile={!!audioFile}
          />
        </div>
      </div>
    </div>
  );
} 