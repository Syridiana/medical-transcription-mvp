export interface TranscriptionResponse {
  transcription?: {
    doctor: string[];
    patient: string[];
  };
  summary?: string;
  url?: string;
  status?: 'uploaded' | 'processing' | 'completed' | 'error';
  message?: string;
  template?: string;
  raw_transcription?: string;
} 