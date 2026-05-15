import { 
  RefreshCw, 
  UploadCloud, 
  CheckCircle2, 
  Download
} from 'lucide-react';
import type { Invoice } from '../../mockData';
import { formatCurrency } from '../../utils/formatters';

interface SyncViewProps {
  isSyncing: boolean;
  syncLog: string[];
  handleTriggerGdtSync: () => void;
  handleSimulateFileUpload: (name: string, type: 'INCOMING' | 'OUTGOING', amount: number) => void;
  ocrParsingStatus: 'IDLE' | 'PARSING' | 'SUCCESS';
  uploadedFileName: string | null;
  newOcrResult: Partial<Invoice> | null;
}

export const SyncView: React.FC<SyncViewProps> = ({
  isSyncing,
  syncLog,
  handleTriggerGdtSync,
  handleSimulateFileUpload,
  ocrParsingStatus,
  uploadedFileName,
  newOcrResult
}) => {
  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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
  );
};
