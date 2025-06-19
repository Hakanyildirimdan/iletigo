const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required')
  process.exit(1)
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function runMigration() {
  try {
    console.log('Starting database migration...')
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql')
    
    if (!fs.existsSync(schemaPath)) {
      console.error('Schema file not found at:', schemaPath)
      process.exit(1)
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute the schema
    await pool.query(schema)
    
    console.log('✅ Database migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigration()