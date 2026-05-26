import React from 'react';
import { Sparkles, Building2, LogOut, Sun, Moon } from 'lucide-react';
import type { Tenant } from '../../mockData';

interface HeaderProps {
  activeTenantId: string;
  setActiveTenantId: (id: string) => void;
  tenants: Tenant[];
  currentTenant: Tenant;
  userType: 'SME' | 'HOUSEHOLD' | null;
  logoutUser: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTenantId,
  setActiveTenantId,
  tenants,
  currentTenant,
  userType,
  logoutUser,
  theme,
  setTheme
}) => {
  return (
    <header className="premium-header">
      <div className="header-brand">
        <div className="brand-logo">
          <Sparkles size={20} color="#000000" strokeWidth={2.5} />
        </div>
        <div>
          <div className="flex-row-center">
            <span className="brand-title">SmartTax<span style={{ color: 'var(--accent-lime)' }}>.AI</span></span>
            <span className="badge badge-lime" style={{ fontSize: '9px' }}>🇻🇳 VN PLATFORM</span>
          </div>
          <p className="brand-subtitle">Tài chính & Thuế Tối ưu</p>
        </div>
      </div>

      <div className="tenant-selector-wrapper">
        <Building2 size={18} color="var(--accent-lime)" />
        <div className="tenant-info">
          <span className="tenant-label">Đơn vị Hạch toán</span>
          <select 
            value={activeTenantId} 
            onChange={(e) => setActiveTenantId(e.target.value)}
            className="tenant-select"
            disabled={userType !== null} // Lock tenant dropdown in authenticated mode for isolation
          >
            {tenants.map(t => (
              <option key={t.id} value={t.id}>
                {t.companyName} • [{t.accountingRegime}]
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '12px', marginLeft: '4px' }}>
          <span className="tenant-label" style={{ display: 'block' }}>Mã số thuế</span>
          <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 700 }} className="font-mono">
            {currentTenant.taxCode}
          </span>
        </div>
      </div>

      <div className="header-widgets">
        <div className="status-pill" style={{ display: 'flex' }}>
          <span className="live-indicator"></span>
          <span style={{ color: 'var(--text-muted)' }}>Cổng GDT:</span>
          <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>Đã đồng bộ</span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span style={{ color: 'var(--accent-lime)', fontWeight: 700 }}>SmartCA Chờ ký</span>
        </div>

        <div className="user-profile-badge">
          <div className="avatar-ring" style={{ borderColor: userType === 'SME' ? 'var(--accent-purple)' : 'var(--accent-lime)' }}>
            <div className="avatar-inner" style={{ backgroundColor: userType === 'SME' ? 'var(--accent-purple)' : 'var(--accent-lime)' }}>
              {userType === 'SME' ? 'DN' : 'HK'}
            </div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
              {userType === 'SME' ? 'Doanh nghiệp (SME)' : 'Hộ kinh doanh'}
            </p>
            <span style={{ fontSize: '10px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              {userType === 'SME' ? 'Chế độ TT133' : 'Chế độ TT88'}
            </span>
          </div>
          
          {/* Theme Toggle Button */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? "Chuyển sang Giao diện Sáng" : "Chuyển sang Giao diện Tối"}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: theme === 'dark' ? 'var(--accent-lime)' : 'var(--accent-purple)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '6px',
              marginLeft: '8px',
              borderRadius: '50%',
              backgroundColor: theme === 'dark' ? 'rgba(204,255,0,0.05)' : 'rgba(157,0,255,0.05)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(204,255,0,0.15)' : 'rgba(157,0,255,0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(204,255,0,0.05)' : 'rgba(157,0,255,0.05)')}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Logout Button */}
          <button 
            onClick={logoutUser}
            title="Đăng xuất"
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#ff4444', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '6px',
              marginLeft: '12px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,68,68,0.05)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,68,68,0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,68,68,0.05)')}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};
