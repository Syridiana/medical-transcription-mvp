import { NextRequest, NextResponse } from 'next/server';
import { TranscriptionResponse } from '@/components/audio/types';

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { audioUrl } = requestData;
    
    if (!audioUrl) {
      return NextResponse.json(
        { error: 'No audio URL provided' },
        { status: 400 }
      );
    }
    
    console.log(`Processing transcription for audio: ${audioUrl}`);
    
    try {
      // Step 1: Anonymize the audio
      console.log('Step 1: Anonymizing audio...');
      const anonymizeResponse = await fetch('https://scriba-bmenmapcaa-uc.a.run.app/controller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "step": "anonymize",
          "audio": audioUrl
        }),
      });
      
      if (!anonymizeResponse.ok) {
        throw new Error('Error en el proceso de anonimización');
      }
      
      const anonymizeData = await anonymizeResponse.json();
      
      // Construir la URL del audio anonimizado
      const anonymizedAudioUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${anonymizeData.output.audio}`;
      
      // Step 2: Transcribe 
      console.log('Step 2: Transcribing audio...');
      const transcribeResponse = await fetch('https://scriba-bmenmapcaa-uc.a.run.app/controller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "step": "transcribe",
          "audio": anonymizeData.output.audio // We could use anonymizeData.audio for the anonymized version
        }),
      });
      
      if (!transcribeResponse.ok) {
        throw new Error(`Error en la respuesta de transcribe: ${transcribeResponse.status}`);
      }
      
      const transcribeData = await transcribeResponse.json();
      console.log('Transcription received:', transcribeData);
      
      // Transform the API response data to get the actual transcription
      const transformedTranscribeData = transformAPIResponse(transcribeData);
      
      // Store the raw transcription
      const rawTranscription = transformedTranscribeData.transcription as string;
      
      // Step 3: Generate template from transcription
      console.log('Step 3: Generating template...');
      const templateResponse = await fetch('https://scriba-bmenmapcaa-uc.a.run.app/controller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "step": "template",
          "transcription": rawTranscription
        }),
      });
      
      if (!templateResponse.ok) {
        throw new Error(`Error en la respuesta de template: ${templateResponse.status}`);
      }
      
      const templateData = await templateResponse.json();
      console.log('Template generated:', templateData);
      
      // Transform the template response
      const transformedTemplateData = transformAPIResponse(templateData);
      
      // Parse the transcription into doctor and patient segments
      const parsedTranscription = parseTranscription(rawTranscription);
      
      // Build response with all the data we need
      const finalResponse: TranscriptionResponse = {
        transcription: parsedTranscription,
        summary: transformedTemplateData.template as string,
        template: transformedTemplateData.template as string,
        raw_transcription: rawTranscription,
        status: 'completed',
      };
      
      return NextResponse.json({
        status: 'success',
        anonymizedAudioUrl,
        transcription: finalResponse.transcription,
        summary: finalResponse.summary,
        template: finalResponse.template,
        raw_transcription: finalResponse.raw_transcription,
        status: finalResponse.status
      });
      
    } catch (fetchError) {
      console.error('Error al conectar con el servicio de transcripción:', fetchError);
      
      // Si falla la conexión al servicio externo, devolvemos una estructura vacía
      const transcriptionResult: TranscriptionResponse = {
        transcription: {
          doctor: [],
          patient: []
        },
        summary: "",
        status: 'error',
        message: 'No se pudo conectar con el servicio de transcripción: ' + (fetchError as Error).message
      };
      
      return NextResponse.json(transcriptionResult);
    }
    
  } catch (error) {
    console.error('Error processing transcription:', error);
    return NextResponse.json(
      { error: 'Failed to process transcription', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Function to adapt API responses to our expected format
function transformAPIResponse(apiResponse: Record<string, unknown>): Record<string, unknown> {
  // Check if this is a response with input/output format
  if (apiResponse.input && apiResponse.output) {
    return apiResponse.output as Record<string, unknown>;
  }
  
  // If it's already in the expected format
  return apiResponse;
}

// Helper function to parse the transcription into doctor and patient segments
function parseTranscription(transcription: string): { doctor: string[]; patient: string[] } {
  if (!transcription) {
    return { doctor: [], patient: [] };
  }
  
  // First, let's parse the entire conversation as sequential messages
  type Speaker = 'doctor' | 'patient';
  interface Message {
    speaker: Speaker;
    text: string;
  }
  
  const lines = transcription.split('\n');
  const messages: Message[] = [];
  
  let currentSpeaker: Speaker | null = null;
  let currentText = '';
  
  for (const line of lines) {
    // Check for doctor lines with different format variations
    if (line.match(/^\*\*Doctor\*\*:/) || line.match(/^\*\*Doctor\*\*\s*:/) || line.startsWith('**Doctor**')) {
      // Save previous message if exists
      if (currentSpeaker && currentText.trim()) {
        messages.push({
          speaker: currentSpeaker,
          text: currentText.trim()
        });
      }
      
      currentSpeaker = 'doctor';
      // Extract text after the speaker marker
      currentText = line.replace(/^\*\*Doctor\*\*:/, '')
                        .replace(/^\*\*Doctor\*\*\s*:/, '')
                        .replace(/^\*\*Doctor\*\*/, '')
                        .trim();
    } 
    // Check for patient lines with different format variations
    else if (line.match(/^\*\*Paciente\*\*:/) || line.match(/^\*\*Paciente\*\*\s*:/) || line.startsWith('**Paciente**')) {
      // Save previous message if exists
      if (currentSpeaker && currentText.trim()) {
        messages.push({
          speaker: currentSpeaker,
          text: currentText.trim()
        });
      }
      
      currentSpeaker = 'patient';
      // Extract text after the speaker marker
      currentText = line.replace(/^\*\*Paciente\*\*:/, '')
                        .replace(/^\*\*Paciente\*\*\s*:/, '')
                        .replace(/^\*\*Paciente\*\*/, '')
                        .trim();
    } 
    // Continue existing message
    else if (line.trim() && currentSpeaker) {
      currentText += ' ' + line.trim();
    }
  }
  
  // Don't forget to add the last message
  if (currentSpeaker && currentText.trim()) {
    messages.push({
      speaker: currentSpeaker,
      text: currentText.trim()
    });
  }
  
  console.log('Parsed sequential messages:', messages);
  
  // Now transform sequential messages to parallel doctor/patient arrays
  // This preserves the conversation flow in the UI
  const result: { doctor: string[]; patient: string[] } = {
    doctor: [],
    patient: []
  };
  
  let currentIndex = 0;
  let lastSpeaker: Speaker | null = null;
  
  for (const message of messages) {
    // If speaker changes from patient to doctor, increment the index
    if (lastSpeaker === 'patient' && message.speaker === 'doctor') {
      currentIndex++;
    }
    
    // Ensure the arrays have enough slots
    while (result.doctor.length <= currentIndex) {
      result.doctor.push('');
    }
    while (result.patient.length <= currentIndex) {
      result.patient.push('');
    }
    
    // Add the message to the appropriate array at the current index
    if (message.speaker === 'doctor') {
      if (result.doctor[currentIndex]) {
        // If there's already content, append to it
        result.doctor[currentIndex] += ' ' + message.text;
      } else {
        result.doctor[currentIndex] = message.text;
      }
    } else { // patient
      if (result.patient[currentIndex]) {
        // If there's already content, append to it
        result.patient[currentIndex] += ' ' + message.text;
      } else {
        result.patient[currentIndex] = message.text;
      }
    }
    
    lastSpeaker = message.speaker;
  }
  
  console.log('Final parsed structure:', result);
  
  return result;
} 