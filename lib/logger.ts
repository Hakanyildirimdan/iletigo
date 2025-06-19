import { query } from './db'

export interface LogEntry {
  user_id?: number
  action: string
  table_name: string
  record_id: number
  old_values?: any
  new_values?: any
  ip_address?: string
  user_agent?: string
}

// Activity logger
export async function logActivity(logEntry: LogEntry): Promise<void> {
  try {
    await query(
      `INSERT INTO activity_logs 
       (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        logEntry.user_id || null,
        logEntry.action,
        logEntry.table_name,
        logEntry.record_id,
        logEntry.old_values ? JSON.stringify(logEntry.old_values) : null,
        logEntry.new_values ? JSON.stringify(logEntry.new_values) : null,
        logEntry.ip_address || null,
        logEntry.user_agent || null
      ]
    )
  } catch (error) {
    console.error('Failed to log activity:', error)
    // Don't throw error - logging should not break the main flow
  }
}

// Get request metadata
export function getRequestMetadata(request: Request) {
  return {
    ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    user_agent: request.headers.get('user-agent') || 'unknown'
  }
}

// Common log actions
export const LOG_ACTIONS = {
  CREATE: 'created',
  UPDATE: 'updated',
  DELETE: 'deleted',
  VIEW: 'viewed',
  LOGIN: 'login',
  LOGOUT: 'logout',
  EXPORT: 'exported',
  IMPORT: 'imported',
  APPROVE: 'approved',
  REJECT: 'rejected'
} as const

export type LogAction = typeof LOG_ACTIONS[keyof typeof LOG_ACTIONS]