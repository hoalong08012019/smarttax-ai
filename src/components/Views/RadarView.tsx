import React, { useState } from 'react';
import { 
  AlertTriangle,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Check,
  Building2,
  Users,
  Info
} from 'lucide-react';
import type { RiskAlert, PayrollEmployee, InternalControlIssue } from '../../mockData';
import { formatCurrency } from '../../utils/formatters';

interface RadarViewProps {
  alerts: RiskAlert[];
  riskFilter: 'ALL' | 'CRITICAL' | 'WARNING' | 'INFO';
  setRiskFilter: (filter: 'ALL' | 'CRITICAL' | 'WARNING' | 'INFO') => void;
  
  // New props for Internal Control
  payrollEmployees: PayrollEmployee[];
  internalControlStatus: 'IDLE' | 'SCANNING' | 'COMPLETED';
  internalControlIssues: InternalControlIssue[];
  handleRunInternalControlScan: () => void;
  handleApplyPayrollOptimization: () => void;
  handleInjectCashLoan: () => void;
  handleExcludeBlacklistInvoice: (issueId: string) => void;
}

export const RadarView: React.FC<RadarViewProps> = ({
  alerts,
  riskFilter,
  setRiskFilter,
  payrollEmployees,
  internalControlStatus,
  internalControlIssues,
  handleRunInternalControlScan,
  handleApplyPayrollOptimization,
  handleInjectCashLoan,
  handleExcludeBlacklistInvoice
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'alerts' | 'control'>('control');

  const filteredAlerts = riskFilter === 'ALL' ? alerts : alerts.filter(a => a.level === riskFilter);

  // Dynamic Compliance Health Score calculation
  const getComplianceScore = () => {
    let baseScore = 78;
    if (internalControlStatus === 'COMPLETED') {
      const resolvedCash = internalControlIssues.find(i => i.category === 'CASH_STOCK' && i.status === 'RESOLVED');
      const resolvedPayroll = internalControlIssues.find(i => i.category === 'PAYROLL' && i.status === 'RESOLVED');
      const resolvedBlacklist = internalControlIssues.find(i => i.category === 'BLACKLIST' && i.status === 'RESOLVED');

      if (resolvedCash) baseScore += 7;
      if (resolvedPayroll) baseScore += 6;
      if (resolvedBlacklist) baseScore += 7;
    } else {
      // Prior to running scan, we assume default status
      baseScore = 84;
    }
    return Math.min(100, baseScore);
  };

  const currentScore = getComplianceScore();

  return (
    <div className="animate-fade-in">
      
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveSubTab('control')}
          className={`btn-secondary ${activeSubTab === 'control' ? 'active' : ''}`}
          style={{ padding: '10px 24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', borderColor: activeSubTab === 'control' ? 'var(--accent-purple)' : 'rgba(157,0,255,0.2)' }}
        >
          <Cpu size={14} color={activeSubTab === 'control' ? '' : '#d4a6ff'} />
          <span style={{ color: activeSubTab === 'control' ? '' : '#d4a6ff' }}>Kiểm soát Nội bộ (AI Chief Internal Control)</span>
        </button>
        <button 
          onClick={() => setActiveSubTab('alerts')}
          className={`btn-secondary ${activeSubTab === 'alerts' ? 'active' : ''}`}
          style={{ padding: '10px 24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <AlertTriangle size={14} />
          <span>Danh sách Cảnh báo Rủi ro ({alerts.length})</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        
        {/* LEFT COLUMN: ACTIVE TAB CONTENT */}
        <div>
          {activeSubTab === 'alerts' ? (
            /* GENERAL RISK ALERTS TAB */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setRiskFilter(f)}
                    className={`btn-secondary ${riskFilter === f ? 'active' : ''}`}
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                  >
                    <span>{f === 'ALL' ? 'Tất cả' : f}</span>
                  </button>
                ))}
              </div>

              {filteredAlerts.map(alert => (
                <div key={alert.id} className="content-card" style={{ borderLeft: `4px solid ${alert.level === 'CRITICAL' ? '#ff4444' : (alert.level === 'WARNING' ? 'var(--accent-amber)' : 'var(--accent-cyan)')}` }}>
                  <div className="flex-row-between" style={{ marginBottom: '12px' }}>
                    <div className="flex-row-center" style={{ gap: '8px' }}>
                      <AlertTriangle size={18} color={alert.level === 'CRITICAL' ? '#ff4444' : 'var(--accent-amber)'} />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>{alert.title}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{alert.timestamp}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>{alert.description}</p>
                  
                  <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex-row-center" style={{ gap: '6px', marginBottom: '6px' }}>
                      <ShieldCheck size={14} color="var(--accent-emerald)" />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-emerald)' }}>Khuyến nghị từ Kế toán trưởng AI:</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#ffffff', lineHeight: 1.4 }}>{alert.recommendation}</p>
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
          ) : (
            /* AI INTERNAL CONTROL TAB */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {internalControlStatus === 'IDLE' && (
                <div className="content-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Cpu size={48} color="var(--accent-purple)" className="animate-pulse" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>Bộ máy giám sát dữ liệu Kế toán trưởng AI</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                    Hệ thống sẽ thực hiện quét kiểm toán nội bộ độc lập bao gồm đối chiếu số dư mặt/kho hàng hóa, cơ cấu bảng lương nhân sự và rà soát doanh nghiệp rủi ro cao từ cổng Tổng cục Thuế.
                  </p>
                  <button 
                    onClick={handleRunInternalControlScan} 
                    className="btn-primary" 
                    style={{ padding: '12px 30px', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    <span>Khởi chạy Kiểm soát Nội bộ</span>
                  </button>
                </div>
              )}

              {internalControlStatus === 'SCANNING' && (
                <div className="content-card" style={{ textAlign: 'center', padding: '80px 20px' }}>
                  <div className="animate-spin" style={{ marginBottom: '20px' }}>
                    <RefreshCw size={44} color="var(--accent-purple)" />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>AI đang rà soát dữ liệu kiểm toán nội bộ...</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Đang đối chiếu số dư TK 1111, Sổ S2 và mã số thuế cơ quan quản lý...</p>
                </div>
              )}

              {internalControlStatus === 'COMPLETED' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Category 1: CASH & STOCK */}
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-lime)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={16} />
                      <span>1. Kiểm soát Quỹ tiền mặt & Kho hàng hóa</span>
                    </h4>
                    {internalControlIssues.filter(i => i.category === 'CASH_STOCK').map(issue => {
                      const isResolved = issue.status === 'RESOLVED';
                      return (
                        <div key={issue.id} style={{ padding: '12px', borderRadius: '8px', backgroundColor: isResolved ? 'rgba(0,229,153,0.01)' : 'rgba(255,51,51,0.02)', border: isResolved ? '1px solid rgba(0,229,153,0.1)' : '1px solid rgba(255,51,51,0.1)', borderLeft: `3px solid ${isResolved ? 'var(--accent-emerald)' : '#ff4444'}`, marginBottom: '8px' }}>
                          <div className="flex-row-between" style={{ marginBottom: '4px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: isResolved ? 'var(--text-muted)' : '#ffffff' }}>{issue.title}</span>
                            <span style={{ fontSize: '10px', color: isResolved ? 'var(--accent-emerald)' : '#ff4444', fontWeight: 700 }}>
                              {isResolved ? 'ĐÃ ĐIỀU CHỈNH' : 'CHƯA XỬ LÝ'}
                            </span>
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>{issue.description}</p>
                          <div className="flex-row-between" style={{ fontSize: '10px' }}>
                            <span style={{ color: 'var(--accent-cyan)', fontStyle: 'italic' }}>Căn cứ: {issue.lawBasis}</span>
                            {!isResolved ? (
                              <button onClick={handleInjectCashLoan} className="btn-primary" style={{ padding: '4px 10px', fontSize: '9px', backgroundColor: 'rgba(157,0,255,0.1)', border: '1px solid var(--accent-purple)' }}>
                                Bù quỹ tự động (AI Loan Inject)
                              </button>
                            ) : (
                              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={12} /> Đã vay bổ sung 50,000,000đ
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Category 2: PAYROLL */}
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-purple)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} />
                      <span>2. Kiểm soát Bảng lương & Thuế TNCN / BHXH</span>
                    </h4>
                    {internalControlIssues.filter(i => i.category === 'PAYROLL').map(issue => {
                      const isResolved = issue.status === 'RESOLVED';
                      return (
                        <div key={issue.id} style={{ padding: '12px', borderRadius: '8px', backgroundColor: isResolved ? 'rgba(0,229,153,0.01)' : 'rgba(255,170,0,0.02)', border: isResolved ? '1px solid rgba(0,229,153,0.1)' : '1px solid rgba(255,170,0,0.1)', borderLeft: `3px solid ${isResolved ? 'var(--accent-emerald)' : 'var(--accent-amber)'}`, marginBottom: '8px' }}>
                          <div className="flex-row-between" style={{ marginBottom: '4px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: isResolved ? 'var(--text-muted)' : '#ffffff' }}>{issue.title}</span>
                            <span style={{ fontSize: '10px', color: isResolved ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontWeight: 700 }}>
                              {isResolved ? 'ĐÃ TỐI ƯU' : 'CẢNH BÁO'}
                            </span>
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>{issue.description}</p>
                          <div className="flex-row-between" style={{ fontSize: '10px' }}>
                            <span style={{ color: 'var(--accent-cyan)', fontStyle: 'italic' }}>Căn cứ: {issue.lawBasis}</span>
                            {!isResolved ? (
                              <button onClick={handleApplyPayrollOptimization} className="btn-primary" style={{ padding: '4px 10px', fontSize: '9px', backgroundColor: 'rgba(157,0,255,0.1)', border: '1px solid var(--accent-purple)' }}>
                                Tối ưu hóa bảng lương bằng AI
                              </button>
                            ) : (
                              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={12} /> Đã chuyển đổi phụ cấp trang phục & điện thoại
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Category 3: BLACKLIST */}
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#ff4444', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={16} />
                      <span>3. Quét Danh sách đen Doanh nghiệp rủi ro (GDT Blacklist)</span>
                    </h4>
                    {internalControlIssues.filter(i => i.category === 'BLACKLIST').map(issue => {
                      const isResolved = issue.status === 'RESOLVED';
                      return (
                        <div key={issue.id} style={{ padding: '12px', borderRadius: '8px', backgroundColor: isResolved ? 'rgba(0,229,153,0.01)' : 'rgba(255,51,51,0.03)', border: isResolved ? '1px solid rgba(0,229,153,0.1)' : '1px solid rgba(255,51,51,0.15)', borderLeft: `3px solid ${isResolved ? 'var(--accent-emerald)' : '#ff4444'}`, marginBottom: '8px' }}>
                          <div className="flex-row-between" style={{ marginBottom: '4px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: isResolved ? 'var(--text-muted)' : '#ffffff' }}>{issue.title}</span>
                            <span style={{ fontSize: '10px', color: isResolved ? 'var(--accent-emerald)' : '#ff4444', fontWeight: 700 }}>
                              {isResolved ? 'ĐÃ LOẠI TRỪ' : 'RỦI RO CAO'}
                            </span>
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>{issue.description}</p>
                          <div className="flex-row-between" style={{ fontSize: '10px' }}>
                            <span style={{ color: 'var(--accent-cyan)', fontStyle: 'italic' }}>Căn cứ: {issue.lawBasis}</span>
                            {!isResolved ? (
                              <button onClick={() => handleExcludeBlacklistInvoice(issue.id)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '9px', backgroundColor: '#ff4444', border: '1px solid #ff4444' }}>
                                Loại bỏ hóa đơn đen khỏi kê khai
                              </button>
                            ) : (
                              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={12} /> Đã loại trừ hóa đơn 120M & giảm trừ GTGT 12M
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

            </div>
          )}
        </div>

        {/* RIGHT COLUMN: COMPLIANCE INDICATOR & PAYROLL PREVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* COMPLIANCE HEALTH CHART */}
          <div className="content-card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '20px' }}>Chỉ số Sức khỏe Tuân thủ (Tax Compliance Health)</h3>
            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ 
                width: '180px', 
                height: '180px', 
                borderRadius: '50%', 
                border: '8px solid rgba(255,255,255,0.05)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexDirection: 'column',
                boxShadow: `0 0 30px rgba(${currentScore > 90 ? '0,229,153' : '255,170,0'}, 0.15)`,
                transition: 'all 0.4s'
              }}>
                <span style={{ fontSize: '48px', fontWeight: 900, color: currentScore > 90 ? 'var(--accent-emerald)' : 'var(--accent-lime)', transition: 'color 0.4s' }}>
                  {currentScore}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, marginTop: '4px' }}>
                  {currentScore > 95 ? 'TUÂN THỦ TỐI ĐA' : (currentScore > 85 ? 'ĐỘ TIN CẬY CAO' : 'CÓ RỦI RO THUẾ')}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <div className="flex-row-between">
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rủi ro Quỹ tiền mặt (Cash Liquidity)</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                  {internalControlStatus === 'COMPLETED' ? (internalControlIssues.find(i => i.id.includes('101') || i.id.includes('201'))?.status === 'RESOLVED' ? 'An toàn' : 'Âm quỹ') : 'Đang theo dõi'}
                </span>
              </div>
              <div className="flex-row-between">
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tối ưu hóa bảng lương (Payroll tax)</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                  {payrollEmployees.some(e => e.optimized) ? 'Đã tối ưu' : 'Lương cứng'}
                </span>
              </div>
              <div className="flex-row-between">
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Doanh nghiệp đen (GDT Blacklist)</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                  {internalControlStatus === 'COMPLETED' ? (internalControlIssues.find(i => i.category === 'BLACKLIST')?.status === 'RESOLVED' ? 'Đã loại trừ' : '1 Rủi ro') : 'Sạch'}
                </span>
              </div>
            </div>
          </div>

          {/* PAYROLL OPTIMIZER PREVIEW BOARD */}
          {internalControlStatus === 'COMPLETED' && (
            <div className="content-card animate-fade-in" style={{ padding: '16px' }}>
              <div className="flex-row-between" style={{ marginBottom: '12px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>Cơ cấu bảng lương & Phụ cấp miễn thuế</h4>
                {payrollEmployees.some(e => e.optimized) && (
                  <span className="badge badge-lime" style={{ fontSize: '9px' }}>AI OPTIMIZED</span>
                )}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', color: 'var(--text-secondary)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '6px' }}>Nhân viên</th>
                      <th style={{ padding: '6px', textAlign: 'right' }}>Lương Cơ Bản</th>
                      <th style={{ padding: '6px', textAlign: 'right' }}>Phụ cấp</th>
                      <th style={{ padding: '6px', textAlign: 'right' }}>Tổng Thu Nhập</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollEmployees.map(emp => {
                      const totalAllowances = emp.allowances.clothing + emp.allowances.lunch + emp.allowances.telephone + emp.allowances.other;
                      return (
                        <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '6px', color: '#ffffff', fontWeight: 600 }}>
                            {emp.name}
                            <span style={{ display: 'block', fontSize: '8px', color: 'var(--text-muted)' }}>{emp.role}</span>
                          </td>
                          <td style={{ padding: '6px', textAlign: 'right' }}>{formatCurrency(emp.baseSalary)}</td>
                          <td style={{ padding: '6px', textAlign: 'right', color: emp.optimized ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: emp.optimized ? 700 : 500 }}>
                            {totalAllowances > 0 ? formatCurrency(totalAllowances) : '-'}
                          </td>
                          <td style={{ padding: '6px', textAlign: 'right', fontWeight: 700 }}>
                            {formatCurrency(emp.baseSalary + totalAllowances)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {payrollEmployees.some(e => e.optimized) && (
                <div style={{ marginTop: '12px', padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(0,224,255,0.04)', border: '1px solid rgba(0,224,255,0.15)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Info size={12} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', lineHeight: 1.4 }}>
                    <strong>Ưu đãi TT 111/2013/TT-BTC:</strong> Đã chuyển đổi tổng cộng 11.4M thành phụ cấp miễn thuế TNCN và miễn đóng BHXH (Tiết kiệm ~2.1M/tháng cho DN).
                  </span>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
