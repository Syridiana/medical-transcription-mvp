'use client';

import { FileText } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SummaryProps {
  summary: string;
}

export function Summary({ summary }: SummaryProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && summary) {
      // Process Markdown-like content to HTML
      const formattedContent = summary
        .replace(/## (.*?)\n/g, '<h2 class="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mt-4 mb-2">$1</h2>')
        .replace(/### (.*?)\n/g, '<h3 class="text-md font-medium text-emerald-600 dark:text-emerald-400 mt-3 mb-1">$1</h3>')
        .replace(/> (.*?)\n/g, '<blockquote class="border-l-4 border-emerald-300 dark:border-emerald-700 pl-3 py-1 text-gray-600 dark:text-gray-300 italic my-2">$1</blockquote>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-medium text-gray-800 dark:text-gray-200">$1</strong>')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>');

      contentRef.current.innerHTML = formattedContent;
    }
  }, [summary]);

  return (
    <div className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
        <span className="flex-shrink-0 h-6 w-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow">
          <FileText className="h-3.5 w-3.5 text-white" />
        </span>
        Resumen Clínico
      </h3>
      <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/70 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
        {summary ? (
          <div 
            ref={contentRef}
            className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No hay resumen disponible para esta transcripción.
          </p>
        )}
      </div>
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic">
        <p>Este resumen es generado automáticamente para asistencia clínica</p>
      </div>
    </div>
  );
} 