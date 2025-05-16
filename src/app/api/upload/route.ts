import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

// Initialize Google Cloud Storage
let storage: Storage;

try {
  // When running in GCP or with Application Default Credentials
  storage = new Storage();
  
  // Alternative initialization with explicit credentials if needed
  // const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS 
  //   ? JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
  //   : undefined;
  
  // storage = new Storage({
  //   projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  //   credentials
  // });
} catch (error) {
  console.error('Error initializing Google Cloud Storage:', error);
}

const bucketName = process.env.GCS_BUCKET_NAME || 'kiki-medicina';

export async function POST(request: NextRequest) {
  try {
    // Ensure storage is initialized
    if (!storage) {
      return NextResponse.json(
        { error: 'Storage client not initialized' },
        { status: 500 }
      );
    }
    
    // Get form data with audio file
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Generate a unique filename to avoid collisions
    const originalName = audioFile.name;
    const extension = originalName.split('.').pop() || 'wav';
    const uniqueFilename = `${uuidv4()}.${extension}`;

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Google Cloud Storage
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(uniqueFilename);
    
    await file.save(buffer, {
      contentType: audioFile.type,
      metadata: {
        originalName,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      filename: uniqueFilename,
      url: publicUrl,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: (error as Error).message },
      { status: 500 }
    );
  }
} 