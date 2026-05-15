import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight
} from 'lucide-react';
import type { Tenant, RiskAlert } from '../../mockData';
import { formatCurrency } from '../../utils/formatters';

interface OverviewProps {
  tenant: Tenant;
  alerts: RiskAlert[];
  setActiveTab: (tab: string) => void;
  setRiskFilter: (filter: 'ALL' | 'CRITICAL' | 'WARNING' | 'INFO') => void;
}

export const Overview: React.FC<OverviewProps> = ({
  tenant,
  alerts,
  setActiveTab,
  setRiskFilter
}) => {
  return (
    <div className="animate-fade-in">
      {/* 4-Column Metric Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="flex-row-between" style={{ marginBottom: '12px' }}>
            <div className="metric-icon-box" style={{ backgroundColor: 'rgba(204,255,0,0.1)' }}>
              <ArrowUpRight size={20} color="var(--accent-lime)" />
            </div>
            <span className="metric-trend trend-up">+12.5%</span>
          </div>
          <span className="metric-label">Tổng doanh thu kỳ này</span>
          <p className="metric-value">{formatCurrency(tenant.totalRevenue)}</p>
        </div>

        <div className="metric-card">
          <div className="flex-row-between" style={{ marginBottom: '12px' }}>
            <div className="metric-icon-box" style={{ backgroundColor: 'rgba(0,255,128,0.1)' }}>
              <ArrowDownLeft size={20} color="var(--accent-emerald)" />
            </div>
            <span className="metric-trend trend-down">-5.2%</span>
          </div>
          <span className="metric-label">Tổng chi phí phát sinh</span>
          <p className="metric-value">{formatCurrency(tenant.totalExpenses)}</p>
        </div>

        <div className="metric-card">
          <div className="flex-row-between" style={{ marginBottom: '12px' }}>
            <div className="metric-icon-box" style={{ backgroundColor: 'rgba(0,224,255,0.1)' }}>
              <ShieldCheck size={20} color="var(--accent-cyan)" />
            </div>
            <span className="badge badge-cyan" style={{ fontSize: '9px' }}>XÁC THỰC</span>
          </div>
          <span className="metric-label">Thuế GTGT phải nộp</span>
          <p className="metric-value">{formatCurrency(tenant.taxLiabilities.vat)}</p>
        </div>

        <div className="metric-card highlight">
          <div className="flex-row-between" style={{ marginBottom: '12px' }}>
            <div className="metric-icon-box" style={{ backgroundColor: '#000000' }}>
              <AlertTriangle size={20} color="var(--accent-amber)" />
            </div>
          </div>
          <span className="metric-label" style={{ color: 'rgba(0,0,0,0.6)' }}>Radar rủi ro</span>
          <p className="metric-value" style={{ color: '#000000' }}>3 Cảnh báo</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
        <div className="content-card">
          <div className="flex-row-between" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>Xu hướng Tài chính Doanh nghiệp</h3>
            <div className="flex-row-center" style={{ gap: '12px' }}>
              <div className="flex-row-center" style={{ gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-lime)' }}></span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Doanh thu</span>
              </div>
              <div className="flex-row-center" style={{ gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }}></span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chi phí</span>
              </div>
            </div>
          </div>

          <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px', gap: '8px' }}>
            {tenant.monthlyRevenue.map((rev, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                <div style={{ width: '100%', display: 'flex', gap: '2px', alignItems: 'flex-end', height: '200px' }}>
                  <div style={{ flex: 1, height: `${(rev / 200) * 100}%`, backgroundColor: 'var(--accent-lime)', borderRadius: '2px 2px 0 0', opacity: 0.8 }}></div>
                  <div style={{ flex: 1, height: `${(tenant.monthlyExpenses[idx] / 200) * 100}%`, backgroundColor: 'var(--accent-emerald)', borderRadius: '2px 2px 0 0', opacity: 0.6 }}></div>
                </div>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>T{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>Cảnh báo mới nhất</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.slice(0, 3).map(alert => (
              <div key={alert.id} style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${alert.level === 'CRITICAL' ? '#ff4444' : 'var(--accent-amber)'}` }}>
                <div className="flex-row-between" style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: alert.level === 'CRITICAL' ? '#ff4444' : 'var(--accent-amber)' }}>{alert.level}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{alert.timestamp}</span>
                </div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', marginBottom: '4px', lineHeight: 1.3 }}>{alert.title}</p>
                <button 
                  onClick={() => {
                    setRiskFilter(alert.level);
                    setActiveTab('radar');
                  }}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent-lime)', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
