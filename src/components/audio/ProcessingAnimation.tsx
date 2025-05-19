'use client';

import { Brain, Cpu, Bot, Upload } from 'lucide-react';

interface ProcessingAnimationProps {
  currentStep?: string;
}

export function ProcessingAnimation({ currentStep = 'processing' }: ProcessingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-8 relative">
        <div className="absolute -inset-4 bg-violet-400/30 animate-pulse-fast rounded-full opacity-75"></div>
        <div className="absolute -inset-8 bg-violet-400/20 animate-pulse rounded-full opacity-60"></div>
        <div className="absolute -inset-12 bg-violet-400/10 animate-pulse-slow rounded-full opacity-40"></div>
        <div className="absolute -inset-16 bg-indigo-400/5 animate-pulse-slower rounded-full opacity-30"></div>
        
        {/* Robot con animación de pulso */}
        <div className="relative animate-robot-pulse bg-gradient-to-br from-violet-500 to-indigo-600 p-5 rounded-full shadow-lg">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-violet-300 opacity-0 animate-glow"></div>
          <Bot className="w-12 h-12 text-white relative z-10" />
        </div>
      </div>
      
      <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 mb-4 text-center animate-pulse-slow">
        {currentStep === 'upload' 
          ? 'Subiendo Audio' 
          : currentStep === 'transcription' 
            ? 'Procesando Transcripción'
            : 'Procesando Consulta'
        }
      </h2>
      
      <div className="flex justify-center items-center space-x-6 mb-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-violet-400/10 rounded-lg animate-pulse"></div>
          <div className="relative bg-white dark:bg-gray-800 p-2 rounded-lg">
            {currentStep === 'upload' 
              ? <Upload className="w-6 h-6 text-green-500" />
              : <Brain className="w-6 h-6 text-violet-500" />
            }
          </div>
          <div className="absolute -right-4 w-4 h-0.5 bg-violet-400/50"></div>
        </div>
        
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-400/10 rounded-lg animate-pulse delay-300"></div>
          <div className="relative bg-white dark:bg-gray-800 p-2 rounded-lg">
            <Cpu className="w-6 h-6 text-indigo-500" />
          </div>
          <div className="absolute -right-4 w-4 h-0.5 bg-indigo-400/50"></div>
        </div>
        
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-400/10 rounded-lg animate-pulse delay-700"></div>
          <div className="relative bg-white dark:bg-gray-800 p-2 rounded-lg">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-6 h-6 text-blue-500"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M8 12h8" />
              <path d="M12 8v8" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="mt-2 space-y-2">
        <div className={`flex gap-2 items-center text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full shadow-sm ${currentStep === 'upload' ? 'opacity-100' : 'opacity-50'}`}>
          <div className={`w-2 h-2 ${currentStep === 'upload' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'} rounded-full`}></div>
          <p className="text-sm">Subiendo audio</p>
        </div>
        <div className={`flex gap-2 items-center text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full shadow-sm ${currentStep === 'transcription' ? 'opacity-100' : 'opacity-50'}`}>
          <div className={`w-2 h-2 ${currentStep === 'transcription' ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'} rounded-full`}></div>
          <p className="text-sm">Transcribiendo audio</p>
        </div>
        <div className={`flex gap-2 items-center text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full shadow-sm ${currentStep === 'template' ? 'opacity-100' : 'opacity-50'}`}>
          <div className={`w-2 h-2 ${currentStep === 'template' ? 'bg-violet-500 animate-pulse' : 'bg-gray-400'} rounded-full`}></div>
          <p className="text-sm">Generando resumen clínico</p>
        </div>
      </div>
    </div>
  );
} 