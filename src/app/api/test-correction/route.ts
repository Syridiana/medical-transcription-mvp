import { NextResponse } from 'next/server';
import { TranscriptionResponse } from '@/components/audio/types';

export async function GET() {
  try {
    // Transcripción de prueba
    const sampleTranscription = "**Doctor:** Hola, ¿qué le sucede?\n**Paciente:** Empecé a tomar la medicina ayer.";
    
    // Crear una respuesta simulada con errores
    const transcriptionResult: TranscriptionResponse = {
      transcription: {
        doctor: ["Hola, ¿qué le sucede?"],
        patient: ["Empecé a tomar la medicina ayer."]
      },
      summary: "Paciente reporta haber iniciado tratamiento el día anterior.",
      template: "# Historia Clínica\n\n## Medicación\n- Paciente inició tratamiento el día anterior",
      raw_transcription: sampleTranscription,
      status: 'completed',
      errors: [
        {
          linea: 2,
          original: "**Paciente:** Empecé a hablar la medicina ayer.",
          corregido: "**Paciente:** Empecé a tomar la medicina ayer.",
          impacto_medico: true
        }
      ]
    };
    
    return NextResponse.json({
      anonymizedAudioUrl: "https://example.com/audio-example.mp3",
      transcription: transcriptionResult.transcription,
      summary: transcriptionResult.summary,
      template: transcriptionResult.template,
      raw_transcription: transcriptionResult.raw_transcription,
      errors: transcriptionResult.errors,
      status: transcriptionResult.status
    });
    
  } catch (error) {
    console.error('Error en el endpoint de prueba:', error);
    return NextResponse.json(
      { error: 'Error en la prueba', details: (error as Error).message },
      { status: 500 }
    );
  }
} 