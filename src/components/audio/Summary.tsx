'use client';

import { FileText } from 'lucide-react';

interface SummaryProps {
  summary: string;
}

export function Summary({ summary }: SummaryProps) {
  return (
    <div className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
          <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 inline-block">
          Resumen de la Consulta
        </h2>
      </div>
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 p-4 rounded-xl">
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{summary}</p>
      </div>
    </div>
  );
} 