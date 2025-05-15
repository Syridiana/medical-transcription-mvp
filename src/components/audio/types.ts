export interface TranscriptionResponse {
  transcription: {
    doctor: string[];
    patient: string[];
  };
  summary: string;
} 