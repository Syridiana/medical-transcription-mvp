'use client';

import { FileText } from 'lucide-react';

interface SummaryProps {
  summary: string;
}

export function Summary({ summary }: SummaryProps) {
  return (
    <div className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
        <span className="flex-shrink-0 h-6 w-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow">
          <FileText className="h-3.5 w-3.5 text-white" />
        </span>
        Resumen Clínico
      </h3>
      <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/70 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
      </div>
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic">
        <p>Este resumen es generado automáticamente para asistencia clínica</p>
      </div>
    </div>
  );
} 