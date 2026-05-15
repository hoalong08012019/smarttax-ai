import { Sparkles, Building2 } from 'lucide-react';
import type { Tenant } from '../../mockData';

interface HeaderProps {
  activeTenantId: string;
  setActiveTenantId: (id: string) => void;
  tenants: Tenant[];
  currentTenant: Tenant;
}

export const Header: React.FC<HeaderProps> = ({
  activeTenantId,
  setActiveTenantId,
  tenants,
  currentTenant
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
          <div className="avatar-ring">
            <div className="avatar-inner">CG</div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>Chuyên gia Thuế</p>
            <span style={{ fontSize: '10px', color: 'var(--accent-emerald)', fontWeight: 600 }}>Kế toán trưởng AI</span>
          </div>
        </div>
      </div>
    </header>
  );
};
