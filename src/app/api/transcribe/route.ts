import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo de audio' },
        { status: 400 }
      );
    }

    // Aquí deberás implementar la lógica para enviar el audio a tu modelo de IA
    // Por ejemplo, podrías usar fetch para enviar el audio a tu Colab:
    
    const modelResponse = await fetch('TU_URL_DE_COLAB', {
      method: 'POST',
      body: formData,
    });

    if (!modelResponse.ok) {
      throw new Error('Error en el procesamiento del modelo');
    }

    const result = await modelResponse.json();

    // Asumiendo que el modelo devuelve la transcripción y el resumen
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al procesar el audio' },
      { status: 500 }
    );
  }
} 