import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToFileService } from '@/lib/file-service';
import { requireMediaWrite, validateUploadFiles } from '@/lib/backend/media-access';

export async function POST(req: NextRequest) {
  const denied = await requireMediaWrite();
  if (denied) return denied;

  try {
    const formData = await req.formData();
    const invalid = await validateUploadFiles(formData, 'file');
    if (invalid) return invalid;
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
