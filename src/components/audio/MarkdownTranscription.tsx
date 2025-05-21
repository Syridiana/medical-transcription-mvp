'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownTranscriptionProps {
  content: string;
}

export function MarkdownTranscription({ content }: MarkdownTranscriptionProps) {
  // Renderizar línea por línea para preservar los saltos de línea
  const renderContent = () => {
    return content.split('\n').map((line, i) => (
      <div key={i} className={line.trim() ? "mb-3" : "mb-1"}>
        {line.trim() ? (
          <ReactMarkdown>{line}</ReactMarkdown>
        ) : (
          <br />
        )}
      </div>
    ));
  };

  return (
    <div className="prose prose-sm max-w-none">
      <div className="space-y-1">
        {renderContent()}
      </div>
    </div>
  );
} 