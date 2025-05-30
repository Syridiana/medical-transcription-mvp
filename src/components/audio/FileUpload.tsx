'use client';

import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        O sube un archivo de audio
      </label>
      <div className="flex items-center justify-center w-full">
        <label className="group flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50/50 dark:bg-gray-800/20 hover:bg-gray-100/80 dark:hover:bg-gray-800/30 border-gray-300 dark:border-gray-700 transition-all duration-300 hover:border-violet-400 dark:hover:border-violet-500 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
            <div className="p-3 rounded-full bg-violet-100 dark:bg-violet-900/20 mb-4 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-violet-600 dark:text-violet-400">Click para subir</span> o arrastra y suelta
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              WAV, MP3, M4A (máx. 10MB)
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="audio/*"
            onChange={onFileUpload}
          />
        </label>
      </div>
    </div>
  );
} 