import React, { useState } from 'react';
import { 
  FileText, 
  FileCode, 
  CheckCircle2, 
  Layers,
  Sparkles,
  RefreshCw,
  Usb,
  ShieldCheck,
  Lock,
  Unlock,
  X
} from 'lucide-react';
import type { Tenant } from '../../mockData';
import { formatCurrency } from '../../utils/formatters';
import { useDigitalSignature } from '../../hooks/useDigitalSignature';

interface ReportingViewProps {
  tenant: Tenant;
  selectedDeclarationForm: string;
  setSelectedDeclarationForm: (form: string) => void;
  reportPeriodType: 'MONTH' | 'QUARTER' | 'YEAR';
  setReportPeriodType: (type: 'MONTH' | 'QUARTER' | 'YEAR') => void;
  reportPeriodValue: string;
  setReportPeriodValue: (val: string) => void;
  isGeneratingReport: boolean;
  handleCalculateDynamicReport: () => void;
  generatedReportSummary: any;
  handleDownloadXml: () => void;
}

export const ReportingView: React.FC<ReportingViewProps> = ({
  tenant,
  selectedDeclarationForm,
  setSelectedDeclarationForm,
  reportPeriodType,
  setReportPeriodType,
  reportPeriodValue,
  setReportPeriodValue,
  isGeneratingReport,
  handleCalculateDynamicReport,
  generatedReportSummary,
  handleDownloadXml
}) => {
  const ds = useDigitalSignature();
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    try {
      setError(null);
      await ds.verifyPinAndSign('<XML_CONTENT_PLACEHOLDER>');
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
      
      {/* PIN DIALOG OVERLAY */}
      {ds.showPinDialog && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="content-card animate-fade-in" style={{ width: '100%', maxWidth: '380px', border: ds.remainingAttempts === 1 ? '1px solid #ff4444' : '1px solid var(--accent-lime)' }}>
            <div className="flex-row-between" style={{ marginBottom: '20px' }}>
              <div className="flex-row-center" style={{ gap: '10px' }}>
                <Lock size={18} color={ds.remainingAttempts === 1 ? '#ff4444' : 'var(--accent-lime)'} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Xác thực PIN USB Token</h3>
              </div>
              <button onClick={() => ds.setShowPinDialog(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Thiết bị: <strong style={{ color: '#ffffff' }}>{ds.deviceName}</strong>
            </p>

            <div style={{ marginBottom: '16px' }}>
              <input 
                type="password" 
                value={ds.pinInput}
                onChange={(e) => ds.setPinInput(e.target.value)}
                placeholder="Nhập mã PIN Token"
                style={{ width: '100%', padding: '12px', borderRadius: '6px', backgroundColor: '#000000', border: '1px solid var(--border-color)', color: ds.remainingAttempts === 1 ? '#ff4444' : 'var(--accent-lime)', fontSize: '14px', textAlign: 'center', letterSpacing: '0.5em' }}
                autoFocus
              />
              <div className="flex-row-between" style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Gợi ý PIN: 123456</span>
                <span style={{ fontSize: '10px', color: ds.remainingAttempts === 1 ? '#ff4444' : 'var(--text-muted)', fontWeight: 700 }}>
                  Còn {ds.remainingAttempts} lần thử
                </span>
              </div>
            </div>

            {error && (
              <div style={{ padding: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,51,51,0.1)', border: '1px solid rgba(255,51,51,0.2)', fontSize: '11px', color: '#ff4444', marginBottom: '16px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button 
              onClick={handleSign}
              disabled={ds.isSigning || !ds.pinInput}
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '12px', backgroundColor: ds.remainingAttempts === 1 ? '#ff4444' : '' }}
            >
              {ds.isSigning ? <RefreshCw size={14} className="animate-spin" /> : <Unlock size={14} />}
              <span>{ds.isSigning ? 'Đang thực hiện ký số...' : 'Xác nhận Ký số XML'}</span>
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div className="content-card">
          <div className="flex-row-center" style={{ gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="#ffffff" />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Thiết lập Kỳ Báo cáo & Mẫu biểu</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <select 
              value={selectedDeclarationForm}
              onChange={(e) => setSelectedDeclarationForm(e.target.value)}
              className="input-premium"
              style={{ padding: '10px' }}
            >
              <option value="01/GTGT">01/GTGT - Tờ khai thuế GTGT (SME)</option>
              <option value="04/GTGT">04/GTGT - Tờ khai thuế GTGT (Trực tiếp)</option>
              <option value="01/CNKD">01/CNKD - Tờ khai Hộ kinh doanh (TT88)</option>
              <option value="05/KK-TNCN">05/KK-TNCN - Tờ khai khấu trừ thuế TNCN</option>
              <option value="03/TNDN">03/TNDN - Quyết toán thuế TNDN năm</option>
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <select 
                value={reportPeriodType}
                onChange={(e) => setReportPeriodType(e.target.value as any)}
                className="input-premium"
                style={{ padding: '10px' }}
              >
                <option value="MONTH">Theo Tháng</option>
                <option value="QUARTER">Theo Quý</option>
                <option value="YEAR">Theo Năm</option>
              </select>
              <input 
                type="text" 
                value={reportPeriodValue}
                onChange={(e) => setReportPeriodValue(e.target.value)}
                placeholder="Kỳ"
                className="input-premium"
                style={{ padding: '10px', textAlign: 'center' }}
              />
            </div>

            <button 
              onClick={handleCalculateDynamicReport}
              disabled={isGeneratingReport}
              className="btn-primary" 
              style={{ width: '100%', marginTop: '8px', justifyContent: 'center', padding: '12px' }}
            >
              <RefreshCw size={14} className={isGeneratingReport ? 'animate-spin' : ''} />
              <span>{isGeneratingReport ? 'Đang tổng hợp...' : 'Kết xuất Dữ liệu Kế toán'}</span>
            </button>
          </div>
        </div>

        {/* DIGITAL SIGNATURE BRIDGE PANEL */}
        <div className="content-card" style={{ border: ds.isConnected ? '1px solid rgba(204,255,0,0.3)' : '1px solid var(--border-color)' }}>
          <div className="flex-row-between" style={{ marginBottom: '16px' }}>
            <div className="flex-row-center" style={{ gap: '10px' }}>
              <Usb size={18} color={ds.isConnected ? 'var(--accent-lime)' : 'var(--text-muted)'} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Cầu nối Ký số USB Token</h3>
            </div>
            {ds.isConnected && <span className="live-indicator"></span>}
          </div>

          {!ds.isConnected ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Chưa phát hiện thiết bị ký số vật lý (PKCS#11).
              </p>
              <button 
                onClick={ds.requestToken}
                disabled={ds.isConnecting}
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {ds.isConnecting ? <RefreshCw size={14} className="animate-spin" /> : <Usb size={14} />}
                <span>{ds.isConnecting ? 'Đang quét thiết bị HID...' : 'Quét & Kết nối USB Token'}</span>
              </button>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
                <div className="flex-row-between" style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thiết bị:</span>
                  <span style={{ fontSize: '11px', color: 'var(--accent-lime)', fontWeight: 700 }}>{ds.deviceName}</span>
                </div>
                <div className="flex-row-between">
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trạng thái:</span>
                  <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 700 }}>Sẵn sàng (Online)</span>
                </div>
              </div>
              <button 
                onClick={ds.disconnectToken}
                style={{ width: '100%', background: 'none', border: '1px solid rgba(255,51,51,0.2)', color: '#ff4444', fontSize: '10px', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Ngắt kết nối thiết bị
              </button>
            </div>
          )}
        </div>

      </div>

      <div className="content-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <div className="flex-row-between" style={{ marginBottom: '20px' }}>
            <div className="flex-row-center" style={{ gap: '10px' }}>
              <Sparkles size={20} color="var(--accent-lime)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>Bản thảo Tờ khai Thuế AI</h3>
            </div>
            <div className={`badge ${ds.lastSignedAt ? 'badge-lime' : 'badge-amber'}`}>
              {ds.lastSignedAt ? 'ĐÃ KÝ SỐ' : 'CHỜ KÝ SỐ'}
            </div>
          </div>

          {generatedReportSummary ? (
            <div className="animate-fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Doanh thu tính thuế</span>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>{formatCurrency(generatedReportSummary.totalRevenueBase)}</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Thuế suất trung bình</span>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-cyan)' }}>{tenant.accountingRegime === 'TT133' ? '10%' : '1.5%'}</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.1)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tổng thuế phải nộp</span>
                  <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent-lime)' }}>{formatCurrency(generatedReportSummary.payableVat + generatedReportSummary.payableCitOrPit)}</p>
                </div>
              </div>

              {ds.lastSignedAt && (
                <div className="animate-fade-in" style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(0,229,153,0.05)', border: '1px solid rgba(0,229,153,0.2)', marginBottom: '24px' }}>
                  <div className="flex-row-center" style={{ gap: '8px', marginBottom: '8px' }}>
                    <ShieldCheck size={16} color="var(--accent-emerald)" />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Chứng thư số xác thực:</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Đã ký bởi: <strong>{ds.deviceName}</strong><br />
                    Thời gian: {ds.lastSignedAt}<br />
                    Mã giao dịch GDT: <span className="font-mono">SIG-8812-TX-AI</span>
                  </p>
                </div>
              )}

              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#000000', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
                <div className="flex-row-center" style={{ gap: '8px', marginBottom: '8px' }}>
                  <CheckCircle2 size={16} color="var(--accent-emerald)" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Nhật ký đối soát AI:</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {generatedReportSummary.verifiedLog}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, flexDirection: 'column', gap: '16px', padding: '60px 0' }}>
              <Layers size={48} />
              <p style={{ fontSize: '14px', fontWeight: 500 }}>Chưa có dữ liệu kỳ báo cáo</p>
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleDownloadXml}
            className="btn-secondary" 
            style={{ flex: 1, justifyContent: 'center', padding: '14px' }}
          >
            <FileCode size={16} />
            <span>Tải XML (Bản thảo)</span>
          </button>
          <button 
            onClick={ds.openPinDialog}
            disabled={!ds.isConnected || ds.lastSignedAt !== null || !generatedReportSummary}
            className="btn-primary" 
            style={{ flex: 1, justifyContent: 'center', padding: '14px' }}
          >
            <Unlock size={16} />
            <span>Ký số & Nộp Tờ khai</span>
          </button>
        </div>
      </div>

    </div>
  );
};
