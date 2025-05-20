import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

const storage = new Storage();

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'No URL provided' },
        { status: 400 }
      );
    }
    
    console.log(`Fetching audio from: ${url}`);
    
    // Extraer el nombre del bucket y el path del archivo de la URL
    // URL formato: https://storage.googleapis.com/BUCKET_NAME/FILE_PATH
    const match = url.match(/storage\.googleapis\.com\/([^\/]+)\/(.+)/);
    if (!match) {
      throw new Error('Invalid Google Cloud Storage URL format');
    }
    
    const [, bucketName, filePath] = match;
    console.log(`Bucket: ${bucketName}, File: ${filePath}`);
    
    // Obtener el archivo usando el cliente de Storage
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);
    
    // Descargar el contenido del archivo
    const [fileContent] = await file.download();
    
    // Crear una respuesta con el audio
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': fileContent.length.toString(),
      },
    });
    
  } catch (error) {
    console.error('Error fetching audio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audio', details: (error as Error).message },
      { status: 500 }
    );
  }
} 