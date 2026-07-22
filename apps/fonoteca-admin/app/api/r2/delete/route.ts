import { NextRequest, NextResponse } from 'next/server';
import { deleteFileFromFileService } from '@/lib/file-service';

export async function POST(req: NextRequest) {
  try {
    const { url, fileId } = await req.json();
    const target = fileId || url;

    if (!target) {
      return NextResponse.json({ error: 'fileId or URL is required' }, { status: 400 });
    }

    await deleteFileFromFileService(target);
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting file via proxy:', error);
    return NextResponse.json(
      { error: error.message || 'Error deleting file' },
      { status: 500 }
    );
  }
}
