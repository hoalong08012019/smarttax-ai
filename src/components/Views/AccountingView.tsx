import React from 'react';
import { 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import type { Invoice, JournalEntry, Tenant } from '../../mockData';
import { formatCurrency } from '../../utils/formatters';

interface AccountingViewProps {
  currentInvoices: Invoice[];
  currentJournals: JournalEntry[];
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  currentInvoices,
  currentJournals
}) => {
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button className="btn-secondary active" style={{ padding: '8px 20px' }}>
          <Layers size={14} />
          <span>Sổ Cái & Nhật Ký Chung</span>
        </button>
        <button className="btn-secondary" style={{ padding: '8px 20px' }}>
          <BookOpen size={14} />
          <span>Sổ Chi Tiết & Công Nợ</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <div className="content-card">
          <div className="flex-row-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Dòng thời gian Hạch toán Tự động</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tất cả các bút toán đã được AI chuẩn hóa</span>
          </div>
          
          <div className="accounting-table-wrapper">
            <table className="accounting-table">
              <thead>
                <tr>
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
                    <td>{je.creditAccount}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(je.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="content-card">
          <div className="flex-row-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Quản lý Hóa đơn Thực tế</h3>
            <div className="badge badge-lime" style={{ fontSize: '10px' }}>GDT MATCHED</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
    </div>
  );
};
