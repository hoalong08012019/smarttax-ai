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
  X,
  ChevronRight,
  Download,
  Check,
  AlertCircle,
  ArrowLeft,
  FileDown,
  Database
} from 'lucide-react';
import type { Tenant, GdtReceipt } from '../../mockData';
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
  
  // New props for step filing
  accountingFileName: string | null;
  accountingAuditIssues: any[];
  filingStep: number;
  setFilingStep: (step: number) => void;
  filingStatus: 'DRAFT' | 'SIGNED' | 'SUBMITTED' | 'ACCEPTED';
  setFilingStatus: (status: 'DRAFT' | 'SIGNED' | 'SUBMITTED' | 'ACCEPTED') => void;
  gdtReceipt: GdtReceipt | null;
  setGdtReceipt: (receipt: GdtReceipt | null) => void;
  handleSimulateGdtFiling: () => void;

  // Autopilot props
  autopilotEnabled: boolean;
  setAutopilotEnabled: (val: boolean) => void;
  autopilotStatus: 'IDLE' | 'RUNNING' | 'COMPLETED';
  autopilotLogs: string[];
  showZaloNotification: boolean;
  setShowZaloNotification: (val: boolean) => void;
  handleRunAutopilotSimulation: () => void;
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
  handleDownloadXml,
  accountingFileName,
  accountingAuditIssues,
  filingStep,
  setFilingStep,
  filingStatus,
  setFilingStatus,
  gdtReceipt,
  setGdtReceipt,
  handleSimulateGdtFiling,
  autopilotEnabled,
  setAutopilotEnabled,
  autopilotStatus,
  autopilotLogs,
  showZaloNotification,
  setShowZaloNotification,
  handleRunAutopilotSimulation
}) => {
  const ds = useDigitalSignature();
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    try {
      setError(null);
      const xmlDraft = `<HSoThueDTu><MaSoThue>${tenant.taxCode}</MaSoThue><Report>${selectedDeclarationForm}</Report></HSoThueDTu>`;
      await ds.verifyPinAndSign(xmlDraft);
      setFilingStatus('SIGNED');
      setFilingStep(4); // Move directly to Submission tab
    } catch (e: any) {
      setError(e.message);
    }
  };

  const activeAuditIssues = accountingAuditIssues.filter(i => i.status === 'ACTIVE');

  // Trigger submission to GDT
  const handleGdtSubmit = () => {
    handleSimulateGdtFiling();
  };

  const handleResetFilingWizard = () => {
    setFilingStep(1);
    setFilingStatus('DRAFT');
    setGdtReceipt(null);
    ds.disconnectToken();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* AUTOPILOT ENGINE DASHBOARD */}
      <div className="content-card" style={{ 
        border: autopilotEnabled ? '1px solid var(--accent-purple)' : '1px solid rgba(255,255,255,0.05)',
        background: 'linear-gradient(135deg, rgba(20,10,35,0.6) 0%, rgba(10,10,15,0.8) 100%)',
        boxShadow: autopilotEnabled ? '0 0 25px rgba(157,0,255,0.15)' : 'none',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {autopilotEnabled && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #9d00ff, #00e599, #00e0ff)',
            animation: 'pulse 2s infinite'
          }}></div>
        )}

        <div className="flex-row-between" style={{ gap: '16px', flexWrap: 'wrap' }}>
          <div className="flex-row-center" style={{ gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '8px', 
              backgroundColor: autopilotEnabled ? 'rgba(157,0,255,0.15)' : 'rgba(255,255,255,0.03)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <RefreshCw size={20} color={autopilotEnabled ? 'var(--accent-purple)' : 'var(--text-muted)'} className={autopilotStatus === 'RUNNING' ? 'animate-spin' : ''} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Chế độ Kê khai Thuế Tự trị (Autopilot Mode)</span>
                <span className={`badge ${autopilotEnabled ? 'badge-purple' : 'badge-gray'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                  {autopilotEnabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                </span>
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {autopilotEnabled 
                  ? 'AI Chief Accountant đang vận hành ngầm: Tự động đối soát, kiểm toán, ký số Cloud HSM & nộp GDT.' 
                  : 'Bật chế độ tự trị để Kế toán trưởng AI tự động hoàn tất toàn bộ nghĩa vụ thuế của doanh nghiệp.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label className="switch" style={{ display: 'inline-block', width: '46px', height: '24px', position: 'relative', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={autopilotEnabled}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFilingStep(1);
                    setFilingStatus('DRAFT');
                  }
                  setAutopilotEnabled(e.target.checked);
                }}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span className="slider round" style={{
                position: 'absolute',
                cursor: 'pointer',
                inset: 0,
                backgroundColor: autopilotEnabled ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)',
                transition: '.4s',
                borderRadius: '34px',
                boxShadow: autopilotEnabled ? '0 0 10px rgba(157,0,255,0.5)' : 'none'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '18px',
                  width: '18px',
                  left: autopilotEnabled ? '24px' : '3px',
                  bottom: '3px',
                  backgroundColor: '#ffffff',
                  transition: '.4s',
                  borderRadius: '50%'
                }}></span>
              </span>
            </label>

            {autopilotEnabled && (
              <button 
                onClick={handleRunAutopilotSimulation}
                disabled={autopilotStatus === 'RUNNING'}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={12} />
                <span>Chạy giả lập chu kỳ nộp thuế</span>
              </button>
            )}
          </div>
        </div>

        {autopilotEnabled && (autopilotStatus === 'RUNNING' || autopilotLogs.length > 0) && (
          <div className="animate-fade-in" style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>LOG TIẾN TRÌNH TỰ TRỊ (CRON WORKER):</span>
              <span style={{ fontSize: '11px', color: autopilotStatus === 'RUNNING' ? 'var(--accent-purple)' : 'var(--accent-lime)', fontWeight: 800 }}>
                {autopilotStatus === 'RUNNING' ? '● ĐANG XỬ LÝ...' : '✓ HOÀN THÀNH'}
              </span>
            </div>
            
            <div className="sync-log-container" style={{ 
              maxHeight: '150px', 
              backgroundColor: '#000000', 
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'monospace',
              fontSize: '11px'
            }}>
              {autopilotLogs.map((log, i) => (
                <div key={i} className="sync-log-entry" style={{
                  color: log.includes('Thành công') || log.includes('CHẤP NHẬN') ? 'var(--accent-lime)' : 
                         log.includes('Khởi chạy') ? '#d4a6ff' : '#ffffff'
                }}>
                  <span className="sync-log-bullet" style={{
                    backgroundColor: log.includes('Thành công') || log.includes('CHẤP NHẬN') ? 'var(--accent-lime)' : 
                                     log.includes('Khởi chạy') ? 'var(--accent-purple)' : '#ffffff'
                  }}></span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4-STEP WIZARD PROGRESS BAR */}
      <div className="content-card" style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          
          {/* Progress bar background line */}
          <div style={{ position: 'absolute', top: '16px', left: '8%', right: '8%', height: '2px', backgroundColor: 'rgba(255,255,255,0.05)', zIndex: 1 }}>
            <div style={{ 
              width: `${((filingStep - 1) / 3) * 100}%`, 
              height: '100%', 
              backgroundColor: 'var(--accent-purple)', 
              transition: 'width 0.4s ease' 
            }}></div>
          </div>

          {[
            { step: 1, label: 'Đối soát số liệu' },
            { step: 2, label: 'Tối ưu thuế AI' },
            { step: 3, label: 'Ký số SmartTax' },
            { step: 4, label: 'Nộp & Biên nhận GDT' }
          ].map(s => {
            const isCompleted = filingStep > s.step || (s.step === 4 && filingStatus === 'ACCEPTED');
            const isActive = filingStep === s.step;
            return (
              <div key={s.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '20%' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  backgroundColor: isCompleted ? 'var(--accent-emerald)' : (isActive ? 'var(--accent-purple)' : '#0f111a'),
                  border: isCompleted ? 'none' : `2px solid ${isActive ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)'}`,
                  color: isCompleted || isActive ? '#ffffff' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  boxShadow: isActive ? '0 0 15px rgba(157,0,255,0.4)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  {isCompleted ? <Check size={16} color="#000000" style={{ fontWeight: 900 }} /> : s.step}
                </div>
                <span style={{ 
                  fontSize: '11px', 
                  color: isActive ? '#ffffff' : 'var(--text-muted)', 
                  fontWeight: isActive ? 800 : 500, 
                  marginTop: '8px',
                  textAlign: 'center'
                }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

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

      {/* DYNAMIC STEP CONTENT */}
      {filingStep === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
          {/* STEP 1: LEFT SETTINGS CARD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="content-card">
              <div className="flex-row-center" style={{ gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color="#ffffff" />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Cấu hình Tờ khai Thuế</h3>
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
                  <span>{isGeneratingReport ? 'Đang tổng hợp...' : 'Tổng hợp Số liệu'}</span>
                </button>
              </div>
            </div>

            {/* AUDIT WARNING CARD */}
            {accountingFileName && activeAuditIssues.length > 0 && (
              <div className="content-card animate-fade-in" style={{ border: '1px solid rgba(255,51,51,0.2)', backgroundColor: 'rgba(255,51,51,0.01)' }}>
                <div className="flex-row-center" style={{ gap: '8px', marginBottom: '8px' }}>
                  <AlertCircle size={18} color="#ff4444" />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#ff4444' }}>Cảnh báo Số liệu Sổ cái</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '12px' }}>
                  AI phát hiện sổ cái còn <strong>{activeAuditIssues.length} sai phạm định khoản</strong> chưa được sửa đổi. Kê khai số liệu này có thể tăng tỷ lệ rủi ro thanh tra thuế.
                </p>
                <button 
                  onClick={() => {
                    const btn = document.querySelector('button[onClick*="accounting"]');
                    if (btn) (btn as HTMLButtonElement).click();
                  }}
                  className="btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', fontSize: '10px', borderColor: 'rgba(255,51,51,0.2)', color: '#ff8888' }}
                >
                  <span>Đi sửa lỗi sổ cái ngay</span>
                </button>
              </div>
            )}
          </div>

          {/* STEP 1: RIGHT DECLARATION DETAIL */}
          <div className="content-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              <div className="flex-row-between" style={{ marginBottom: '20px' }}>
                <div className="flex-row-center" style={{ gap: '10px' }}>
                  <Sparkles size={20} color="var(--accent-lime)" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>Đối soát Số liệu Báo cáo Kê khai</h3>
                </div>
                <span className="badge badge-amber">BẢN THẢO DRAFT</span>
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
                      <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-cyan)' }}>{tenant.accountingRegime === 'TT133' ? '10% (Khấu trừ)' : '1.5% (Thuế khoán)'}</p>
                    </div>
                    <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.1)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tổng thuế phải nộp kỳ này</span>
                      <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent-lime)' }}>{formatCurrency(generatedReportSummary.payableVat + generatedReportSummary.payableCitOrPit)}</p>
                    </div>
                    <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Hạn chót kê khai</span>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: '#ff4444' }}>{generatedReportSummary.deadlineStr}</p>
                    </div>
                  </div>

                  <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#000000', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
                    <div className="flex-row-center" style={{ gap: '8px', marginBottom: '8px' }}>
                      <CheckCircle2 size={16} color="var(--accent-emerald)" />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Nhật ký đối soát tự động:</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {generatedReportSummary.verifiedLog}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, flexDirection: 'column', gap: '16px', padding: '60px 0' }}>
                  <Layers size={48} />
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>Vui lòng bấm 'Tổng hợp Số liệu' để tạo bản thảo</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleDownloadXml}
                disabled={!generatedReportSummary}
                className="btn-secondary" 
                style={{ flex: 1, justifyContent: 'center', padding: '14px' }}
              >
                <FileCode size={16} />
                <span>Xem XML Draft</span>
              </button>
              <button 
                onClick={() => setFilingStep(2)}
                disabled={!generatedReportSummary}
                className="btn-primary" 
                style={{ flex: 1, justifyContent: 'center', padding: '14px', gap: '8px' }}
              >
                <span>Chạy Tối ưu AI</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {filingStep === 2 && (
        /* STEP 2: AI OPTIMIZATION PANEL */
        <div className="content-card animate-fade-in">
          <div className="flex-row-between" style={{ paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
            <div className="flex-row-center" style={{ gap: '10px' }}>
              <Sparkles size={20} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>Hệ thống Tối ưu & Phòng vệ Thuế AI (AI Tax Guard)</h3>
            </div>
            <span className="badge badge-lime" style={{ color: 'var(--accent-emerald)', borderColor: 'rgba(0,229,153,0.3)', backgroundColor: 'rgba(0,229,153,0.05)' }}>
              ✓ ĐÃ TỐI ƯU TUÂN THỦ
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            Bộ máy AI rà soát luật đã kiểm tra tờ khai GTGT/TNDN với các quy định thuế Việt Nam hiện hành. Dưới đây là các khuyến nghị tối ưu hóa chi phí được trừ và điều chỉnh nghĩa vụ thuế hợp pháp:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {tenant.accountingRegime === 'TT133' ? (
              <>
                <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(0,224,128,0.02)', border: '1px solid rgba(0,224,128,0.15)', borderLeft: '4px solid var(--accent-emerald)' }}>
                  <div className="flex-row-between" style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff' }}>Loại trừ chi phí không thanh toán qua ngân hàng</span>
                    <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 700 }}>Hoàn thành</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Bút toán chi mua văn phòng phẩm Đại Dương 24.5M bằng tiền mặt đã được AI đề xuất chuyển đổi sang ủy nhiệm chi ngân hàng hợp lệ. Giúp doanh nghiệp bảo toàn khấu trừ thuế GTGT 2,450,000 VND và bảo toàn chi phí được trừ khi tính thuế TNDN, tránh bị loại trừ chi phí (tiết kiệm ước tính 4,900,000 VND tiền thuế TNDN).
                  </p>
                </div>
                
                <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(0,224,128,0.02)', border: '1px solid rgba(0,224,128,0.15)', borderLeft: '4px solid var(--accent-emerald)' }}>
                  <div className="flex-row-between" style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff' }}>Khấu trừ Thuế GTGT đầu vào hợp lệ 100%</span>
                    <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 700 }}>Hoàn thành</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Đối chiếu 100% khớp hóa đơn gốc từ cơ sở dữ liệu Tổng cục Thuế. Thuế GTGT đầu vào được khấu trừ kỳ này là 12,500,000 VND. Không phát hiện hóa đơn đầu vào từ doanh nghiệp bỏ trốn/ngừng hoạt động trong kỳ khai báo này.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(0,224,128,0.02)', border: '1px solid rgba(0,224,128,0.15)', borderLeft: '4px solid var(--accent-emerald)' }}>
                  <div className="flex-row-between" style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff' }}>Áp tỷ lệ thuế khoán chuẩn theo nhóm ngành thương mại</span>
                    <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 700 }}>Hoàn thành</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Áp dụng đúng Thông tư 40/2021/TT-BTC: Phân tách doanh thu bán hàng tiêu dùng chịu mức thuế suất khoán 1.5% GTGT + 0.5% TNCN. Doanh thu dịch vụ ăn uống chịu mức 3% GTGT + 1.5% TNCN. Giúp hộ kinh doanh kê khai đúng, giảm thiểu nguy cơ nộp thừa do gộp chung doanh thu.
                  </p>
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
            <button 
              onClick={() => setFilingStep(1)}
              className="btn-secondary" 
              style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={16} />
              <span>Quay lại bước 1</span>
            </button>
            <button 
              onClick={() => setFilingStep(3)}
              className="btn-primary" 
              style={{ padding: '12px 30px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>Tiến hành Ký số Tờ khai</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {filingStep === 3 && (
        /* STEP 3: DIGITAL SIGNATURE PANEL */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
          {/* DIGITAL SIGNATURE CONTROLS */}
          <div className="content-card" style={{ border: ds.isConnected ? '1px solid rgba(157,0,255,0.3)' : '1px solid var(--border-color)' }}>
            <div className="flex-row-between" style={{ marginBottom: '16px' }}>
              <div className="flex-row-center" style={{ gap: '10px' }}>
                <Usb size={18} color={ds.isConnected ? 'var(--accent-purple)' : 'var(--text-muted)'} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Cầu nối Ký số SmartTax Bridge</h3>
              </div>
              {ds.isConnected && <span className="live-indicator" style={{ backgroundColor: 'var(--accent-purple)' }}></span>}
            </div>

            {!ds.isConnected ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 0' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                  Vui lòng lựa chọn phương thức kết nối chứng thư số của bạn để tiến hành ký tệp XML tờ khai điện tử:
                </p>
                <button 
                  onClick={() => ds.requestToken('USB_TOKEN')}
                  disabled={ds.isConnecting}
                  className="btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                >
                  <Usb size={14} />
                  <span>Ký số bằng USB Token (PKCS#11)</span>
                </button>
                <button 
                  onClick={() => ds.requestToken('SMART_CA')}
                  disabled={ds.isConnecting}
                  className="btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', borderColor: 'rgba(157,0,255,0.2)' }}
                >
                  <Sparkles size={14} color="#d4a6ff" />
                  <span style={{ color: '#d4a6ff' }}>Ký số bằng SmartCA (Remote Signing)</span>
                </button>
                <button 
                  onClick={() => ds.requestToken('SMART_CA')}
                  disabled={ds.isConnecting}
                  className="btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', borderColor: 'rgba(0,224,255,0.2)' }}
                >
                  <Database size={14} color="var(--accent-cyan)" />
                  <span style={{ color: 'var(--accent-cyan)' }}>Ký số không chạm Cloud HSM (Autopilot khuyên dùng)</span>
                </button>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(157,0,255,0.1)', marginBottom: '16px' }}>
                  <div style={{ marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>CHỨNG THƯ ĐANG KẾT NỐI:</span>
                    <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700 }}>{ds.certInfo?.subject}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>Nhà Cung Cấp:</span>
                      <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 600 }}>{ds.certInfo?.issuer}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>Số Serial:</span>
                      <span style={{ fontSize: '11px', color: '#ffffff', fontFamily: 'monospace' }}>{ds.certInfo?.serialNumber}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={ds.disconnectToken}
                    style={{ flex: 1, background: 'none', border: '1px solid rgba(255,51,51,0.2)', color: '#ff4444', fontSize: '11px', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Ngắt kết nối
                  </button>
                  <button 
                    onClick={ds.openPinDialog}
                    disabled={filingStatus === 'SIGNED'}
                    className="btn-primary"
                    style={{ flex: 2, justifyContent: 'center' }}
                  >
                    <Unlock size={14} />
                    <span>Yêu cầu ký số XML</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DRAFT TO SIGN CARD */}
          <div className="content-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              <div className="flex-row-between" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Hồ sơ tờ khai chờ ký số</h3>
                <span className={`badge ${filingStatus === 'SIGNED' ? 'badge-lime' : 'badge-amber'}`}>
                  {filingStatus === 'SIGNED' ? 'ĐÃ KÝ SỐ' : 'CHỜ KÝ SỐ'}
                </span>
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mẫu biểu kê khai:</span>
                  <strong style={{ color: '#ffffff' }}>{selectedDeclarationForm}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mã số thuế nộp:</span>
                  <strong style={{ color: '#ffffff' }}>{tenant.taxCode}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Đơn vị nộp thuế:</span>
                  <strong style={{ color: '#ffffff' }}>{tenant.companyName}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Kỳ báo cáo:</span>
                  <strong style={{ color: '#ffffff' }}>{generatedReportSummary?.periodText}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Số tiền thuế nộp:</span>
                  <strong style={{ color: 'var(--accent-lime)' }}>{formatCurrency(generatedReportSummary?.payableVat + (generatedReportSummary?.payableCitOrPit || 0))}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Định dạng file:</span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>XML (Chuẩn XSD Tổng cục Thuế)</strong>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setFilingStep(2)}
                className="btn-secondary" 
                style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={16} />
                <span>Quay lại</span>
              </button>
              
              <button 
                onClick={() => {
                  setFilingStep(4);
                }}
                disabled={filingStatus !== 'SIGNED'}
                className="btn-primary" 
                style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
              >
                <span>Nộp tờ khai sang GDT</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {filingStep === 4 && (
        /* STEP 4: GDT GATEWAY SIMULATION & RECEIPT */
        <div className="content-card animate-fade-in" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
          {filingStatus === 'SIGNED' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 0', textAlign: 'center' }}>
              <RefreshCw size={48} className="animate-spin" color="var(--accent-purple)" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>Tờ khai đã sẵn sàng để gửi</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', marginBottom: '24px', lineHeight: 1.5 }}>
                Tờ khai thuế đã được ký số hợp lệ bằng chứng thư số của bạn. Bấm nút bên dưới để truyền nhận file XML trực tiếp sang Gateway của Tổng cục Thuế Việt Nam thông qua kênh T-VAN.
              </p>
              <button 
                onClick={handleGdtSubmit} 
                className="btn-primary" 
                style={{ padding: '12px 36px', fontSize: '13px', fontWeight: 700 }}
              >
                <span>Nộp Tờ Khai Lên Tổng Cục Thuế</span>
              </button>
            </div>
          ) : filingStatus === 'SUBMITTED' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 0', textAlign: 'center' }}>
              <div className="animate-spin" style={{ marginBottom: '20px' }}>
                <RefreshCw size={48} color="var(--accent-cyan)" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '6px' }}>Đang truyền tải dữ liệu tờ khai ký số...</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '300px' }}>
                Hệ thống TVAN đang mã hóa và gửi gói tin XML tờ khai sang hệ thống eGP của Tổng cục Thuế. Vui lòng không đóng cửa sổ.
              </p>
            </div>
          ) : (
            /* ACCEPTED - DISPLAY TAX RECEIPT */
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="flex-row-between" style={{ paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                <div className="flex-row-center" style={{ gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0,229,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={18} color="var(--accent-emerald)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>Kết quả Khai báo: ĐÃ CHẤP NHẬN TỜ KHAI</h3>
                    <p style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 600 }}>Cơ quan thuế quản lý trực tiếp đã ghi nhận nghĩa vụ thuế thành công</p>
                  </div>
                </div>
                <span className="badge badge-lime">SUCCESS</span>
              </div>

              {/* GDT TAX RECEIPT TEMPLATE */}
              {gdtReceipt && (
                <div style={{ 
                  backgroundColor: 'rgba(0,0,0,0.4)', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: '#ffffff',
                  boxShadow: 'inset 0 0 20px rgba(255,255,255,0.01)',
                  marginBottom: '24px',
                  position: 'relative'
                }}>
                  {/* Decorative stamp watermark */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '20px', 
                    right: '30px', 
                    border: '3px double #00e599', 
                    color: '#00e599', 
                    padding: '8px 12px', 
                    borderRadius: '6px', 
                    fontWeight: 900, 
                    fontSize: '11px', 
                    transform: 'rotate(15deg)', 
                    opacity: 0.75,
                    fontFamily: 'monospace' 
                  }}>
                    GDT ACCEPTED
                  </div>

                  <div style={{ textAlign: 'center', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'block', fontWeight: 800 }}>TỔNG CỤC THUẾ VIỆT NAM</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', marginTop: '4px', display: 'block' }}>THÔNG BÁO TIẾP NHẬN & CHẤP NHẬN HỒ SƠ KHAI THUẾ ĐIỆN TỬ</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '12px', fontSize: '12px', lineHeight: 1.6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Mã số thông báo:</span>
                    <strong style={{ color: '#ffffff' }} className="font-mono">{gdtReceipt.receiptNumber}</strong>

                    <span style={{ color: 'var(--text-muted)' }}>Mã số thuế NNT:</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{gdtReceipt.taxCode}</span>

                    <span style={{ color: 'var(--text-muted)' }}>Tên người nộp thuế:</span>
                    <strong style={{ color: '#ffffff' }}>{gdtReceipt.companyName}</strong>

                    <span style={{ color: 'var(--text-muted)' }}>Hồ sơ khai thuế:</span>
                    <span style={{ color: '#ffffff' }}>{gdtReceipt.declarationType}</span>

                    <span style={{ color: 'var(--text-muted)' }}>Kỳ tính thuế:</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{gdtReceipt.period}</span>

                    <span style={{ color: 'var(--text-muted)' }}>Thời gian tiếp nhận:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{gdtReceipt.receivedDate}</span>

                    <span style={{ color: 'var(--text-muted)' }}>Cơ quan thuế nhận:</span>
                    <span style={{ color: '#ffffff' }}>{gdtReceipt.gdtCode}</span>

                    <span style={{ color: 'var(--text-muted)' }}>Mã nộp tiền NSNN:</span>
                    <strong style={{ color: 'var(--accent-lime)' }} className="font-mono">{gdtReceipt.paymentCode}</strong>

                    <span style={{ color: 'var(--text-muted)' }}>Mã chữ ký SHA256:</span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '10px', wordBreak: 'break-all' }}>{gdtReceipt.xmlHash}</span>
                  </div>

                  <div style={{ 
                    marginTop: '20px', 
                    paddingTop: '16px', 
                    borderTop: '1px dashed rgba(255,255,255,0.1)', 
                    backgroundColor: 'rgba(0,229,153,0.03)', 
                    border: '1px solid rgba(0,229,153,0.1)', 
                    borderRadius: '6px',
                    padding: '12px',
                    fontSize: '11px',
                    color: '#ffffff',
                    lineHeight: 1.5
                  }}>
                    <strong>Phản hồi chính thức từ GDT:</strong><br />
                    {gdtReceipt.acceptanceMessage}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                <button 
                  onClick={handleDownloadXml}
                  className="btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                >
                  <Download size={14} />
                  <span>Tải XML Hồ Sơ Gốc</span>
                </button>
                <button 
                  onClick={() => {
                    // Open a simulated print PDF window or alerts
                    alert('Đang kết xuất thông báo thuế PDF chính thức...');
                  }}
                  className="btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                >
                  <FileDown size={14} />
                  <span>Tải Thông báo PDF</span>
                </button>
                <button 
                  onClick={handleResetFilingWizard}
                  className="btn-primary" 
                  style={{ flex: 1.2, justifyContent: 'center', padding: '12px', gap: '8px' }}
                >
                  <RefreshCw size={14} />
                  <span>Khởi động phiên mới</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SMARTPHONE ZALO NOTIFICATION MODAL */}
      {showZaloNotification && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0,0,0,0.8)', 
          backdropFilter: 'blur(5px)', 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div className="animate-fade-in" style={{ 
            width: '320px', 
            height: '560px', 
            borderRadius: '36px', 
            border: '6px solid #222222', 
            backgroundColor: '#070708', 
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 30px rgba(157,0,255,0.3)',
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Phone notch */}
            <div style={{ 
              width: '120px', 
              height: '18px', 
              backgroundColor: '#222222', 
              position: 'absolute', 
              top: 0, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              borderBottomLeftRadius: '12px', 
              borderBottomRightRadius: '12px',
              zIndex: 10
            }}></div>

            {/* Phone status bar */}
            <div style={{ 
              padding: '12px 24px 4px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              fontSize: '10px', 
              color: 'var(--text-secondary)',
              backgroundColor: '#0c0d14',
              zIndex: 2
            }}>
              <span>19:40</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* App Header (Zalo Style) */}
            <div style={{ 
              padding: '10px 16px', 
              backgroundColor: '#0068ff', 
              color: '#ffffff', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                width: '30px', 
                height: '30px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>S</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>SmartTax AI Assistant</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.8)' }}>Tin nhắn hệ thống tự động</div>
              </div>
            </div>

            {/* Chat Body */}
            <div style={{ 
              flex: 1, 
              padding: '12px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px', 
              overflowY: 'auto',
              backgroundImage: 'radial-gradient(circle at center, #10111a 0%, #070708 100%)'
            }}>
              {/* Timestamp bubble */}
              <div style={{ alignSelf: 'center', fontSize: '9px', color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.02)', padding: '2px 8px', borderRadius: '10px' }}>
                Hôm nay 19:40
              </div>

              {/* Chat Message Bubble */}
              <div className="animate-fade-in" style={{ 
                alignSelf: 'flex-start', 
                maxWidth: '85%', 
                backgroundColor: '#1b223c', 
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '0 16px 16px 16px', 
                padding: '12px', 
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                <span style={{ fontSize: '11px', color: '#ffb300', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                  📢 BÁO CÁO KÊ KHAI TỰ ĐỘNG
                </span>
                
                <p style={{ fontSize: '11px', lineHeight: 1.4, margin: 0 }}>
                  Kính gửi Quý khách <strong>{tenant.legalRepresentative}</strong>,<br />
                  AI Kế toán trưởng SmartTax báo cáo kết quả kê khai tự trị kỳ nộp thuế này:<br /><br />
                  • <strong>Tờ khai</strong>: {selectedDeclarationForm}<br />
                  • <strong>Kỳ nộp</strong>: {generatedReportSummary?.periodText || 'Tháng 04/2026'}<br />
                  • <strong>Phương thức ký</strong>: Ký số Cloud HSM (Từ xa)<br />
                  • <strong>Trạng thái GDT</strong>: <span style={{ color: 'var(--accent-lime)', fontWeight: 800 }}>ĐÃ CHẤP NHẬN</span><br />
                  • <strong>Mã biên nhận</strong>: BT-GDT-98218<br />
                  • <strong>Nghĩa vụ thuế</strong>: <strong style={{ color: 'var(--accent-lime)' }}>{formatCurrency((generatedReportSummary?.payableVat || 0) + (generatedReportSummary?.payableCitOrPit || 0))}</strong><br /><br />
                  Sổ cái của bạn đã được kiểm toán & đối soát khớp 100% dòng tiền ngân hàng Techcombank. 
                </p>
                
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button 
                    onClick={() => {
                      setShowZaloNotification(false);
                      setFilingStep(4);
                    }}
                    style={{ width: '100%', padding: '6px', backgroundColor: '#0068ff', border: 'none', borderRadius: '4px', color: '#ffffff', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Xem Biên nhận GDT chi tiết
                  </button>
                  <button 
                    onClick={handleDownloadXml}
                    style={{ width: '100%', padding: '6px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '9px', cursor: 'pointer' }}
                  >
                    Tải Tệp tờ khai XML
                  </button>
                </div>
              </div>
            </div>

            {/* Close Phone View Button */}
            <div style={{ 
              padding: '10px 16px', 
              backgroundColor: '#0c0d14', 
              borderTop: '1px solid rgba(255,255,255,0.05)', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}>
              <button 
                onClick={() => setShowZaloNotification(false)}
                className="btn-secondary" 
                style={{ padding: '6px 20px', fontSize: '10px', borderRadius: '20px' }}
              >
                Đóng màn hình điện thoại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
