import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      );
    }

    // Mock file upload response
    const mockAttachment = {
      id: Date.now(),
      file_name: 'test_file.pdf',
      file_path: '/uploads/test_file.pdf',
      file_size: 1024000,
      file_type: 'application/pdf',
      uploaded_by: 1,
      uploaded_at: new Date().toISOString()
    };

    return NextResponse.json({
      message: 'Dosya başarıyla yüklendi',
      attachment: mockAttachment
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Dosya yükleme hatası' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      );
    }

    // Mock attachments
    const mockAttachments = [];

    return NextResponse.json(mockAttachments);

  } catch (error) {
    console.error('Attachments fetch error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
