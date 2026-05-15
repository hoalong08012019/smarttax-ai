import React from 'react';
import { 
  Lock, 
  Unlock, 
  LogOut, 
  Settings, 
  UploadCloud, 
  Building2, 
  Cpu, 
  Sparkles 
} from 'lucide-react';
import { MOCK_TENANTS } from '../../mockData';

interface AdminPortalProps {
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (val: boolean) => void;
  adminPasscodeInput: string;
  setAdminPasscodeInput: (val: string) => void;
  adminAuthError: string | null;
  setAdminAuthError: (val: string | null) => void;
  adminIndexingTitle: string;
  setAdminIndexingTitle: (val: string) => void;
  adminIndexingStatus: string | null;
  setAdminIndexingStatus: (val: string | null) => void;
  adminSystemPromptOverride: string;
  setAdminSystemPromptOverride: (val: string) => void;
  setActiveTab: (tab: string) => void;
  activeTenantId: string;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isAdminAuthenticated,
  setIsAdminAuthenticated,
  adminPasscodeInput,
  setAdminPasscodeInput,
  adminAuthError,
  setAdminAuthError,
  adminIndexingTitle,
  setAdminIndexingTitle,
  adminIndexingStatus,
  setAdminIndexingStatus,
  adminSystemPromptOverride,
  setAdminSystemPromptOverride,
  setActiveTab,
  activeTenantId
}) => {
  if (!isAdminAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', width: '100vw', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundImage: 'radial-gradient(circle at center, rgba(204,255,0,0.05) 0%, transparent 70%)' }}>
        <div style={{ width: '100%', maxWidth: '420px', padding: '32px', borderRadius: '16px', backgroundColor: '#06070a', border: '1px solid rgba(204,255,0,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }} className="animate-fade-in">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(204,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid var(--accent-lime)' }}>
              <Lock size={28} color="var(--accent-lime)" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>Cổng Quản Trị Độc Lập</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Hệ thống được cô lập hoàn toàn khỏi phân hệ Kế toán viên</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const targetPasscode = import.meta.env.VITE_ADMIN_PASSCODE || 'smarttax2026';
            if (adminPasscodeInput === targetPasscode) {
              const sessionData = {
                authenticated: true,
                expiresAt: Date.now() + 30 * 60 * 1000 // 30 minutes
              };
              sessionStorage.setItem('smarttax_admin_auth', JSON.stringify(sessionData));
              setIsAdminAuthenticated(true);
              setAdminAuthError(null);
            } else {
              setAdminAuthError('Mã truy cập không chính xác. Vui lòng thử lại.');
            }
          }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 700 }} className="font-mono">
                NHẬP MÃ BẢO MẬT (ROOT PASSCODE):
              </label>
              <input 
                type="password"
                value={adminPasscodeInput}
                onChange={(e) => setAdminPasscodeInput(e.target.value)}
                placeholder="••••••••••••"
                style={{ width: '100%', padding: '12px', borderRadius: '6px', backgroundColor: '#000000', border: '1px solid var(--border-color)', color: 'var(--accent-lime)', fontSize: '14px', letterSpacing: '0.2em', textAlign: 'center', outline: 'none' }}
                autoFocus
              />
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                Gợi ý mật khẩu demo: <strong style={{ color: '#ffffff' }}>smarttax2026</strong>
              </span>
            </div>

            {adminAuthError && (
              <div style={{ padding: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,51,51,0.1)', border: '1px solid rgba(255,51,51,0.2)', fontSize: '11px', color: '#ff4444', textAlign: 'center' }}>
                {adminAuthError}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '13px' }}>
              <Unlock size={16} />
              <span>Xác thực Quyền Quản Trị Cấp Cao</span>
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <button 
              onClick={() => {
                if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
                  window.location.href = '/';
                } else {
                  setActiveTab('overview');
                }
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', textDecoration: 'underline', cursor: 'pointer' }}
            >
              &larr; Quay lại phân hệ website Kế toán thường
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      
      <header style={{ padding: '16px 32px', backgroundColor: '#050505', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="flex-row-center" style={{ gap: '12px' }}>
          <div style={{ padding: '6px 10px', borderRadius: '6px', backgroundColor: 'var(--accent-lime)', color: '#000000', fontWeight: 800, fontSize: '14px' }} className="font-mono">
            ROOT // SECURE
          </div>
          <div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>SmartTax AI Core Administration Terminal</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Cô lập bộ nhớ đệm vật lý • Giao thức Zero-Knowledge DB</span>
          </div>
        </div>

        <button 
          onClick={() => {
            sessionStorage.removeItem('smarttax_admin_auth');
            setIsAdminAuthenticated(false);
            if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
              window.location.href = '/';
            } else {
              setActiveTab('overview');
            }
          }}
          style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'rgba(255,51,51,0.1)', border: '1px solid rgba(255,51,51,0.2)', color: '#ff4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <LogOut size={14} />
          <span>Đóng Cổng & Thoát</span>
        </button>
      </header>

      <main style={{ flex: 1, padding: '32px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        
        <div style={{ padding: '24px', borderRadius: '12px', backgroundColor: '#06070a', border: '1px solid var(--accent-lime)', marginBottom: '24px' }}>
          <div className="flex-row-between" style={{ marginBottom: '16px' }}>
            <div className="flex-row-center" style={{ gap: '12px' }}>
              <Settings size={22} color="var(--accent-lime)" />
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Bảng điều khiển Máy học & Định tuyến Pháp lý pgvector</h1>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tự động ánh xạ chỉ tiêu kết xuất vào engine tính toán 3 lớp chuẩn hóa.</p>
              </div>
            </div>
            <span className="badge badge-lime font-mono" style={{ fontSize: '11px' }}>AES-256-GCM Secure Shell</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#000000', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Trạng thái Supabase v2</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-emerald)' }}>Active (RLS Enforced)</span>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#000000', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Cơ chế Phân mảnh Chunks</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)' }} className="font-mono">Text-Embedding-Ada-002</span>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#000000', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Bảo mật Chữ ký số</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Token PKCS#11 / HSM VN</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          
          <div style={{ backgroundColor: '#06070a', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div className="flex-row-center" style={{ gap: '8px', marginBottom: '12px' }}>
              <UploadCloud size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Nạp Trực tiếp Tri thức Luật vào pgvector DB</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Mô phỏng cơ chế băm dữ liệu nội suy 1536 chiều, tải trực tiếp các Nghị định, Thông tư mới phát sinh vào mô hình tra cứu ngữ nghĩa.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Tên văn bản / Thông tư cần index:</label>
                <input 
                  type="text"
                  value={adminIndexingTitle}
                  onChange={(e) => setAdminIndexingTitle(e.target.value)}
                  placeholder="Ví dụ: Thông tư 40/2021/TT-BTC hoặc Thông tư sửa đổi..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', backgroundColor: '#000000', border: '1px solid var(--border-color)', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <button 
                onClick={() => {
                  if (!adminIndexingTitle.trim()) return;
                  setAdminIndexingStatus('INDEXING');
                  setTimeout(() => {
                    setAdminIndexingStatus('SUCCESS');
                  }, 1200);
                }}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '13px' }}
              >
                <Sparkles size={14} className={adminIndexingStatus === 'INDEXING' ? 'animate-spin' : ''} />
                <span>{adminIndexingStatus === 'INDEXING' ? 'Đang băm chuỗi & nhúng Embedding (1536 dims)...' : '⚡ Băm Dữ liệu & Đẩy vào Bảng knowledge_chunks'}</span>
              </button>

              {adminIndexingStatus === 'SUCCESS' && (
                <div className="animate-fade-in" style={{ padding: '12px', backgroundColor: 'rgba(0,255,128,0.08)', borderRadius: '6px', border: '1px solid rgba(0,255,128,0.2)', fontSize: '12px', color: 'var(--accent-emerald)', lineHeight: 1.4 }}>
                  ✔ <strong>Thành công:</strong> Đã chia tách tài liệu thành <strong>420 chunks</strong> và xây dựng hoàn tất chỉ mục lập chỉ mục HNSW/IVFFlat trên PostgreSQL pgvector!
                </div>
              )}
            </div>
          </div>

          <div style={{ backgroundColor: '#06070a', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div className="flex-row-center" style={{ gap: '8px', marginBottom: '12px' }}>
              <Building2 size={18} color="var(--accent-lime)" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Quản lý Đơn vị Hạch toán & Chế độ Kế toán</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Danh sách các tổ chức khách hàng trực thuộc sự điều phối của hệ thống AI.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '6px' }}>
              {MOCK_TENANTS.map(t => (
                <div key={t.id} className="flex-row-between" style={{ padding: '10px 14px', backgroundColor: '#000000', borderRadius: '6px', border: t.id === activeTenantId ? '1px solid var(--accent-lime)' : '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block' }}>{t.companyName}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="font-mono">MST: {t.taxCode}</span>
                  </div>
                  <span className={`badge ${t.accountingRegime === 'TT133' ? 'badge-lime' : 'badge-amber'}`} style={{ fontSize: '10px' }}>
                    {t.accountingRegime}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div style={{ backgroundColor: '#06070a', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div className="flex-row-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="#d4a6ff" />
              <span>Kiểm soát Ngầm định Lõi Prompt AI (System Injection Parameter)</span>
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mã lệnh điều hướng RAG</span>
          </div>

          <textarea
            value={adminSystemPromptOverride}
            onChange={(e) => setAdminSystemPromptOverride(e.target.value)}
            style={{ width: '100%', height: '80px', padding: '12px', backgroundColor: '#000000', color: 'var(--accent-lime)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', fontFamily: 'monospace', resize: 'vertical', outline: 'none' }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '8px', fontStyle: 'italic' }}>
            ℹ️ Thay đổi chuỗi này sẽ ghi đè trực tiếp tham số khởi tạo ma trận hạch toán đầu vào của AI khi truy vấn Sổ sách Kế toán hoặc xuất file chuẩn iHTKK.
          </span>
        </div>

      </main>

      <footer style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: 'var(--text-muted)' }}>
        Hệ thống Quản trị Lõi SmartTax AI • Hoạt động hoàn toàn độc lập và bảo mật cao cấp trên Vercel Edge Serverless.
      </footer>
    </div>
  );
};
