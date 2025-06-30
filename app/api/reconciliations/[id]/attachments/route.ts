import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = {
      extract: ['.pdf', '.xls', '.xlsx', '.csv'],
      signed_pdf: ['.pdf']
    };

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const typeAllowedExtensions = allowedTypes[type as keyof typeof allowedTypes];

    if (!typeAllowedExtensions || !typeAllowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya tipi' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya boyutu 10MB\'dan büyük olamaz' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'reconciliations', id.toString());
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = new Date().getTime();
    const filename = `${type}_${timestamp}_${file.name}`;
    const filepath = join(uploadDir, filename);
    const relativePath = `/uploads/reconciliations/${id}/${filename}`;

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Save attachment record to database
    const attachmentQuery = `
      INSERT INTO attachments (
        reconciliation_id, 
        file_name, 
        file_path, 
        file_size, 
        file_type, 
        uploaded_by, 
        uploaded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    // Note: In a real app, you'd get user_id from the JWT token
    const userId = 1; // Placeholder

    const result = await query(attachmentQuery, [
      id,
      file.name,
      relativePath,
      file.size,
      file.type,
      userId
    ]);

    // Log activity
    const activityQuery = `
      INSERT INTO activity_logs (user_id, action, table_name, record_id, new_values)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    await query(activityQuery, [
      userId,
      'UPLOAD_ATTACHMENT',
      'attachments',
      result.rows[0].id,
      JSON.stringify({ file_name: file.name, file_type: type })
    ]);

    return NextResponse.json({
      message: 'Dosya başarıyla yüklendi',
      attachment: result.rows[0]
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

    // Get attachments for the reconciliation
    const attachmentsQuery = `
      SELECT 
        a.*,
        u.first_name || ' ' || u.last_name as uploaded_by_name
      FROM attachments a
      LEFT JOIN users u ON a.uploaded_by = u.id
      WHERE a.reconciliation_id = $1
      ORDER BY a.uploaded_at DESC
    `;

    const result = await query(attachmentsQuery, [id]);

    return NextResponse.json(result.rows);

  } catch (error) {
    console.error('Attachments fetch error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
