import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME || '';

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
    const fileUrl = `models/scriba/${uniqueFilename}`;


    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Google Cloud Storage
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileUrl);
    
    await file.save(buffer, {
      contentType: audioFile.type,
      metadata: {
        originalName,
        uploadedAt: new Date().toISOString(),
      },
    });


    return NextResponse.json({
      success: true,
      filename: uniqueFilename,
      url: fileUrl,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: (error as Error).message },
      { status: 500 }
    );
  }
} 