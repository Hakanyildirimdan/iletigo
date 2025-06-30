import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { content } = body;
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Yorum içeriği boş olamaz' },
        { status: 400 }
      );
    }

    // Mock response
    const mockComment = {
      id: Date.now(),
      content: content.trim(),
      user_name: 'Test User',
      created_at: new Date().toISOString()
    };

    return NextResponse.json({
      message: 'Yorum başarıyla eklendi',
      comment: mockComment
    });

  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json(
      { error: 'Yorum ekleme hatası' },
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

    // Mock comments
    const mockComments = [];

    return NextResponse.json(mockComments);

  } catch (error) {
    console.error('Comments fetch error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
