const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required')
  process.exit(1)
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function seedDatabase() {
  try {
    console.log('Starting database seeding...')
    
    // Hash default password
    const defaultPassword = await bcrypt.hash('admin123', 12)
    
    // Insert admin user
    await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@iletigo.com', defaultPassword, 'Admin', 'User', 'admin', true])
    
    // Insert sample company
    await pool.query(`
      INSERT INTO companies (name, tax_number, city, country, contact_person)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (tax_number) DO NOTHING
    `, ['Örnek Şirket A.Ş.', '1234567890', 'İstanbul', 'Türkiye', 'Ahmet Yılmaz'])
    
    // Insert sample period
    await pool.query(`
      INSERT INTO reconciliation_periods (name, start_date, end_date, status, created_by)
      VALUES ($1, $2, $3, $4, (SELECT id FROM users WHERE email = 'admin@iletigo.com'))
      ON CONFLICT DO NOTHING
    `, ['2024 Q4', '2024-10-01', '2024-12-31', 'active'])
    
    // Insert system settings
    const settings = [
      ['app_name', 'İletigo', 'Uygulama adı', true],
      ['app_version', '1.0.0', 'Uygulama versiyonu', true],
      ['company_name', 'İletigo Mutabakat Sistemi', 'Şirket adı', true],
      ['default_currency', 'TRY', 'Varsayılan para birimi', true],
      ['session_timeout', '3600', 'Oturum zaman aşımı (saniye)', false]
    ]
    
    for (const [key, value, description, is_public] of settings) {
      await pool.query(`
        INSERT INTO settings (key, value, description, is_public, updated_by)
        VALUES ($1, $2, $3, $4, (SELECT id FROM users WHERE email = 'admin@iletigo.com'))
        ON CONFLICT (key) DO NOTHING
      `, [key, value, description, is_public])
    }
    
    console.log('✅ Database seeding completed successfully!')
    console.log('Default admin credentials:')
    console.log('Email: admin@iletigo.com')
    console.log('Password: admin123')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seedDatabase()