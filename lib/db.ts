import { Pool } from 'pg'

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.warn('DATABASE_URL environment variable is not defined in production')
}

// PostgreSQL connection pool - only create if DATABASE_URL exists
let pool: Pool | null = null

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    // Connection test
    pool.on('connect', () => {
      console.log('Connected to PostgreSQL database')
    })

    pool.on('error', (err) => {
      console.error('Database connection error:', err)
    })
  } catch (error) {
    console.error('Failed to create database pool:', error)
  }
}

export default pool

// Helper function for queries
export async function query(text: string, params?: any[]) {
  if (!pool) {
    throw new Error('Database connection not available')
  }
  
  try {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Transaction helper
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  if (!pool) {
    throw new Error('Database connection not available')
  }
  
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}