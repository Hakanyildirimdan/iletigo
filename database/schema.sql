-- İletigo Mutabakat Yönetim Sistemi Database Schema

-- 1. Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Şirketler/Kurumlar Tablosu
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_number VARCHAR(50) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Türkiye',
    phone VARCHAR(20),
    email VARCHAR(255),
    contact_person VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Mutabakat Dönemleri
CREATE TABLE IF NOT EXISTS reconciliation_periods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Mutabakat Kayıtları
CREATE TABLE IF NOT EXISTS reconciliations (
    id SERIAL PRIMARY KEY,
    period_id INTEGER REFERENCES reconciliation_periods(id),
    company_id INTEGER REFERENCES companies(id),
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    our_amount DECIMAL(15,2) DEFAULT 0,
    their_amount DECIMAL(15,2) DEFAULT 0,
    difference DECIMAL(15,2) GENERATED ALWAYS AS (our_amount - their_amount) STORED,
    currency VARCHAR(3) DEFAULT 'TRY',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'disputed', 'resolved', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    assigned_to INTEGER REFERENCES users(id),
    created_by INTEGER REFERENCES users(id),
    resolved_by INTEGER REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Mutabakat Detayları (Alt Kalemler)
CREATE TABLE IF NOT EXISTS reconciliation_details (
    id SERIAL PRIMARY KEY,
    reconciliation_id INTEGER REFERENCES reconciliations(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    description VARCHAR(500),
    our_amount DECIMAL(15,2) DEFAULT 0,
    their_amount DECIMAL(15,2) DEFAULT 0,
    difference DECIMAL(15,2) GENERATED ALWAYS AS (our_amount - their_amount) STORED,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Dosya Ekleri
CREATE TABLE IF NOT EXISTS attachments (
    id SERIAL PRIMARY KEY,
    reconciliation_id INTEGER REFERENCES reconciliations(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Yorumlar/Notlar
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    reconciliation_id INTEGER REFERENCES reconciliations(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Aktivite Logları (Audit Trail)
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Sistem Ayarları
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Oturum Yönetimi
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler (Performance için)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_reconciliations_status ON reconciliations(status);
CREATE INDEX IF NOT EXISTS idx_reconciliations_period ON reconciliations(period_id);
CREATE INDEX IF NOT EXISTS idx_reconciliations_company ON reconciliations(company_id);
CREATE INDEX IF NOT EXISTS idx_reconciliations_assigned ON reconciliations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_reconciliations_due_date ON reconciliations(due_date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_table_record ON activity_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);

-- Trigger fonksiyonu (updated_at otomatik güncelleme)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ları tablolara uygula
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reconciliation_periods_updated_at ON reconciliation_periods;
CREATE TRIGGER update_reconciliation_periods_updated_at BEFORE UPDATE ON reconciliation_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reconciliations_updated_at ON reconciliations;
CREATE TRIGGER update_reconciliations_updated_at BEFORE UPDATE ON reconciliations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- İstatistik view'ları
CREATE OR REPLACE VIEW reconciliation_stats AS
SELECT 
    status,
    COUNT(*) as count,
    SUM(ABS(difference)) as total_difference,
    AVG(ABS(difference)) as avg_difference
FROM reconciliations 
GROUP BY status;

CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
    u.first_name || ' ' || u.last_name as user_name,
    COUNT(al.id) as total_actions,
    MAX(al.created_at) as last_activity
FROM users u
LEFT JOIN activity_logs al ON u.id = al.user_id
GROUP BY u.id, u.first_name, u.last_name;