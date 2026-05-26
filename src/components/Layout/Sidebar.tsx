import React from 'react';
import { 
  Cpu, 
  RefreshCw, 
  FileSpreadsheet, 
  AlertTriangle, 
  FileText, 
  MessageSquare 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSyncing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isSyncing
}) => {
  return (
    <aside className="sidebar-panel">
      <div className="sidebar-title">Menu chức năng</div>
      
      <button 
        onClick={() => setActiveTab('overview')}
        className={`sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}
        style={{ display: 'flex', alignItems: 'center', padding: '10px 14px' }}
      >
        <div className="sidebar-btn-left" style={{ alignItems: 'flex-start' }}>
          <Cpu size={16} style={{ marginTop: '2px' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ lineHeight: 1.2 }}>Trang Chủ (Xem Nhanh)</span>
            <span style={{ fontSize: '10px', color: activeTab === 'overview' ? '#333333' : 'var(--text-muted)', marginTop: '2px', lineHeight: 1.1, fontWeight: 500 }}>
              Báo cáo & số liệu hôm nay
            </span>
          </div>
        </div>
      </button>

      <button 
        onClick={() => setActiveTab('sync')}
        className={`sidebar-btn ${activeTab === 'sync' ? 'active' : ''}`}
        style={{ display: 'flex', alignItems: 'center', padding: '10px 14px' }}
      >
        <div className="sidebar-btn-left" style={{ alignItems: 'flex-start' }}>
          <RefreshCw size={16} style={{ marginTop: '2px' }} className={isSyncing ? 'animate-spin' : ''} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ lineHeight: 1.2 }}>Nạp Hóa Đơn & Sao Kê</span>
            <span style={{ fontSize: '10px', color: activeTab === 'sync' ? '#333333' : 'var(--text-muted)', marginTop: '2px', lineHeight: 1.1, fontWeight: 500 }}>
              Tải hóa đơn & sao kê bank
            </span>
          </div>
        </div>
        <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', backgroundColor: activeTab === 'sync' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)', color: activeTab === 'sync' ? '#000000' : '' }} className="font-mono">
          Auto
        </span>
      </button>

      <button 
        onClick={() => setActiveTab('accounting')}
        className={`sidebar-btn ${activeTab === 'accounting' ? 'active' : ''}`}
        style={{ display: 'flex', alignItems: 'center', padding: '10px 14px' }}
      >
        <div className="sidebar-btn-left" style={{ alignItems: 'flex-start' }}>
          <FileSpreadsheet size={16} style={{ marginTop: '2px' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ lineHeight: 1.2 }}>Kiểm Tra Lỗi Sổ Sách</span>
            <span style={{ fontSize: '10px', color: activeTab === 'accounting' ? '#333333' : 'var(--text-muted)', marginTop: '2px', lineHeight: 1.1, fontWeight: 500 }}>
              AI tự phát hiện & sửa lỗi
            </span>
          </div>
        </div>
      </button>

      <button 
        onClick={() => setActiveTab('radar')}
        className={`sidebar-btn ${activeTab === 'radar' ? 'active' : ''}`}
        style={{ display: 'flex', alignItems: 'center', padding: '10px 14px' }}
      >
        <div className="sidebar-btn-left" style={{ alignItems: 'flex-start' }}>
          <AlertTriangle size={16} style={{ marginTop: '2px' }} color={activeTab === 'radar' ? '#000000' : 'var(--accent-amber)'} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ lineHeight: 1.2 }}>Radar Cảnh Báo Thuế</span>
            <span style={{ fontSize: '10px', color: activeTab === 'radar' ? '#333333' : 'var(--text-muted)', marginTop: '2px', lineHeight: 1.1, fontWeight: 500 }}>
              Quỹ, lương & hóa đơn đen
            </span>
          </div>
        </div>
        <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', backgroundColor: activeTab === 'radar' ? 'rgba(0,0,0,0.1)' : 'rgba(255,170,0,0.1)', color: activeTab === 'radar' ? '#000000' : 'var(--accent-amber)', fontWeight: 700 }}>
          Chú ý
        </span>
      </button>

      <button 
        onClick={() => setActiveTab('reporting')}
        className={`sidebar-btn ${activeTab === 'reporting' ? 'active' : ''}`}
        style={{ display: 'flex', alignItems: 'center', padding: '10px 14px' }}
      >
        <div className="sidebar-btn-left" style={{ alignItems: 'flex-start' }}>
          <FileText size={16} style={{ marginTop: '2px' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ lineHeight: 1.2 }}>Nộp Tờ Khai Thuế</span>
            <span style={{ fontSize: '10px', color: activeTab === 'reporting' ? '#333333' : 'var(--text-muted)', marginTop: '2px', lineHeight: 1.1, fontWeight: 500 }}>
              Ký số & Nộp cổng GDT
            </span>
          </div>
        </div>
      </button>

      <button 
        onClick={() => setActiveTab('advisor')}
        className={`sidebar-btn ${activeTab === 'advisor' ? 'active' : ''}`}
        style={{ display: 'flex', alignItems: 'center', padding: '10px 14px' }}
      >
        <div className="sidebar-btn-left" style={{ alignItems: 'flex-start' }}>
          <MessageSquare size={16} style={{ marginTop: '2px' }} color={activeTab === 'advisor' ? '#000000' : 'var(--accent-purple)'} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ lineHeight: 1.2 }}>Hỏi Đáp Luật Thuế AI</span>
            <span style={{ fontSize: '10px', color: activeTab === 'advisor' ? '#333333' : 'var(--text-muted)', marginTop: '2px', lineHeight: 1.1, fontWeight: 500 }}>
              Tư vấn luật chính thống
            </span>
          </div>
        </div>
      </button>
    </aside>
  );
};
