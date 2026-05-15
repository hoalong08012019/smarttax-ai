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
      <div className="sidebar-title">Bảng điều khiển</div>
      
      <button 
        onClick={() => setActiveTab('overview')}
        className={`sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}
      >
        <div className="sidebar-btn-left">
          <Cpu size={16} />
          <span>Dashboard Tổng quan</span>
        </div>
      </button>

      <button 
        onClick={() => setActiveTab('sync')}
        className={`sidebar-btn ${activeTab === 'sync' ? 'active' : ''}`}
      >
        <div className="sidebar-btn-left">
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          <span>GDT Sync & OCR Hóa đơn</span>
        </div>
        <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', backgroundColor: activeTab === 'sync' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)' }}>
          Auto
        </span>
      </button>

      <button 
        onClick={() => setActiveTab('accounting')}
        className={`sidebar-btn ${activeTab === 'accounting' ? 'active' : ''}`}
      >
        <div className="sidebar-btn-left">
          <FileSpreadsheet size={16} />
          <span>AI Kế toán & Sổ sách</span>
        </div>
      </button>

      <button 
        onClick={() => setActiveTab('radar')}
        className={`sidebar-btn ${activeTab === 'radar' ? 'active' : ''}`}
      >
        <div className="sidebar-btn-left">
          <AlertTriangle size={16} color={activeTab === 'radar' ? '#000000' : 'var(--accent-amber)'} />
          <span>Radar Rủi ro Thuế</span>
        </div>
        <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', backgroundColor: activeTab === 'radar' ? 'rgba(0,0,0,0.1)' : 'rgba(255,170,0,0.1)', color: activeTab === 'radar' ? '#000000' : 'var(--accent-amber)' }}>
          3 Báo động
        </span>
      </button>

      <button 
        onClick={() => setActiveTab('reporting')}
        className={`sidebar-btn ${activeTab === 'reporting' ? 'active' : ''}`}
      >
        <div className="sidebar-btn-left">
          <FileText size={16} />
          <span>Báo cáo & Xuất XML</span>
        </div>
      </button>

      <button 
        onClick={() => setActiveTab('advisor')}
        className={`sidebar-btn ${activeTab === 'advisor' ? 'active' : ''}`}
      >
        <div className="sidebar-btn-left">
          <MessageSquare size={16} color={activeTab === 'advisor' ? '#000000' : 'var(--accent-purple)'} />
          <span>AI Tax Advisor (RAG)</span>
        </div>
        <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', backgroundColor: activeTab === 'advisor' ? 'rgba(0,0,0,0.1)' : 'rgba(157,0,255,0.15)', color: activeTab === 'advisor' ? '#000000' : '#d4a6ff' }}>
          pgvector
        </span>
      </button>
    </aside>
  );
};
