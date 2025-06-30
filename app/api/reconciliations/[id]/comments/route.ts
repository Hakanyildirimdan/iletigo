import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { content, is_internal = true } = body;
    
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

    // Check if reconciliation exists
    const reconciliationCheck = await query(
      'SELECT id FROM reconciliations WHERE id = $1',
      [id]
    );

    if (reconciliationCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Mutabakat bulunamadı' },
        { status: 404 }
      );
    }

    // Note: In a real app, you'd get user_id from the JWT token
    const userId = 1; // Placeholder

    // Insert comment
    const commentQuery = `
      INSERT INTO comments (reconciliation_id, user_id, content, is_internal, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const result = await query(commentQuery, [id, userId, content.trim(), is_internal]);

    // Get comment with user name
    const commentWithUserQuery = `
      SELECT 
        c.*,
        u.first_name || ' ' || u.last_name as user_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;

    const commentResult = await query(commentWithUserQuery, [result.rows[0].id]);

    // Log activity
    const activityQuery = `
      INSERT INTO activity_logs (user_id, action, table_name, record_id, new_values)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    await query(activityQuery, [
      userId,
      'ADD_COMMENT',
      'comments',
      result.rows[0].id,
      JSON.stringify({ content: content.trim(), is_internal })
    ]);

    return NextResponse.json({
      message: 'Yorum başarıyla eklendi',
      comment: commentResult.rows[0]
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

    // Get comments for the reconciliation
    const commentsQuery = `
      SELECT 
        c.*,
        u.first_name || ' ' || u.last_name as user_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.reconciliation_id = $1
      ORDER BY c.created_at DESC
    `;

    const result = await query(commentsQuery, [id]);

    return NextResponse.json(result.rows);

  } catch (error) {
    console.error('Comments fetch error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
