-- Kịch bản SQL Thiết lập Cơ sở dữ liệu SmartTax AI SaaS MVP
-- Hướng dẫn: Sao chép và chạy tệp này trong Supabase SQL Editor

-- 1. Kích hoạt Extension pgvector để tìm kiếm ngữ nghĩa văn bản pháp luật
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Bảng Tenants (Doanh nghiệp khách hàng)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    representative VARCHAR(100),
    accounting_regime VARCHAR(10) CHECK (accounting_regime IN ('TT133', 'TT88', 'TT200')) NOT NULL,
    industry VARCHAR(150),
    total_revenue NUMERIC(15, 2) DEFAULT 0,
    total_expenses NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Bảng Users (Người dùng liên kết doanh nghiệp)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY, -- Trùng với auth.users.id của Supabase Auth
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) CHECK (role IN ('OWNER', 'ACCOUNTANT', 'ADMIN')) NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Bảng Invoices (Hóa đơn mua vào/bán ra)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(10) CHECK (type IN ('INCOMING', 'OUTGOING')) NOT NULL,
    symbol VARCHAR(50),
    number VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL,
    counterpart_tax_code VARCHAR(50) NOT NULL,
    counterpart_name VARCHAR(255) NOT NULL,
    pre_tax_amount NUMERIC(15, 2) NOT NULL,
    vat_rate VARCHAR(10),
    vat_amount NUMERIC(15, 2) DEFAULT 0,
    total_amount NUMERIC(15, 2) NOT NULL,
    ocr_confidence NUMERIC(5, 4) DEFAULT 1.0000,
    risk_status VARCHAR(15) CHECK (risk_status IN ('SAFE', 'WARNING', 'CRITICAL')) DEFAULT 'SAFE',
    risk_flags TEXT[], -- Danh sách cảnh báo rủi ro hóa đơn
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Bảng Journals (Sổ Nhật ký chung / Định khoản)
CREATE TABLE IF NOT EXISTS journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    voucher_code VARCHAR(100),
    description TEXT NOT NULL,
    debit_account VARCHAR(20) NOT NULL,
    credit_account VARCHAR(20) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    is_automated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Bảng Bank Transactions (Sao kê ngân hàng)
CREATE TABLE IF NOT EXISTS bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    reference_number VARCHAR(100),
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('DEBIT', 'CREDIT')) NOT NULL, -- DEBIT (Rút tiền), CREDIT (Nạp tiền)
    match_status VARCHAR(15) CHECK (match_status IN ('UNMATCHED', 'MATCHED')) DEFAULT 'UNMATCHED',
    suggested_debit_acc VARCHAR(20),
    suggested_credit_acc VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Bảng Knowledge Chunks (Lưu trữ vector tri thức Luật thuế phục vụ RAG)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- Vector 1536 chiều từ OpenAI / Gemini Embeddings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- CHÍNH SÁCH BẢO MẬT CÔ LẬP KHÁCH HÀNG (ROW-LEVEL SECURITY - RLS)
-- =========================================================================

-- Kích hoạt RLS trên các bảng chứa dữ liệu nhạy cảm của khách hàng
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;

-- 1. Chính sách cho bảng Tenants
-- Cho phép đọc nếu người dùng thuộc Tenant đó
CREATE POLICY tenant_read_policy ON tenants 
    FOR SELECT 
    USING (id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- 2. Chính sách cho bảng Users
-- Cho phép người dùng đọc thông tin hồ sơ của chính mình
CREATE POLICY user_self_policy ON users 
    FOR SELECT 
    USING (id = auth.uid());

-- 3. Chính sách cô lập dữ liệu hóa đơn (Invoices)
CREATE POLICY invoice_tenant_isolation ON invoices 
    FOR ALL 
    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- 4. Chính sách cô lập sổ nhật ký chung (Journals)
CREATE POLICY journal_tenant_isolation ON journals 
    FOR ALL 
    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- 5. Chính sách cô lập sao kê ngân hàng (Bank Transactions)
CREATE POLICY bank_tx_tenant_isolation ON bank_transactions 
    FOR ALL 
    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
