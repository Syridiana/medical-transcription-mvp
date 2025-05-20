'use client';

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
        // Eliminar símbolos markdown y convertirlos apropiadamente a HTML
        .replace(/^# (.*?)$/gm, '<h1 class="text-xl font-semibold text-emerald-700 mt-5 mb-3">$1</h1>')
        .replace(/^## (.*?)$/gm, '<h2 class="text-lg font-semibold text-emerald-700 mt-4 mb-2">$1</h2>')
        .replace(/^### (.*?)$/gm, '<h3 class="text-md font-medium text-emerald-600 mt-3 mb-1">$1</h3>')
        .replace(/^- (.*?)$/gm, '<div class="flex items-start mb-1 ml-2"><span class="mr-2 text-emerald-500 mt-1">•</span><span>$1</span></div>')
        .replace(/^(\d+)\. (.*?)$/gm, '<div class="flex items-start mb-1 ml-2"><span class="mr-2 text-emerald-500 font-medium">$1.</span><span>$2</span></div>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-medium text-gray-800">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
        .replace(/^---+$/gm, '<hr class="my-3 border-t border-emerald-100" />')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>');

      contentRef.current.innerHTML = formattedContent;
    }
  }, [summary]);

  return (
    <div className="h-full overflow-y-auto scrollbar-custom p-5">
      <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/70 p-4 rounded-lg border border-emerald-100">
        {summary ? (
          <div 
            ref={contentRef}
            className="text-sm text-gray-700 leading-relaxed"
          />
        ) : (
          <p className="text-sm text-gray-500 italic">
            No hay resumen disponible para esta transcripción.
          </p>
        )}
      </div>
      <div className="mt-4 text-xs text-gray-500 italic">
        <p>Este resumen es generado automáticamente para asistencia clínica</p>
      </div>
    </div>
  );
} 