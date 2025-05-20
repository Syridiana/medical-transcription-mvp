'use client'

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Importamos AudioRecorder de forma dinámica con ssr: false
const AudioRecorder = dynamic(
  () => import('@/components/AudioRecorder'),
  { ssr: false } // Esto garantiza que solo se cargue en el cliente
);

// Componente de carga mientras se importa AudioRecorder
const AudioRecorderLoading = () => (
  <div className="flex items-center justify-center py-16">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
  </div>
);

export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl blur-xl opacity-50"></div>
              <div className="relative px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-white">
                <h1 className="text-5xl font-bold tracking-tight inline-flex items-center">
                  <div className="relative h-10 w-10 mr-1">
                    <Image 
                      src="/scribe-logo.svg" 
                      alt="Scriba Logo" 
                      fill
                      className="brightness-0 invert"
                      priority
                    />
                  </div>
                  Scriba
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                    Beta
                  </span>
                </h1>
              </div>
            </div>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-500 backdrop-blur-sm">
              by
            </span>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-md flex items-center">
              <div className="relative h-12 w-32">
                <Image 
                  src="/Uma-logo.png" 
                  alt="UMA Logo" 
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            </div>
          </div>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Sistema de transcripción automática para consultas médicas con IA
          </p>
        </div>
        
        <div className="relative bg-card rounded-2xl shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5"></div>
          <div className="relative p-4 sm:p-6">
            <Suspense fallback={<AudioRecorderLoading />}>
              <AudioRecorder />
            </Suspense>
          </div>
        </div>
        
        <footer className="mt-12 flex flex-col items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white/70 dark:bg-slate-800/70 shadow-sm mb-4">
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="relative h-5 w-5">
                  <Image 
                    src="/scribe-logo.svg" 
                    alt="Scriba Logo" 
                    fill
                    className="brightness-0"
                    priority
                  />
                </div>
                <span className="font-medium">Scriba</span>
                <span>by</span>
                <div className="relative h-6 w-16">
                  <Image 
                    src="/Uma-logo.png" 
                    alt="UMA Logo" 
                    fill
                    style={{ objectFit: 'contain' }}
                    priority
                  />
                </div>
              </div>
              <p className="text-xs opacity-80">Transcripción médica impulsada por IA</p>
            </div>
          </div>
          <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
        </footer>
      </div>
    </main>
  );
}
