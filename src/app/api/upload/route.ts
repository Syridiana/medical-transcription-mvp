import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME || '';

export async function POST(request: NextRequest) {
  console.log('📤 Recibida solicitud de subida de audio');
  console.log('🪣 Bucket configurado:', bucketName);
  
  try {
    // Ensure storage is initialized
    if (!storage) {
      console.error('❌ Cliente de almacenamiento no inicializado');
      return NextResponse.json(
        { error: 'Storage client not initialized' },
        { status: 500 }
      );
    }
    
    // Validate bucket name
    if (!bucketName) {
      console.error('❌ Nombre del bucket no configurado');
      return NextResponse.json(
        { error: 'Bucket name not configured' },
        { status: 500 }
      );
    }
    
    // Get form data with audio file
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      console.error('❌ No se proporcionó archivo de audio');
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log('📄 Archivo recibido:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });

    // Generate a unique filename to avoid collisions
    const originalName = audioFile.name;
    const extension = originalName.split('.').pop() || 'wav';
    const uniqueFilename = `${uuidv4()}.${extension}`;
    const fileUrl = `${uniqueFilename}`;

    console.log('🔖 Nombre de archivo generado:', uniqueFilename);

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('📊 Buffer creado, tamaño:', buffer.length);

    // Upload to Google Cloud Storage
    console.log(`🪣 Subiendo a bucket: ${bucketName}, archivo: ${fileUrl}`);
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileUrl);
    
    await file.save(buffer, {
      contentType: audioFile.type,
      metadata: {
        originalName,
        uploadedAt: new Date().toISOString(),
      },
    });

    console.log('✅ Archivo subido exitosamente a GCS');
    const publicUrl = fileUrl;

    return NextResponse.json({
      success: true,
      filename: uniqueFilename,
      url: publicUrl,
    });

  } catch (error) {
    console.error('❌ Error al subir archivo:', error);

    return NextResponse.json(
      { error: 'Failed to upload file', details: (error as Error).message },
      { status: 500 }
    );
  }
} 