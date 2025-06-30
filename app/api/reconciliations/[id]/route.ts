import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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

    // Get reconciliation with related data
    const reconciliationQuery = `
      SELECT 
        r.*,
        c.name as company_name,
        rp.name as period_name,
        u1.first_name || ' ' || u1.last_name as assigned_to_name,
        u2.first_name || ' ' || u2.last_name as created_by_name
      FROM reconciliations r
      LEFT JOIN companies c ON r.company_id = c.id
      LEFT JOIN reconciliation_periods rp ON r.period_id = rp.id
      LEFT JOIN users u1 ON r.assigned_to = u1.id
      LEFT JOIN users u2 ON r.created_by = u2.id
      WHERE r.id = $1
    `;

    const reconciliationResult = await query(reconciliationQuery, [id]);
    
    if (reconciliationResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Mutabakat bulunamadı' },
        { status: 404 }
      );
    }

    const reconciliation = reconciliationResult.rows[0];

    // Get reconciliation details
    const detailsQuery = `
      SELECT * FROM reconciliation_details 
      WHERE reconciliation_id = $1 
      ORDER BY line_number
    `;
    const detailsResult = await query(detailsQuery, [id]);

    // Get attachments
    const attachmentsQuery = `
      SELECT 
        a.*,
        u.first_name || ' ' || u.last_name as uploaded_by_name
      FROM attachments a
      LEFT JOIN users u ON a.uploaded_by = u.id
      WHERE a.reconciliation_id = $1
      ORDER BY a.uploaded_at DESC
    `;
    const attachmentsResult = await query(attachmentsQuery, [id]);

    // Get comments with user names
    const commentsQuery = `
      SELECT 
        c.*,
        u.first_name || ' ' || u.last_name as user_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.reconciliation_id = $1
      ORDER BY c.created_at DESC
    `;
    const commentsResult = await query(commentsQuery, [id]);

    // Combine all data
    const response = {
      ...reconciliation,
      details: detailsResult.rows,
      attachments: attachmentsResult.rows,
      comments: commentsResult.rows
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Reconciliation fetch error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { status, assigned_to, notes } = body;
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      );
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramIndex}`);
      values.push(assigned_to);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Güncellenecek alan bulunamadı' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const updateQuery = `
      UPDATE reconciliations 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Mutabakat bulunamadı' },
        { status: 404 }
      );
    }

    // Log activity
    const activityQuery = `
      INSERT INTO activity_logs (user_id, action, table_name, record_id, new_values)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    // Note: In a real app, you'd get user_id from the JWT token
    const userId = 1; // Placeholder
    
    await query(activityQuery, [
      userId,
      'UPDATE',
      'reconciliations',
      id,
      JSON.stringify(body)
    ]);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Reconciliation update error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
