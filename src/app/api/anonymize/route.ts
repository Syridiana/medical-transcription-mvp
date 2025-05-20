import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🎭 Recibida solicitud de anonimización de audio');
  
  try {
    const requestData = await request.json();
    const { audioUrl } = requestData;
    
    if (!audioUrl) {
      console.error('❌ No se proporcionó URL de audio');
      return NextResponse.json(
        { error: 'No audio URL provided' },
        { status: 400 }
      );
    }
    
    console.log(`🔄 Anonimizando audio: ${audioUrl}`);
    
    const anonymizationEndpoint = 'https://scriba-bmenmapcaa-uc.a.run.app/controller';
    console.log(`🔗 Enviando solicitud a: ${anonymizationEndpoint}`);
    
    const anonymizeResponse = await fetch(anonymizationEndpoint, {
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
      const errorText = await anonymizeResponse.text().catch(() => 'No error details available');
      console.error(`❌ Error en anonimización: ${anonymizeResponse.status} - ${errorText}`);
      throw new Error(`Error en el proceso de anonimización: ${anonymizeResponse.status} ${anonymizeResponse.statusText}`);
    }
    
    const anonymizeData = await anonymizeResponse.json();
    console.log('✅ Respuesta de anonimización recibida:', anonymizeData);
    
    if (!anonymizeData.output || !anonymizeData.output.audio) {
      console.error('❌ Formato de respuesta inválido:', anonymizeData);
      throw new Error('Formato de respuesta inválido del servicio de anonimización');
    }
    
    const bucketName = process.env.GCS_BUCKET_NAME;
    const anonymizedAudioUrl = `https://storage.googleapis.com/${bucketName}/${anonymizeData.output.audio}`;
    console.log(`🎵 URL de audio anonimizado: ${anonymizedAudioUrl}`);
    
    return NextResponse.json({
      status: 'success',
      anonymizedAudioUrl
    });
    
  } catch (error) {
    console.error('❌ Error al anonimizar audio:', error);
    return NextResponse.json(
      { error: 'Failed to anonymize audio', details: (error as Error).message },
      { status: 500 }
    );
  }
} 