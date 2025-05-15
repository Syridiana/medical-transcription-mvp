'use client';

interface SummaryProps {
  summary: string;
}

export function Summary({ summary }: SummaryProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Resumen de la Consulta</h2>
      <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
    </div>
  );
} 