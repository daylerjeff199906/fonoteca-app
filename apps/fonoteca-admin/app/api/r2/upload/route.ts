import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToFileService } from '@/lib/file-service';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await uploadFileToFileService(formData);
    return NextResponse.json({ ...result }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading file via proxy:', error);
    return NextResponse.json(
      { error: error.message || 'Error uploading file' },
      { status: 500 }
    );
  }
}
