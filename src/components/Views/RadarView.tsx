import React from 'react';
import { 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { RiskAlert } from '../../mockData';

interface RadarViewProps {
  alerts: RiskAlert[];
  riskFilter: 'ALL' | 'CRITICAL' | 'WARNING' | 'INFO';
  setRiskFilter: (filter: 'ALL' | 'CRITICAL' | 'WARNING' | 'INFO') => void;
}

export const RadarView: React.FC<RadarViewProps> = ({
  alerts,
  riskFilter,
  setRiskFilter
}) => {
  const filteredAlerts = riskFilter === 'ALL' ? alerts : alerts.filter(a => a.level === riskFilter);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(f => (
          <button 
            key={f}
            onClick={() => setRiskFilter(f)}
            className={`btn-secondary ${riskFilter === f ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            <span>{f === 'ALL' ? 'Tất cả' : f}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredAlerts.map(alert => (
            <div key={alert.id} className="content-card" style={{ borderLeft: `4px solid ${alert.level === 'CRITICAL' ? '#ff4444' : (alert.level === 'WARNING' ? 'var(--accent-amber)' : 'var(--accent-cyan)')}` }}>
              <div className="flex-row-between" style={{ marginBottom: '12px' }}>
                <div className="flex-row-center" style={{ gap: '8px' }}>
                  <AlertTriangle size={18} color={alert.level === 'CRITICAL' ? '#ff4444' : 'var(--accent-amber)'} />
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>{alert.title}</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{alert.timestamp}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>{alert.description}</p>
              
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex-row-center" style={{ gap: '6px', marginBottom: '6px' }}>
                  <ShieldCheck size={14} color="var(--accent-emerald)" />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-emerald)' }}>Khuyến nghị từ SmartTax AI:</span>
                </div>
                <p style={{ fontSize: '12px', color: '#ffffff', lineHeight: 1.4 }}>{alert.recommendation}</p>
              </div>
            </div>
          ))}
          {filteredAlerts.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>
              <ShieldCheck size={48} style={{ marginBottom: '16px' }} />
              <p>Không tìm thấy rủi ro nào trong bộ lọc này.</p>
            </div>
          )}
        </div>

        <div className="content-card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '20px' }}>Chỉ số Sức khỏe Tuân thủ</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ width: '200px', height: '200px', borderRadius: '50%', border: '8px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '42px', fontWeight: 900, color: 'var(--accent-lime)' }}>84</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>TỐT (HEALTHY)</span>
            </div>
            {/* Simulated Radar Spikes */}
            <div style={{ position: 'absolute', top: '10%', left: '50%', width: '2px', height: '100px', backgroundColor: 'var(--accent-lime)', transform: 'rotate(0deg)', opacity: 0.3 }}></div>
            <div style={{ position: 'absolute', top: '25%', left: '75%', width: '2px', height: '80px', backgroundColor: '#ff4444', transform: 'rotate(45deg)', opacity: 0.6 }}></div>
            <div style={{ position: 'absolute', top: '50%', left: '85%', width: '2px', height: '110px', backgroundColor: 'var(--accent-lime)', transform: 'rotate(90deg)', opacity: 0.3 }}></div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <div className="flex-row-between">
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rủi ro Đối tác (Vendors)</span>
              <div style={{ width: '150px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                <div style={{ width: '35%', height: '100%', backgroundColor: '#ff4444', borderRadius: '3px' }}></div>
              </div>
            </div>
            <div className="flex-row-between">
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tính hợp lệ Hóa đơn (Invoices)</span>
              <div style={{ width: '150px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                <div style={{ width: '92%', height: '100%', backgroundColor: 'var(--accent-emerald)', borderRadius: '3px' }}></div>
              </div>
            </div>
            <div className="flex-row-between">
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Khai báo & Nộp thuế (Compliance)</span>
              <div style={{ width: '150px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                <div style={{ width: '78%', height: '100%', backgroundColor: 'var(--accent-lime)', borderRadius: '3px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
