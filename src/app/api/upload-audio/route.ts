import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/services/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validar el tipo de archivo
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only audio files are allowed.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const audioUrl = await uploadFile(buffer, audioFile.name);

    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error('Error uploading audio:', error);
    return NextResponse.json(
      { error: 'Error uploading audio file' },
      { status: 500 }
    );
  }
} 