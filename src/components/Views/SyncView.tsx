import React, { useState } from 'react';
import { 
  RefreshCw, 
  UploadCloud, 
  CheckCircle2, 
  Download,
  FileSpreadsheet,
  Layers,
  Database,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import type { Invoice, TrialBalanceItem } from '../../mockData';
import { formatCurrency } from '../../utils/formatters';

interface SyncViewProps {
  isSyncing: boolean;
  syncLog: string[];
  handleTriggerGdtSync: () => void;
  handleSimulateFileUpload: (name: string, type: 'INCOMING' | 'OUTGOING', amount: number) => void;
  ocrParsingStatus: 'IDLE' | 'PARSING' | 'SUCCESS';
  uploadedFileName: string | null;
  newOcrResult: Partial<Invoice> | null;
  
  // New props for accounting data upload
  accountingFileName: string | null;
  accountingAuditStatus: 'IDLE' | 'AUDITING' | 'COMPLETED';
  trialBalanceData: TrialBalanceItem[];
  handleUploadAccountingFile: (name: string) => void;
}

export const SyncView: React.FC<SyncViewProps> = ({
  isSyncing,
  syncLog,
  handleTriggerGdtSync,
  handleSimulateFileUpload,
  ocrParsingStatus,
  uploadedFileName,
  newOcrResult,
  accountingFileName,
  accountingAuditStatus,
  trialBalanceData,
  handleUploadAccountingFile
}) => {
  const [subTab, setSubTab] = useState<'invoices' | 'accounting'>('invoices');
  const [isUploadingLedger, setIsUploadingLedger] = useState(false);

  const handleSimulateLedgerUpload = (fileName: string) => {
    setIsUploadingLedger(true);
    setTimeout(() => {
      handleUploadAccountingFile(fileName);
      setIsUploadingLedger(false);
    }, 1500);
  };

  return (
    <div className="animate-fade-in">
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => setSubTab('invoices')}
          className={`btn-secondary ${subTab === 'invoices' ? 'active' : ''}`}
          style={{ padding: '10px 24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          <span>Đồng bộ & Tải Hóa đơn</span>
        </button>
        <button 
          onClick={() => setSubTab('accounting')}
          className={`btn-secondary ${subTab === 'accounting' ? 'active' : ''}`}
          style={{ padding: '10px 24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FileSpreadsheet size={14} />
          <span>Nạp Dữ liệu Sổ sách Kế toán</span>
        </button>
      </div>

      {subTab === 'invoices' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* COLUMN 1: GDT SYNC LOG */}
          <div className="content-card">
            <div className="flex-row-between" style={{ marginBottom: '20px' }}>
              <div className="flex-row-center" style={{ gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(204,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={18} color="var(--accent-lime)" className={isSyncing ? 'animate-spin' : ''} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Đồng bộ Hóa đơn GDT</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Kết nối trực tiếp cổng thuedientu.gdt.gov.vn</p>
                </div>
              </div>
              <button 
                onClick={handleTriggerGdtSync}
                disabled={isSyncing}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ Ngay'}</span>
              </button>
            </div>

            <div className="sync-log-container">
              {syncLog.map((log, i) => (
                <div key={i} className="sync-log-entry">
                  <span className="sync-log-bullet"></span>
                  <span>{log}</span>
                </div>
              ))}
              {isSyncing && (
                <div className="sync-log-entry" style={{ color: 'var(--accent-lime)' }}>
                  <span className="sync-log-bullet pulse"></span>
                  <span>Đang giải mã gói tin XML...</span>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2: INVOICE OCR */}
          <div className="content-card">
            <div className="flex-row-center" style={{ gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(0,224,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UploadCloud size={18} color="var(--accent-cyan)" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>OCR & AI Parsing Hóa đơn</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tải lên file XML/PDF để tự động định khoản</p>
              </div>
            </div>

            <div className="upload-zone" style={{ borderStyle: ocrParsingStatus === 'PARSING' ? 'solid' : 'dashed' }}>
              {ocrParsingStatus === 'IDLE' ? (
                <div style={{ textAlign: 'center' }}>
                  <Download size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                  <p style={{ fontSize: '13px', color: '#ffffff', fontWeight: 600, marginBottom: '4px' }}>Kéo thả file hóa đơn vào đây</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>Hỗ trợ XML (NĐ 123), PDF, JPG</p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={() => handleSimulateFileUpload('HD_MUA_VAO_01.xml', 'INCOMING', 4500000)} className="btn-secondary" style={{ fontSize: '10px' }}>Demo Mua vào</button>
                    <button onClick={() => handleSimulateFileUpload('HD_BAN_RA_99.pdf', 'OUTGOING', 120000000)} className="btn-secondary" style={{ fontSize: '10px' }}>Demo Bán ra</button>
                  </div>
                </div>
              ) : ocrParsingStatus === 'PARSING' ? (
                <div style={{ textAlign: 'center' }}>
                  <div className="animate-spin" style={{ marginBottom: '12px' }}>
                    <RefreshCw size={32} color="var(--accent-cyan)" />
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: 700 }}>Đang trích xuất dữ liệu AI...</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>File: {uploadedFileName}</p>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="flex-row-center" style={{ gap: '8px', marginBottom: '12px', justifyContent: 'center' }}>
                    <CheckCircle2 size={20} color="var(--accent-emerald)" />
                    <span style={{ fontSize: '13px', color: 'var(--accent-emerald)', fontWeight: 700 }}>Trích xuất Thành công!</span>
                  </div>
                  
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex-row-between" style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Số hóa đơn:</span>
                      <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 700 }}>{newOcrResult?.number}</span>
                    </div>
                    <div className="flex-row-between" style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Đối tác:</span>
                      <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 700, textAlign: 'right', maxWidth: '150px' }}>{newOcrResult?.counterpartName}</span>
                    </div>
                    <div className="flex-row-between" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tổng cộng:</span>
                      <span style={{ fontSize: '11px', color: 'var(--accent-lime)', fontWeight: 800 }}>{formatCurrency(newOcrResult?.totalAmount || 0)}</span>
                    </div>
                    
                    <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 1, padding: '6px', backgroundColor: 'rgba(204,255,0,0.05)', borderRadius: '4px', textAlign: 'center' }}>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>Nợ TK</span>
                        <span style={{ fontSize: '11px', color: 'var(--accent-lime)', fontWeight: 700 }}>{newOcrResult?.suggestedDebitAcc}</span>
                      </div>
                      <div style={{ flex: 1, padding: '6px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '4px', textAlign: 'center' }}>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>Có TK</span>
                        <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 700 }}>{newOcrResult?.suggestedCreditAcc}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleSimulateFileUpload('RESET', 'INCOMING', 0)}
                    style={{ width: '100%', marginTop: '12px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '10px', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Tải file khác
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
          {/* UPLOAD LEDGER COLUMN */}
          <div className="content-card">
            <div className="flex-row-center" style={{ gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(157,0,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileSpreadsheet size={18} color="var(--accent-purple)" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Nạp File Kế Toán Doanh Nghiệp</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI tự động ánh xạ tài khoản kế toán & số phát sinh</p>
              </div>
            </div>

            <div className="upload-zone" style={{ borderStyle: isUploadingLedger ? 'solid' : 'dashed', height: '260px' }}>
              {!accountingFileName && !isUploadingLedger ? (
                <div style={{ textAlign: 'center' }}>
                  <Download size={36} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                  <p style={{ fontSize: '14px', color: '#ffffff', fontWeight: 700, marginBottom: '6px' }}>Tải lên Bảng cân đối phát sinh / Sổ Cái</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '20px' }}>Định dạng hỗ trợ: .xlsx, .xls, .csv</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
                    <button 
                      onClick={() => handleSimulateLedgerUpload('BANG_CAN_DOI_TAI_KHOAN_Q2_2026.xlsx')} 
                      className="btn-secondary"
                      style={{ fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Sparkles size={12} color="var(--accent-purple)" />
                      <span>Nạp Bảng cân đối tài khoản Demo</span>
                    </button>
                    <button 
                      onClick={() => handleSimulateLedgerUpload('SO_CAI_CHI_TIET_THUONG_MAI.xlsx')} 
                      className="btn-secondary"
                      style={{ fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Sparkles size={12} color="var(--accent-purple)" />
                      <span>Nạp Sổ cái Nhật ký chung Demo</span>
                    </button>
                  </div>
                </div>
              ) : isUploadingLedger ? (
                <div style={{ textAlign: 'center' }}>
                  <div className="animate-spin" style={{ marginBottom: '16px' }}>
                    <RefreshCw size={36} color="var(--accent-purple)" />
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--accent-purple)', fontWeight: 800 }}>AI đang ánh xạ & đối chiếu tài khoản...</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Đang chạy giải thuật cân đối hai bên Nợ - Có</p>
                </div>
              ) : (
                <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                  <CheckCircle2 size={36} color="var(--accent-emerald)" style={{ marginBottom: '12px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--accent-emerald)', fontWeight: 800, marginBottom: '4px' }}>Nạp dữ liệu Kế toán thành công!</p>
                  <p style={{ fontSize: '12px', color: '#ffffff', fontWeight: 600, wordBreak: 'break-all' }}>Tệp: {accountingFileName}</p>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <div style={{ padding: '6px 12px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.03)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      Mã tài khoản: <strong style={{ color: '#ffffff' }}>{trialBalanceData.length}</strong>
                    </div>
                    <div style={{ padding: '6px 12px', borderRadius: '4px', backgroundColor: 'rgba(157,0,255,0.05)', fontSize: '11px', color: '#d4a6ff' }}>
                      Đối chiếu: <strong style={{ color: 'var(--accent-emerald)' }}>CÂN ĐỐI (OK)</strong>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleUploadAccountingFile('RESET')}
                    style={{ width: '100%', marginTop: '20px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '11px', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Nạp tệp kế toán khác
                  </button>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
              <Info size={16} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                <strong>Lưu ý nghiệp vụ:</strong> Tệp kế toán tải lên sẽ được quét các tài khoản doanh thu (đầu 5), chi phí (đầu 6, 8) và đối chiếu với dữ liệu hóa đơn điện tử GDT để kiểm tra chênh lệch thuế.
              </p>
            </div>
          </div>

          {/* PARSED ACCOUNT DATA SUMMARY */}
          <div className="content-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="flex-row-between" style={{ marginBottom: '16px' }}>
              <div className="flex-row-center" style={{ gap: '10px' }}>
                <Database size={18} color="var(--accent-emerald)" />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Bảng Cân đối Phát sinh AI trích xuất</h3>
              </div>
              {accountingFileName && (
                <span className="badge badge-lime">
                  {accountingAuditStatus === 'COMPLETED' ? 'ĐÃ KIỂM TOÁN' : 'ĐÃ ĐỐI CHIẾU'}
                </span>
              )}
            </div>

            {accountingFileName ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, overflowY: 'auto', maxHeight: '300px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>Mã TK</th>
                        <th style={{ padding: '8px' }}>Tên Tài Khoản</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Phát sinh Nợ</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Phát sinh Có</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trialBalanceData.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '8px', fontFamily: 'monospace', fontWeight: 700, color: '#ffffff' }}>{item.accountNumber}</td>
                          <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{item.accountName}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600, color: item.periodDebit > 0 ? 'var(--accent-lime)' : 'var(--text-muted)' }}>
                            {item.periodDebit > 0 ? formatCurrency(item.periodDebit) : '-'}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600, color: item.periodCredit > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                            {item.periodCredit > 0 ? formatCurrency(item.periodCredit) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(157,0,255,0.05)', border: '1px solid rgba(157,0,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#d4a6ff', display: 'block', fontWeight: 700 }}>AI AUDIT RECOMMENDATION:</span>
                    <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 600 }}>Dữ liệu kế toán sẵn sàng để phân tích rủi ro & khai thuế.</span>
                  </div>
                  <button 
                    onClick={() => {
                      // Navigate to accounting view
                      const btn = document.querySelector('button[onClick*="accounting"]');
                      if (btn) (btn as HTMLButtonElement).click();
                    }}
                    className="btn-primary" 
                    style={{ padding: '6px 12px', fontSize: '10px' }}
                  >
                    <span>Phân tích AI</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', opacity: 0.3, border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <Layers size={48} style={{ marginBottom: '16px' }} />
                <p style={{ fontSize: '13px', fontWeight: 500 }}>Chưa nạp tệp báo cáo tài chính / số dư tài khoản</p>
                <p style={{ fontSize: '11px', textAlign: 'center', maxWidth: '280px', marginTop: '6px' }}>Vui lòng nạp tệp Excel số liệu kế toán ở cột bên trái để AI trích xuất bảng cân đối.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
