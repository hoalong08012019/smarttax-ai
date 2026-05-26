import React, { useState } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Check,
  RefreshCw,
  ArrowRight,
  Info
} from 'lucide-react';
import type { Invoice, JournalEntry, AccountingAuditIssue, Tenant } from '../../mockData';
import { formatCurrency } from '../../utils/formatters';

interface AccountingViewProps {
  currentInvoices: Invoice[];
  currentJournals: JournalEntry[];
  tenant: Tenant;
  
  // New props for AI Auditing
  accountingFileName: string | null;
  accountingAuditStatus: 'IDLE' | 'AUDITING' | 'COMPLETED';
  accountingAuditIssues: AccountingAuditIssue[];
  handleRunAccountingAudit: () => void;
  handleFixAuditIssue: (issueId: string) => void;
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  currentInvoices,
  currentJournals,
  tenant,
  accountingFileName,
  accountingAuditStatus,
  accountingAuditIssues,
  handleRunAccountingAudit,
  handleFixAuditIssue
}) => {
  const [subView, setSubView] = useState<'ledger' | 'audit'>('ledger');

  const activeIssues = accountingAuditIssues.filter(i => i.status === 'ACTIVE');
  const resolvedIssues = accountingAuditIssues.filter(i => i.status === 'RESOLVED');

  return (
    <div className="animate-fade-in">
      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => setSubView('ledger')}
          className={`btn-secondary ${subView === 'ledger' ? 'active' : ''}`} 
          style={{ padding: '10px 24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Layers size={14} />
          <span>Sổ Cái & Nhật Ký Chung</span>
        </button>
        <button 
          onClick={() => setSubView('audit')}
          className={`btn-secondary ${subView === 'audit' ? 'active' : ''}`}
          style={{ 
            padding: '10px 24px', 
            fontSize: '13px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            borderColor: subView === 'audit' ? 'var(--accent-purple)' : 'rgba(157,0,255,0.2)' 
          }}
        >
          <Cpu size={14} color={subView === 'audit' ? '' : '#d4a6ff'} />
          <span style={{ color: subView === 'audit' ? '' : '#d4a6ff' }}>Kiểm toán AI (AI Ledger Auditor)</span>
          {accountingAuditStatus === 'COMPLETED' && activeIssues.length > 0 && (
            <span style={{ backgroundColor: '#ff4444', color: '#ffffff', fontSize: '10px', padding: '2px 6px', borderRadius: '50%', fontWeight: 'bold' }}>
              {activeIssues.length}
            </span>
          )}
        </button>
      </div>

      {subView === 'ledger' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.9fr', gap: '24px' }}>
          {/* LEDGER TIMELINE */}
          <div className="content-card">
            <div className="flex-row-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Dòng thời gian Hạch toán Tự động</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tất cả các bút toán đã được AI chuẩn hóa</span>
            </div>
            
            <div className="accounting-table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <table className="accounting-table">
                <thead>
                  <tr style={{ position: 'sticky', top: 0, backgroundColor: '#06070a', zIndex: 10 }}>
                    <th>Ngày</th>
                    <th>Mô tả Bút toán</th>
                    <th>Nợ</th>
                    <th>Có</th>
                    <th style={{ textAlign: 'right' }}>Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {currentJournals.map(je => (
                    <tr key={je.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{je.date}</td>
                      <td>
                        <div className="flex-row-center" style={{ gap: '6px' }}>
                          {je.isAutomated && <CheckCircle2 size={12} color="var(--accent-emerald)" />}
                          <span style={{ fontWeight: 500 }}>{je.description}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--accent-lime)', fontWeight: 700 }}>{je.debitAccount}</td>
                      <td style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{je.creditAccount}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(je.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* INVOICES */}
          <div className="content-card">
            <div className="flex-row-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Quản lý Hóa đơn Thực tế</h3>
              <div className="badge badge-lime" style={{ fontSize: '10px' }}>GDT MATCHED</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {currentInvoices.map(inv => (
                <div key={inv.id} style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex-row-between" style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }} className="font-mono">{inv.symbol} | No.{inv.number}</span>
                    <span className={`badge ${inv.type === 'INCOMING' ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '9px' }}>
                      {inv.type === 'INCOMING' ? 'MUA VÀO' : 'BÁN RA'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>{inv.counterpartName}</p>
                  <div className="flex-row-between">
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-lime)' }}>{formatCurrency(inv.totalAmount)}</span>
                    {inv.riskStatus !== 'SAFE' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff4444' }}>
                        <AlertTriangle size={12} />
                        <span style={{ fontSize: '10px', fontWeight: 700 }}>RỦI RO</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* AI AUDIT VIEW */
        <div className="content-card animate-fade-in" style={{ minHeight: '400px' }}>
          {!accountingFileName ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
              <ShieldAlert size={64} color="var(--text-muted)" style={{ marginBottom: '20px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>Chưa nạp tệp sổ sách kế toán</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '24px', lineHeight: 1.5 }}>
                Bộ kiểm toán AI cần tệp Bảng cân đối phát sinh hoặc Sổ cái chi tiết được nạp để phân tích rủi ro định khoản và tuân thủ.
              </p>
              <button 
                onClick={() => {
                  const btn = document.querySelector('button[onClick*="sync"]');
                  if (btn) (btn as HTMLButtonElement).click();
                }}
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span>Đi đến trang nạp tệp sổ sách</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : accountingAuditStatus === 'IDLE' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', textAlign: 'center' }}>
              <Cpu size={56} color="var(--accent-purple)" className="animate-pulse" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>Sổ sách đã nạp: {accountingFileName}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '450px', marginBottom: '24px', lineHeight: 1.5 }}>
                Bộ rà soát AI đã phân tích cấu trúc cột của tệp. Sẵn sàng thực hiện đối chiếu chéo số dư đầu kỳ, phát sinh và số cuối kỳ đối với chế độ kế toán <strong>{tenant.accountingRegime === 'TT133' ? 'Thông tư 133/2016/TT-BTC' : 'Thông tư 88/2021/TT-BTC'}</strong>.
              </p>
              <button 
                onClick={handleRunAccountingAudit} 
                className="btn-primary font-bold" 
                style={{ padding: '14px 32px', fontSize: '14px', borderRadius: '30px', boxShadow: '0 4px 20px rgba(157,0,255,0.4)', border: '1px solid var(--accent-purple)' }}
              >
                <span>Chạy Kiểm Toán & Rà Soát Lỗi AI</span>
              </button>
            </div>
          ) : accountingAuditStatus === 'AUDITING' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
              <div className="animate-spin" style={{ marginBottom: '24px' }}>
                <RefreshCw size={48} color="var(--accent-purple)" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>AI đang rà soát từng dòng bút toán...</h3>
              <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <div>[1] Đang quét hệ thống mã tài khoản (Chart of Accounts)...</div>
                <div>[2] Đang so khớp với dữ liệu hóa đơn điện tử GDT...</div>
                <div>[3] Đang đối chiếu hạn mức quy định chi phí được trừ...</div>
              </div>
            </div>
          ) : (
            /* AUDIT RESULTS COMPLETED */
            <div className="animate-fade-in">
              <div className="flex-row-between" style={{ paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>Báo cáo Kiểm toán tự động từ SmartTax AI</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Tệp phân tích: <strong>{accountingFileName}</strong> | Phát hiện <strong>{activeIssues.length} vấn đề cần xử lý</strong>
                  </p>
                </div>
                
                <div className="flex-row-center" style={{ gap: '10px' }}>
                  <div style={{ padding: '6px 12px', borderRadius: '4px', backgroundColor: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.15)', fontSize: '11px', color: '#ff4444', fontWeight: 700 }}>
                    {activeIssues.filter(i => i.level === 'CRITICAL').length} Lỗi nghiêm trọng
                  </div>
                  <div style={{ padding: '6px 12px', borderRadius: '4px', backgroundColor: 'rgba(255,170,0,0.08)', border: '1px solid rgba(255,170,0,0.15)', fontSize: '11px', color: 'var(--accent-amber)', fontWeight: 700 }}>
                    {activeIssues.filter(i => i.level === 'WARNING').length} Cảnh báo
                  </div>
                  {resolvedIssues.length > 0 && (
                    <div style={{ padding: '6px 12px', borderRadius: '4px', backgroundColor: 'rgba(0,224,128,0.08)', border: '1px solid rgba(0,224,128,0.15)', fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                      ✓ Đã sửa {resolvedIssues.length}
                    </div>
                  )}
                </div>
              </div>

              {/* LIST OF ISSUES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {accountingAuditIssues.map(issue => {
                  const isResolved = issue.status === 'RESOLVED';
                  return (
                    <div 
                      key={issue.id} 
                      style={{ 
                        padding: '16px', 
                        borderRadius: '12px', 
                        backgroundColor: isResolved ? 'rgba(0,229,153,0.02)' : 'rgba(255,255,255,0.02)',
                        border: isResolved ? '1px solid rgba(0,229,153,0.15)' : `1px solid ${issue.level === 'CRITICAL' ? 'rgba(255,51,51,0.15)' : 'rgba(255,255,255,0.05)'}`,
                        borderLeft: isResolved ? '4px solid var(--accent-emerald)' : `4px solid ${issue.level === 'CRITICAL' ? '#ff4444' : (issue.level === 'WARNING' ? 'var(--accent-amber)' : 'var(--accent-cyan)')}`,
                        transition: 'all 0.3s'
                      }}
                    >
                      <div className="flex-row-between" style={{ marginBottom: '8px' }}>
                        <div className="flex-row-center" style={{ gap: '10px' }}>
                          <span 
                            style={{ 
                              padding: '2px 6px', 
                              borderRadius: '3px', 
                              backgroundColor: isResolved ? 'rgba(0,229,153,0.1)' : (issue.level === 'CRITICAL' ? 'rgba(255,51,51,0.1)' : 'rgba(255,170,0,0.1)'),
                              color: isResolved ? 'var(--accent-emerald)' : (issue.level === 'CRITICAL' ? '#ff4444' : 'var(--accent-amber)'),
                              fontSize: '9px', 
                              fontWeight: 900 
                            }}
                          >
                            {isResolved ? 'RESOLVED' : issue.level}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: isResolved ? 'var(--text-muted)' : '#ffffff' }}>
                            {issue.title}
                          </span>
                        </div>
                        
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="font-mono">
                          Giá trị: {formatCurrency(issue.affectedValue)}
                        </span>
                      </div>

                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                        {issue.description}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '16px', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                          <Info size={13} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontStyle: 'italic', lineHeight: 1.4 }}>
                            <strong>Căn cứ:</strong> {issue.lawBasis}
                          </span>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          {!isResolved ? (
                            <button 
                              onClick={() => handleFixAuditIssue(issue.id)}
                              className="btn-primary" 
                              style={{ 
                                padding: '8px 16px', 
                                fontSize: '11px', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                backgroundColor: 'rgba(157,0,255,0.2)', 
                                border: '1px solid var(--accent-purple)',
                                color: '#ffffff'
                              }}
                            >
                              <Cpu size={12} />
                              <span>Sửa lỗi tự động bằng AI</span>
                            </button>
                          ) : (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontSize: '12px', fontWeight: 700 }}>
                              <Check size={14} />
                              <span>Đã hiệu chỉnh sổ sách</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AUDIT SUMMARY SUCCESS */}
              {activeIssues.length === 0 ? (
                <div style={{ padding: '24px', borderRadius: '8px', backgroundColor: 'rgba(0,229,153,0.04)', border: '1px solid rgba(0,229,153,0.15)', display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <ShieldCheck size={36} color="var(--accent-emerald)" />
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Hoàn tất kiểm soát sổ sách kế toán doanh nghiệp!</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Mọi lỗi định khoản, tài khoản chế độ kế toán và lỗi thanh toán tiền mặt vượt mức đã được sửa đổi và đưa về trạng thái tuân thủ 100%. Bạn có thể yên tâm tiến hành kết xuất báo cáo thuế ở tab tiếp theo.
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(255,170,0,0.03)', border: '1px solid rgba(255,170,0,0.1)', display: 'flex', gap: '10px' }}>
                  <AlertTriangle size={18} color="var(--accent-amber)" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    <strong>Khuyến nghị kế toán AI:</strong> Bạn hãy phê duyệt tính năng "Sửa lỗi tự động bằng AI" để hệ thống tự ghi nhận bút toán điều chỉnh bổ sung, phân loại lại tài khoản kế toán lỗi trước khi bấm ký số nộp tờ khai.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
