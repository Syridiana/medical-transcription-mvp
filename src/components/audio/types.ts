export interface TranscriptionResponse {
  transcription?: {
    doctor: string[];
    patient: string[];
    full_transcription?: string;
  };
  summary?: string;
  url?: string;
  status?: 'uploaded' | 'processing' | 'completed' | 'error';
  message?: string;
  template?: string;
  raw_transcription?: string;
  errors?: TranscriptionError[];
}

export interface TranscriptionError {
  linea: number;
  original: string;
  corregido: string;
  impacto_medico: boolean;
} 