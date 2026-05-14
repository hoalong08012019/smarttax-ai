import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  RefreshCw, 
  FileText, 
  Cpu, 
  AlertTriangle, 
  FileSpreadsheet, 
  MessageSquare, 
  Database, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  UploadCloud, 
  Download, 
  Sparkles,
  FileCode,
  Layers,
  BookOpen
} from 'lucide-react';
import { 
  MOCK_TENANTS, 
  MOCK_INVOICES, 
  MOCK_JOURNALS, 
  MOCK_ALERTS, 
  MOCK_QA_KNOWLEDGE, 
  MOCK_HTKK_XML_TEMPLATES,
  EMBEDDED_KNOWLEDGE_SOURCES
} from './mockData';
import type {
  Invoice,
  JournalEntry
} from './mockData';

export default function App() {
  // Multi-tenant active state
  const [activeTenantId, setActiveTenantId] = useState<string>('t-001');
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('advisor'); // Default to advisor tab to instantly show Embedded state
  
  // Active tenant helper
  const tenant = useMemo(() => {
    return MOCK_TENANTS.find(t => t.id === activeTenantId) || MOCK_TENANTS[0];
  }, [activeTenantId]);

  // Sync state simulator
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncLog, setSyncLog] = useState<string[]>([
    'Hệ thống khởi tạo kết nối tự động...',
    'Đã tải chứng thư số SSL/TLS với Tổng cục Thuế thành công.'
  ]);
  const [localInvoices, setLocalInvoices] = useState<Record<string, Invoice[]>>(MOCK_INVOICES);
  const [localJournals, setLocalJournals] = useState<Record<string, JournalEntry[]>>(MOCK_JOURNALS);

  // OCR Upload Simulators
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [ocrParsingStatus, setOcrParsingStatus] = useState<'IDLE' | 'PARSING' | 'SUCCESS'>('IDLE');
  const [newOcrResult, setNewOcrResult] = useState<Partial<Invoice> | null>(null);

  // Risk filter state
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');

  // Reporting Form Selector
  const [selectedDeclarationForm, setSelectedDeclarationForm] = useState<string>('01/GTGT');

  // AI Advisor Custom Question & Selected Source preview
  const [selectedEmbeddedSourceId, setSelectedEmbeddedSourceId] = useState<string>('src-luat-38');
  const [customQuestionInput, setCustomQuestionInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'USER' | 'AI'; text: string; citation?: string }>>([
    {
      sender: 'USER',
      text: MOCK_QA_KNOWLEDGE[0].question
    },
    {
      sender: 'AI',
      text: MOCK_QA_KNOWLEDGE[0].shortAnswer + '\n\n' + MOCK_QA_KNOWLEDGE[0].fullAnalysis,
      citation: MOCK_QA_KNOWLEDGE[0].legalCitation
    }
  ]);

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Trigger GDT Portal Synchronization Simulator
  const handleTriggerGdtSync = () => {
    setIsSyncing(true);
    setSyncLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Bắt đầu truy vấn cổng dữ liệu GDT (Hóa đơn điện tử)...`]);
    
    setTimeout(() => {
      setSyncLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Tìm thấy 2 hóa đơn mới phát sinh từ hệ thống tra cứu GDT.`]);
      
      // Inject simulated newly synced invoice
      const newInv: Invoice = {
        id: `inv-synced-${Date.now()}`,
        type: 'INCOMING',
        symbol: '1C26TCC',
        number: `0000${Math.floor(1000 + Math.random() * 9000)}`,
        issueDate: new Date().toLocaleDateString('vi-VN'),
        counterpartTaxCode: '0311223344',
        counterpartName: 'Công ty Cổ phần Thương mại Điện tử & Vận tải Xanh',
        preTaxAmount: 45000000,
        vatRate: '10%',
        vatAmount: 4500000,
        totalAmount: 49500000,
        ocrConfidence: 1.0,
        riskStatus: 'SAFE',
        riskFlags: [],
        suggestedDebitAcc: tenant.accountingRegime === 'TT133' ? '6422' : 'Sổ chi phí dịch vụ mua ngoài',
        suggestedCreditAcc: tenant.accountingRegime === 'TT133' ? '331' : 'Thanh toán chuyển khoản'
      };

      setLocalInvoices(prev => ({
        ...prev,
        [activeTenantId]: [newInv, ...(prev[activeTenantId] || [])]
      }));

      // Inject simulated automated accounting entry
      const newEntry: JournalEntry = {
        id: `je-auto-${Date.now()}`,
        date: newInv.issueDate,
        voucherCode: `AI-GDT-${Math.floor(Math.random() * 900)}`,
        description: `Tự động hạch toán hóa đơn điện tử GDT số ${newInv.number} (${newInv.counterpartName})`,
        debitAccount: newInv.suggestedDebitAcc,
        creditAccount: newInv.suggestedCreditAcc,
        amount: newInv.totalAmount,
        isAutomated: true
      };

      setLocalJournals(prev => ({
        ...prev,
        [activeTenantId]: [newEntry, ...(prev[activeTenantId] || [])]
      }));

      setSyncLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Phân tích hóa đơn hoàn tất. Hạch toán kép tự động theo đúng chế độ ${tenant.accountingRegime === 'TT133' ? 'Thông tư 133/2016' : 'Thông tư 88/2021'}!`]);
      setIsSyncing(false);
    }, 2000);
  };

  // Simulate Drag & Drop / Uploading XML/PDF Invoice for OCR Parsing
  const handleSimulateFileUpload = (fileName: string, invType: 'INCOMING' | 'OUTGOING', amount: number) => {
    setUploadedFileName(fileName);
    setOcrParsingStatus('PARSING');
    
    setTimeout(() => {
      const parsed: Partial<Invoice> = {
        symbol: invType === 'INCOMING' ? '1C26TMM' : '1C26TNN',
        number: `0000${Math.floor(5000 + Math.random() * 4999)}`,
        counterpartName: invType === 'INCOMING' ? 'Công ty Cổ phần Đầu tư Thiết bị Văn phòng Cao Cấp' : 'Hợp đồng Tư vấn Giải pháp Phần mềm Kế toán',
        counterpartTaxCode: '0104445556',
        preTaxAmount: amount,
        vatRate: '10%',
        vatAmount: amount * 0.1,
        totalAmount: amount * 1.1,
        ocrConfidence: 0.992,
        type: invType,
        suggestedDebitAcc: tenant.accountingRegime === 'TT133' ? (invType === 'INCOMING' ? '242 / 6422' : '131') : 'Sổ chi phí',
        suggestedCreditAcc: tenant.accountingRegime === 'TT133' ? (invType === 'INCOMING' ? '331' : '5111') : 'Doanh thu'
      };
      setNewOcrResult(parsed);
      setOcrParsingStatus('SUCCESS');

      // Append directly to active invoices
      const fullInv: Invoice = {
        id: `inv-ocr-${Date.now()}`,
        type: invType,
        symbol: parsed.symbol!,
        number: parsed.number!,
        issueDate: new Date().toLocaleDateString('vi-VN'),
        counterpartTaxCode: parsed.counterpartTaxCode!,
        counterpartName: parsed.counterpartName!,
        preTaxAmount: parsed.preTaxAmount!,
        vatRate: parsed.vatRate!,
        vatAmount: parsed.vatAmount!,
        totalAmount: parsed.totalAmount!,
        ocrConfidence: parsed.ocrConfidence!,
        riskStatus: 'SAFE',
        riskFlags: [],
        suggestedDebitAcc: parsed.suggestedDebitAcc!,
        suggestedCreditAcc: parsed.suggestedCreditAcc!
      };

      setLocalInvoices(prev => ({
        ...prev,
        [activeTenantId]: [fullInv, ...(prev[activeTenantId] || [])]
      }));

      // Add simple corresponding ledger line
      const autoJe: JournalEntry = {
        id: `je-ocr-${Date.now()}`,
        date: fullInv.issueDate,
        voucherCode: `OCR-${fullInv.number}`,
        description: `Hạch toán hóa đơn điện tử OCR tải lên: ${fullInv.counterpartName}`,
        debitAccount: fullInv.suggestedDebitAcc,
        creditAccount: fullInv.suggestedCreditAcc,
        amount: fullInv.totalAmount,
        isAutomated: true
      };

      setLocalJournals(prev => ({
        ...prev,
        [activeTenantId]: [autoJe, ...(prev[activeTenantId] || [])]
      }));

    }, 1500);
  };

  // Submit custom AI question
  const handleSendCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestionInput.trim()) return;

    const userQ = customQuestionInput;
    setChatHistory(prev => [...prev, { sender: 'USER', text: userQ }]);
    setCustomQuestionInput('');

    // RAG fallback generator mapping deep queries
    setTimeout(() => {
      const lower = userQ.toLowerCase();
      // Match using the item properties so variable is read
      const matchedQA = MOCK_QA_KNOWLEDGE.find(item => 
        item.question.toLowerCase().includes(lower) || 
        (lower.includes('thời hạn') && item.tags.includes('Thời hạn nộp thuế')) ||
        (lower.includes('phân bổ') && item.tags.includes('Phân bổ thuế')) ||
        (lower.includes('quản lý doanh nghiệp') && item.tags.includes('TK 6422')) ||
        (lower.includes('xml') && item.tags.includes('Cấu trúc XML')) ||
        (lower.includes('quảng cáo') && item.tags.includes('Marketing'))
      );
      
      if (matchedQA) {
        setChatHistory(prev => [...prev, {
          sender: 'AI',
          text: `🔍 **Hệ thống RAG đã trích xuất từ Kho dữ liệu nạp (Embedding Vector)**:\n\n${matchedQA.shortAnswer}\n\n${matchedQA.fullAnalysis}`,
          citation: matchedQA.legalCitation
        }]);
      } else {
        setChatHistory(prev => [...prev, {
          sender: 'AI',
          text: `💡 **Tư vấn Trí Tuệ Nhân Tạo SmartTax AI**:\n\nCâu hỏi của bạn liên quan đến chi phí và nghĩa vụ nộp thuế của doanh nghiệp/hộ kinh doanh.\n\nCăn cứ theo nguyên tắc chung của **Luật Quản lý Thuế số 38/2019/QH14** và các văn bản hướng dẫn thi hành, mọi khoản chi phí thực tế phát sinh phục vụ hoạt động sản xuất kinh doanh có đầy đủ hóa đơn, chứng từ hợp pháp (Hóa đơn GTGT từ cổng GDT, chứng từ chuyển khoản qua ngân hàng với đơn hàng từ 20 triệu đồng) đều được coi là chi phí hợp lý được trừ.\n\nĐối với Hộ kinh doanh cá thể nộp theo phương pháp kê khai (Thông tư 88), vui lòng ghi chép đầy đủ vào Sổ chi chi tiết doanh thu và Sổ chi phí sản xuất kinh doanh tương ứng.`,
          citation: 'Luật Quản lý Thuế số 38/2019/QH14 & Các văn bản hướng dẫn thi hành'
        }]);
      }
    }, 1000);
  };

  // Trigger downloading XML file
  const handleDownloadXml = () => {
    const xmlContent = MOCK_HTKK_XML_TEMPLATES[selectedDeclarationForm] || '<?xml version="1.0"?><Error>No content</Error>';
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TKHAI_${selectedDeclarationForm.replace('/', '_')}_${tenant.taxCode}.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Current list of invoices for the selected tenant
  const currentInvoices = useMemo(() => {
    return localInvoices[activeTenantId] || [];
  }, [localInvoices, activeTenantId]);

  // Current list of ledgers for the selected tenant
  const currentJournals = useMemo(() => {
    return localJournals[activeTenantId] || [];
  }, [localJournals, activeTenantId]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    if (riskFilter === 'ALL') return MOCK_ALERTS;
    return MOCK_ALERTS.filter(a => a.level === riskFilter);
  }, [riskFilter]);

  // Active embedded source helper
  const activeEmbeddedSource = useMemo(() => {
    return EMBEDDED_KNOWLEDGE_SOURCES.find(s => s.id === selectedEmbeddedSourceId) || EMBEDDED_KNOWLEDGE_SOURCES[0];
  }, [selectedEmbeddedSourceId]);

  return (
    <div className="min-h-screen flex flex-col pb-16">
      
      {/* HEADER BANNER */}
      <header className="glass-panel border-b border-l-0 border-r-0 border-t-0 px-6 py-4 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">SmartTax AI</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-semibold border border-emerald-500/30">🇻🇳 VIETNAM</span>
            </div>
            <p className="text-xs text-gray-400">Nền tảng Kế toán & Tư vấn Thuế Thông Minh</p>
          </div>
        </div>

        {/* Multi-Tenant Switcher */}
        <div className="flex items-center gap-3 bg-gray-900/90 px-3 py-2 rounded-xl border border-gray-800">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Đơn vị / Hộ kinh doanh đang chọn</span>
            <select 
              value={activeTenantId} 
              onChange={(e) => {
                setActiveTenantId(e.target.value);
                // Clear simulated upload state when switching tenants
                setUploadedFileName(null);
                setOcrParsingStatus('IDLE');
                setNewOcrResult(null);
              }}
              className="bg-transparent text-sm font-semibold text-white outline-none cursor-pointer border-none p-0 pr-6"
            >
              {MOCK_TENANTS.map(t => (
                <option key={t.id} value={t.id} className="bg-gray-900 text-white">
                  {t.companyName} ({t.accountingRegime})
                </option>
              ))}
            </select>
          </div>
          
          <div className="ml-2 pl-2 border-l border-gray-800 flex flex-col items-end">
            <span className="text-[10px] text-gray-500">Mã số thuế</span>
            <span className="text-xs font-mono font-bold text-amber-400">{tenant.taxCode}</span>
          </div>
        </div>

        {/* Global Connection Ticker & User Widget */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/50 border border-gray-800/80 text-xs">
            <span className="live-indicator"></span>
            <span className="text-gray-400">Cổng GDT:</span>
            <span className="text-emerald-400 font-medium">Đã kết nối</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">Chữ ký số:</span>
            <span className="text-purple-400 font-medium">SmartCA Sẵn sàng</span>
          </div>

          <div className="flex items-center gap-2 pl-2">
            <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center font-bold text-purple-300 text-xs">
              CG
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-gray-200 leading-none">Chuyên gia Thuế</p>
              <span className="text-[10px] text-gray-400">Kế toán trưởng AI</span>
            </div>
          </div>
        </div>

      </header>

      {/* QUICK SYSTEM REGIME ACCENT BANNER */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-purple-950/20 to-gray-950 px-6 py-2 border-b border-gray-800/60 flex flex-wrap items-center justify-between text-xs text-gray-300 gap-2">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">Quy định áp dụng:</span>
          <span className="font-semibold text-emerald-400">
            {tenant.accountingRegime === 'TT133' 
              ? 'Thông tư 133/2016/TT-BTC dành cho Doanh nghiệp Nhỏ và Vừa (SMEs)' 
              : 'Thông tư 88/2021/TT-BTC dành cho Hộ kinh doanh, Cá nhân kinh doanh'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>Người đại diện: <strong className="text-white">{tenant.legalRepresentative}</strong></span>
          <span>•</span>
          <span>Ngành nghề: <span className="text-gray-400">{tenant.industry}</span></span>
        </div>
      </div>

      {/* BODY CONTENT CONTAINER */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 lg:px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT NAVIGATION SIDEBAR */}
        <aside className="lg:col-span-3 flex flex-col gap-2">
          <div className="glass-panel p-3 flex flex-col gap-1.5 sticky top-24">
            
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-3 pt-2 pb-1">Menu Chức Năng</p>
            
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${activeTab === 'overview' ? 'bg-gray-800/90 text-emerald-400 border-l-2 border-emerald-500 font-semibold shadow' : 'text-gray-400 hover:text-white hover:bg-gray-900/50'}`}
            >
              <Cpu className="w-4 h-4" />
              <span>📊 Dashboard Tổng quan</span>
            </button>

            <button 
              onClick={() => setActiveTab('sync')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${activeTab === 'sync' ? 'bg-gray-800/90 text-emerald-400 border-l-2 border-emerald-500 font-semibold shadow' : 'text-gray-400 hover:text-white hover:bg-gray-900/50'}`}
            >
              <div className="flex items-center gap-3">
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                <span>🔄 GDT Sync & OCR Hóa đơn</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">Auto</span>
            </button>

            <button 
              onClick={() => setActiveTab('accounting')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${activeTab === 'accounting' ? 'bg-gray-800/90 text-emerald-400 border-l-2 border-emerald-500 font-semibold shadow' : 'text-gray-400 hover:text-white hover:bg-gray-900/50'}`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>🤖 AI Kế toán & Sổ sách</span>
            </button>

            <button 
              onClick={() => setActiveTab('radar')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${activeTab === 'radar' ? 'bg-gray-800/90 text-emerald-400 border-l-2 border-emerald-500 font-semibold shadow' : 'text-gray-400 hover:text-white hover:bg-gray-900/50'}`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>⚠️ Radar Rủi ro Thuế</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">3 Cảnh báo</span>
            </button>

            <button 
              onClick={() => setActiveTab('reporting')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${activeTab === 'reporting' ? 'bg-gray-800/90 text-emerald-400 border-l-2 border-emerald-500 font-semibold shadow' : 'text-gray-400 hover:text-white hover:bg-gray-900/50'}`}
            >
              <FileText className="w-4 h-4" />
              <span>📑 Báo cáo & Xuất HTKK</span>
            </button>

            <button 
              onClick={() => setActiveTab('advisor')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${activeTab === 'advisor' ? 'bg-gray-800/90 text-purple-400 border-l-2 border-purple-500 font-semibold shadow' : 'text-gray-400 hover:text-white hover:bg-gray-900/50'}`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>🧠 AI Tax Advisor (RAG)</span>
              </div>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold">Đã nạp 4 Nguồn</span>
            </button>

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-3 pt-4 pb-1">Hệ Thống Lõi</p>
            
            <button 
              onClick={() => setActiveTab('structure')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${activeTab === 'structure' ? 'bg-gray-800/90 text-teal-400 border-l-2 border-teal-500 font-semibold shadow' : 'text-gray-400 hover:text-white hover:bg-gray-900/50'}`}
            >
              <Database className="w-4 h-4" />
              <span>🏛️ Kiến trúc & CS DL</span>
            </button>

            {/* Quick status summary */}
            <div className="mt-4 pt-3 border-t border-gray-800 px-3">
              <div className="bg-gray-900/60 rounded-lg p-2.5 border border-gray-800/70">
                <p className="text-[11px] text-gray-400 font-medium">Lần đồng bộ tự động cuối:</p>
                <p className="text-xs font-mono text-gray-300 font-semibold">{tenant.lastSyncTime}</p>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Mức độ rủi ro:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> An toàn
                  </span>
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* RIGHT DYNAMIC TAB CONTENT AREA */}
        <main className="lg:col-span-9 flex flex-col gap-6">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in flex flex-col gap-6">
              
              {/* TOP CARDS ROW */}
              <div className="dashboard-grid">
                
                <div className="glass-panel p-5 relative overflow-hidden glow-border">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ArrowUpRight className="w-20 h-20 text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tổng Doanh thu (Năm 2026)</span>
                  <p className="text-2xl font-bold text-white mt-2 font-mono tracking-tight">{formatCurrency(tenant.totalRevenue)}</p>
                  
                  <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Xuất hóa đơn điện tử:</span>
                    <span className="text-emerald-400 font-semibold">100% qua GDT</span>
                  </div>
                </div>

                <div className="glass-panel p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ArrowDownLeft className="w-20 h-20 text-rose-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tổng Chi phí hợp lệ được trừ</span>
                  <p className="text-2xl font-bold text-white mt-2 font-mono tracking-tight">{formatCurrency(tenant.totalExpenses)}</p>
                  
                  <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Tỷ lệ Lợi nhuận gộp ước tính:</span>
                    <span className="text-cyan-400 font-semibold">
                      {((tenant.totalRevenue - tenant.totalExpenses) / tenant.totalRevenue * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="glass-panel p-5 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950/20">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nghĩa vụ Thuế phát sinh (Ước tính)</span>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 text-xs">Thuế GTGT phải nộp:</span>
                      <span className="font-mono font-bold text-amber-400">{formatCurrency(tenant.taxLiabilities.vat)}</span>
                    </div>
                    
                    {tenant.accountingRegime === 'TT133' ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 text-xs">Thuế TNDN tạm tính (20%):</span>
                        <span className="font-mono font-bold text-rose-400">{formatCurrency(tenant.taxLiabilities.cit)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 text-xs">Thuế suất khoán Hộ KD:</span>
                        <span className="font-bold text-purple-400 text-xs">Không áp dụng TNDN</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 text-xs">Thuế TNCN khấu trừ / khoán:</span>
                      <span className="font-mono font-bold text-cyan-400">{formatCurrency(tenant.taxLiabilities.pit)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-[10px] text-gray-500 text-right">
                    Tự động tổng hợp dựa trên hóa đơn đầu vào/đầu ra
                  </div>
                </div>

              </div>

              {/* DYNAMIC VISUAL GRAPH SIMULATOR */}
              <div className="glass-panel p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Biểu đồ Tổng hợp Doanh thu vs Chi phí (Năm 2026)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-normal">Đơn vị: Triệu VND</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {tenant.accountingRegime === 'TT133' 
                        ? 'Dữ liệu hạch toán kép phát sinh theo thời gian thực từ phần mềm SmartTax AI' 
                        : 'Sổ chi tiết doanh thu và chi phí sản xuất kinh doanh theo Thông tư 88'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                      <span className="text-gray-300 font-medium">Doanh thu bán hàng</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
                      <span className="text-gray-300 font-medium">Chi phí sản xuất / kinh doanh</span>
                    </div>
                  </div>
                </div>

                {/* Simulated CSS Chart */}
                <div className="h-64 w-full flex items-end justify-between gap-2 pt-8 pb-2 px-2 border-b border-gray-800 relative">
                  
                  {/* Grid background markers */}
                  <div className="absolute inset-x-0 top-6 border-b border-gray-800/30 text-[10px] text-gray-600 flex justify-end pr-2">200 Tr</div>
                  <div className="absolute inset-x-0 top-24 border-b border-gray-800/30 text-[10px] text-gray-600 flex justify-end pr-2">120 Tr</div>
                  <div className="absolute inset-x-0 top-42 border-b border-gray-800/30 text-[10px] text-gray-600 flex justify-end pr-2">60 Tr</div>
                  
                  {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].map((m, idx) => {
                    const rev = tenant.monthlyRevenue[idx] || 0;
                    const exp = tenant.monthlyExpenses[idx] || 0;
                    
                    // calculate relative heights mapping max 200m to 100%
                    const revHeight = Math.min(100, (rev / 200) * 100);
                    const expHeight = Math.min(100, (exp / 200) * 100);

                    return (
                      <div key={m} className="flex-1 flex flex-col items-center h-full justify-end z-10 group">
                        
                        {/* Tooltip on hover */}
                        <div className="absolute top-0 hidden group-hover:flex flex-col bg-gray-900 border border-gray-700 p-2 rounded shadow-xl text-[10px] z-30 pointer-events-none">
                          <strong className="text-white border-b border-gray-800 pb-1 mb-1">{m}/2026</strong>
                          <span className="text-emerald-400">Doanh thu: {rev} triệu</span>
                          <span className="text-rose-400">Chi phí: {exp} triệu</span>
                        </div>

                        <div className="w-full max-w-[32px] flex items-end gap-1 h-full justify-center">
                          {/* Revenue Bar */}
                          <div 
                            style={{ height: `${revHeight}%` }} 
                            className="w-full bg-gradient-to-t from-emerald-700 to-emerald-400 rounded-t transition-all group-hover:brightness-125"
                          ></div>
                          {/* Expense Bar */}
                          <div 
                            style={{ height: `${expHeight}%` }} 
                            className="w-full bg-gradient-to-t from-rose-800 to-rose-500 rounded-t transition-all group-hover:brightness-125"
                          ></div>
                        </div>

                        <span className="text-xs text-gray-400 mt-2 font-medium">{m}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-2 flex flex-wrap items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Trí tuệ nhân tạo dự báo xu hướng: Tăng trưởng doanh thu duy trì mức ổn định 12% so với cùng kỳ quý trước.</span>
                  </div>
                  <button 
                    onClick={() => setActiveTab('reporting')}
                    className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    Xem báo cáo thuế chi tiết &rarr;
                  </button>
                </div>
              </div>

              {/* BOTTOM SECTION: RECENT INTEGRATED INVOICES PREVIEW */}
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Hóa đơn điện tử gần đây (Tra cứu GDT)</h4>
                    <p className="text-xs text-gray-400">Tự động bắt dữ liệu từ hệ thống e-invoice và hạch toán vào sổ</p>
                  </div>

                  <button 
                    onClick={() => setActiveTab('sync')} 
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Quản lý Đồng bộ OCR
                  </button>
                </div>

                <div className="table-container">
                  <table className="table-premium">
                    <thead>
                      <tr>
                        <th>Ký hiệu / Số HĐ</th>
                        <th>Ngày lập</th>
                        <th>Tên Đối tác / Khách hàng</th>
                        <th>Loại HĐ</th>
                        <th>Tổng tiền (Sau thuế)</th>
                        <th>Thuế suất</th>
                        <th>Gợi ý AI Hạch toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentInvoices.slice(0, 4).map(inv => (
                        <tr key={inv.id}>
                          <td>
                            <div className="font-mono font-bold text-white">{inv.symbol}</div>
                            <div className="text-xs text-gray-400 font-mono">#{inv.number}</div>
                          </td>
                          <td className="text-gray-300 font-mono">{inv.issueDate}</td>
                          <td>
                            <div className="font-medium text-gray-200 line-clamp-1">{inv.counterpartName}</div>
                            <div className="text-[11px] text-gray-500 font-mono">MST: {inv.counterpartTaxCode}</div>
                          </td>
                          <td>
                            <span className={`badge ${inv.type === 'INCOMING' ? 'badge-warning' : 'badge-success'}`}>
                              {inv.type === 'INCOMING' ? '📉 Mua vào' : '📈 Bán ra'}
                            </span>
                          </td>
                          <td className="font-mono font-bold text-white">{formatCurrency(inv.totalAmount)}</td>
                          <td><span className="text-gray-300 font-mono font-medium">{inv.vatRate}</span></td>
                          <td>
                            <div className="text-xs font-mono text-purple-300 bg-purple-950/40 px-2 py-1 rounded border border-purple-900 inline-block">
                              Nợ: {inv.suggestedDebitAcc} / Có: {inv.suggestedCreditAcc}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: DATA INTEGRATION & OCR SYNC */}
          {activeTab === 'sync' && (
            <div className="animate-fade-in flex flex-col gap-6">
              
              <div className="glass-panel p-6 border-l-4 border-emerald-500">
                <h3 className="text-lg font-bold text-white mb-1">Cổng Kết nối Dữ liệu Tự động (GDT Portals)</h3>
                <p className="text-xs text-gray-400">
                  Tự động tra cứu, tải về hóa đơn điện tử mua vào/bán ra từ hệ thống của Tổng cục Thuế theo cơ chế xác thực Token/Chữ ký số doanh nghiệp.
                </p>

                <div className="mt-6 p-4 rounded-xl bg-gray-900/90 border border-gray-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-white">Trạng thái đồng bộ tự động GDT</h5>
                      <p className="text-xs text-gray-400">
                        Hệ thống định kỳ 15 phút tra cứu 1 lần để tải hóa đơn gốc dạng XML bảo mật về máy chủ.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleTriggerGdtSync} 
                      disabled={isSyncing}
                      className="btn-primary"
                    >
                      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Đang truy vấn cổng GDT...' : 'Kích hoạt Đồng bộ thủ công ngay'}</span>
                    </button>
                  </div>
                </div>

                {/* SYNC REAL-TIME LOG */}
                <div className="mt-4 p-3 rounded-lg bg-black/60 border border-gray-800 font-mono text-xs max-h-40 overflow-y-auto space-y-1.5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-1 font-sans font-bold">Log Giao Tiếp API Tổng cục Thuế</p>
                  {syncLog.map((log, index) => (
                    <div key={index} className="text-emerald-400 leading-relaxed">
                      {log}
                    </div>
                  ))}
                  {isSyncing && (
                    <div className="text-amber-400 animate-pulse">
                      &gt; Đang bóc tách mã bảo mật XML & xác thực con dấu điện tử...
                    </div>
                  )}
                </div>

              </div>

              {/* OCR MODULE BLOCK */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* UPLOADER SIMULATOR */}
                <div className="glass-panel p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <UploadCloud className="w-5 h-5 text-purple-400" />
                      <h4 className="text-base font-bold text-white">AI OCR & Parsing Engine</h4>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">
                      Kéo thả file hóa đơn điện tử định dạng XML hoặc PDF độc lập để Trí tuệ nhân tạo bóc tách doanh thu/chi phí ngay lập tức.
                    </p>

                    {/* DUMMY FILE DROP ZONE */}
                    <div className="border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-xl p-8 text-center bg-gray-900/40 transition-colors cursor-pointer relative group">
                      <UploadCloud className="w-10 h-10 text-gray-500 mx-auto mb-3 group-hover:text-purple-400 transition-colors" />
                      <p className="text-sm font-semibold text-gray-300">Kéo thả file XML/PDF hóa đơn vào đây</p>
                      <p className="text-xs text-gray-500 mt-1">Hỗ trợ định dạng hóa đơn chuẩn Thông tư 78</p>
                      
                      <div className="mt-4 pt-3 border-t border-gray-800 flex flex-wrap justify-center gap-2">
                        <span className="text-[11px] text-gray-400 block w-full">Hoặc bấm thử nghiệm mô phỏng upload file mẫu:</span>
                        
                        <button 
                          onClick={() => handleSimulateFileUpload('hoadon_muavao_server_aws.xml', 'INCOMING', 18000000)}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-purple-300 px-2.5 py-1.5 rounded border border-gray-700 transition-all font-mono"
                        >
                          📄 hoadon_muavao_aws.xml
                        </button>

                        <button 
                          onClick={() => handleSimulateFileUpload('hoadon_banra_phanmem.pdf', 'OUTGOING', 40000000)}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-emerald-300 px-2.5 py-1.5 rounded border border-gray-700 transition-all font-mono"
                        >
                          📄 hoadon_banra_pm.pdf
                        </button>
                      </div>
                    </div>
                  </div>

                  {uploadedFileName && (
                    <div className="mt-4 p-3 rounded-lg bg-purple-950/30 border border-purple-800 flex items-center justify-between text-xs animate-fade-in">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-purple-400" />
                        <span className="text-white font-mono font-medium">{uploadedFileName}</span>
                      </div>
                      
                      {ocrParsingStatus === 'PARSING' ? (
                        <span className="text-amber-400 animate-pulse font-medium">Đang trích xuất AI...</span>
                      ) : (
                        <span className="badge badge-ai">✔ Phân tích 99.2%</span>
                      )}
                    </div>
                  )}

                </div>

                {/* PARSING LIVE RESULT PREVIEW */}
                <div className="glass-panel p-6">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Kết quả Tự động hạch toán AI</h4>
                  
                  {newOcrResult ? (
                    <div className="animate-fade-in space-y-4">
                      
                      <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 space-y-2">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                          <span className="text-xs text-gray-400">Tên Đối tác / NCC:</span>
                          <span className="text-xs font-bold text-white text-right">{newOcrResult.counterpartName}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Số hóa đơn / Ký hiệu:</span>
                          <span className="font-mono text-emerald-400 font-semibold">{newOcrResult.symbol} - #{newOcrResult.number}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Số tiền trước thuế:</span>
                          <span className="font-mono text-white">{formatCurrency(newOcrResult.preTaxAmount || 0)}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Thuế suất GTGT:</span>
                          <span className="font-mono text-amber-400 font-bold">{newOcrResult.vatRate}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Tổng thanh toán:</span>
                          <span className="font-mono font-bold text-emerald-400 text-sm">{formatCurrency(newOcrResult.totalAmount || 0)}</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-r from-purple-950/50 to-gray-900 border border-purple-900/60">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 mb-2">
                          <Sparkles className="w-4 h-4" />
                          <span>Gợi ý Hạch toán theo {tenant.accountingRegime === 'TT133' ? 'Thông tư 133' : 'Thông tư 88'}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="bg-black/40 p-2 rounded border border-gray-800">
                            <span className="text-[10px] text-gray-500 block">TÀI KHOẢN NỢ</span>
                            <strong className="text-emerald-400 text-sm">{newOcrResult.suggestedDebitAcc}</strong>
                          </div>
                          <div className="bg-black/40 p-2 rounded border border-gray-800">
                            <span className="text-[10px] text-gray-500 block">TÀI KHOẢN CÓ</span>
                            <strong className="text-rose-400 text-sm">{newOcrResult.suggestedCreditAcc}</strong>
                          </div>
                        </div>

                        <p className="text-[11px] text-gray-400 mt-2">
                          Hệ thống đã tự động ghi nhận vào Sổ Nhật Ký chung và Sổ chi tiết thuế GTGT. Không cần nhập liệu tay!
                        </p>
                      </div>

                    </div>
                  ) : (
                    <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center text-gray-500">
                      <FileCode className="w-12 h-12 stroke-1 text-gray-700 mb-2" />
                      <p className="text-xs font-medium">Chưa có file hóa đơn nào được bóc tách gần đây.</p>
                      <p className="text-[11px] text-gray-600 mt-1">Hãy upload file hoặc bấm nút mô phỏng ở ô bên trái để kiểm tra AI.</p>
                    </div>
                  )}

                </div>

              </div>

              {/* LIST OF CURRENT LOCAL INVOICES */}
              <div className="glass-panel p-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Danh sách toàn bộ Hóa đơn hiện có ({currentInvoices.length})</h4>
                
                <div className="table-container">
                  <table className="table-premium">
                    <thead>
                      <tr>
                        <th>Ký hiệu / Số HĐ</th>
                        <th>Ngày lập</th>
                        <th>Đối tác giao dịch</th>
                        <th>Phân loại</th>
                        <th>Trước thuế</th>
                        <th>Thuế suất</th>
                        <th>Tổng tiền</th>
                        <th>Tài khoản Nợ / Có</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentInvoices.map(inv => (
                        <tr key={inv.id}>
                          <td>
                            <div className="font-mono font-bold text-white">{inv.symbol}</div>
                            <div className="text-xs text-gray-400 font-mono">#{inv.number}</div>
                          </td>
                          <td className="text-gray-300 font-mono">{inv.issueDate}</td>
                          <td>
                            <div className="font-medium text-gray-200">{inv.counterpartName}</div>
                            <div className="text-[10px] text-gray-500 font-mono">MST: {inv.counterpartTaxCode}</div>
                          </td>
                          <td>
                            <span className={`badge ${inv.type === 'INCOMING' ? 'badge-warning' : 'badge-success'}`}>
                              {inv.type === 'INCOMING' ? '📉 Mua vào' : '📈 Bán ra'}
                            </span>
                          </td>
                          <td className="font-mono text-gray-300">{formatCurrency(inv.preTaxAmount)}</td>
                          <td><span className="text-amber-400 font-mono font-bold">{inv.vatRate}</span></td>
                          <td className="font-mono font-bold text-emerald-400">{formatCurrency(inv.totalAmount)}</td>
                          <td>
                            <div className="text-xs font-mono text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-900 inline-block">
                              {inv.suggestedDebitAcc} / {inv.suggestedCreditAcc}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: AI ACCOUNTING ENGINE & BOOKKEEPING LEDGERS */}
          {activeTab === 'accounting' && (
            <div className="animate-fade-in flex flex-col gap-6">
              
              <div className="glass-panel p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Sổ Kế toán Hạch toán Kép Tự động</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-semibold">
                        {tenant.accountingRegime === 'TT133' ? 'Chế độ Thông tư 133' : 'Chế độ Thông tư 88'}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Mỗi khi hóa đơn phát sinh, AI Engine tự động định khoản tài khoản kế toán cấp 1 & cấp 2 phù hợp với ngành nghề kinh doanh.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Chế độ hiển thị:</span>
                    <span className="px-2 py-1 rounded bg-gray-800 text-xs font-semibold text-white">Sổ Nhật Ký Chung</span>
                  </div>
                </div>

                {/* INFO EXPLANATION FOR CIRCULARS */}
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 mb-6 text-xs text-gray-300 leading-relaxed">
                  <strong className="text-emerald-400 block mb-1">💡 Cơ sở Pháp lý hạch toán:</strong>
                  {tenant.accountingRegime === 'TT133' ? (
                    <span>
                      Áp dụng Hệ thống Tài khoản Kế toán theo <strong>Thông tư 133/2016/TT-BTC</strong>. Tài sản và chi phí tuân thủ hạch toán chi tiết: 
                      Các khoản phải thu khách hàng (TK 131), Thuế GTGT đầu vào (TK 1331), Doanh thu bán hàng hóa và cung cấp dịch vụ (TK 5111), 
                      Thuế GTGT đầu ra (TK 33311), Chi phí quản lý doanh nghiệp (TK 6422).
                    </span>
                  ) : (
                    <span>
                      Áp dụng Hệ thống biểu mẫu Sổ sách theo <strong>Thông tư 88/2021/TT-BTC</strong> dành riêng cho Hộ kinh doanh. Bao gồm: 
                      Sổ chi tiết doanh thu bán hàng hóa dịch vụ (Mẫu S1-HKD), Sổ chi phí sản xuất kinh doanh (Mẫu S2-HKD). Hộ KD không áp dụng tài khoản Nợ/Có tiêu chuẩn mà theo dõi theo Mục chi tiết.
                    </span>
                  )}
                </div>

                {/* THE LEDGER TABLE */}
                <div className="table-container">
                  <table className="table-premium">
                    <thead>
                      <tr>
                        <th>Ngày HT</th>
                        <th>Số CT / Mã Phiếu</th>
                        <th>Diễn giải giao dịch</th>
                        <th>Tài khoản Nợ / Có (Mục sổ)</th>
                        <th>Số tiền (VND)</th>
                        <th>Trạng thái AI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentJournals.map(je => (
                        <tr key={je.id}>
                          <td className="text-gray-300 font-mono">{je.date}</td>
                          <td>
                            <span className="font-mono font-bold text-white bg-gray-900 px-2 py-1 rounded border border-gray-800">
                              {je.voucherCode}
                            </span>
                          </td>
                          <td>
                            <div className="text-gray-200 font-medium">{je.description}</div>
                          </td>
                          <td>
                            <div className="space-y-1 text-xs font-mono">
                              <div className="text-emerald-400 font-semibold">Nợ: {je.debitAccount}</div>
                              <div className="text-rose-400 font-semibold">Có: {je.creditAccount}</div>
                            </div>
                          </td>
                          <td className="font-mono font-bold text-white text-sm">{formatCurrency(je.amount)}</td>
                          <td>
                            {je.isAutomated ? (
                              <span className="badge badge-ai">✔ Tự động hạch toán</span>
                            ) : (
                              <span className="badge badge-info">Nhập thủ công</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: TAX RISK RADAR */}
          {activeTab === 'radar' && (
            <div className="animate-fade-in flex flex-col gap-6">
              
              <div className="glass-panel p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Hệ thống Radar Rủi ro Thuế (Tax Risk Radar)</span>
                      <span className="badge badge-warning">Cảnh báo Trực tuyến</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Tự động quét toàn bộ hóa đơn đầu vào/đầu ra, đối chiếu chéo danh sách đen doanh nghiệp bỏ trốn của TCT và các mẫu hình xuất hóa đơn bất thường.
                    </p>
                  </div>

                  {/* FILTER BUTTONS */}
                  <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800">
                    {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setRiskFilter(lvl)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${riskFilter === lvl ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                        {lvl === 'ALL' ? 'Tất cả' : lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SENSITIVITY INDICATOR */}
                <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 mb-6 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="text-gray-300 font-medium block">Độ nhạy quét Rủi ro AI Engine</span>
                      <span className="text-[11px] text-gray-500">Mức hiện tại: Nâng cao (Bao gồm rà soát ngày xuất hóa đơn và tuổi đời NCC)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Ngưỡng:</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold">Cao (High Precision)</span>
                  </div>
                </div>

                {/* ALERTS CARDS LIST */}
                <div className="space-y-4">
                  {filteredAlerts.map(alert => {
                    
                    let bgBorder = 'border-gray-800';
                    let textAccent = 'text-gray-400';
                    if (alert.level === 'CRITICAL') {
                      bgBorder = 'border-rose-500/50 bg-rose-950/10';
                      textAccent = 'text-rose-400';
                    } else if (alert.level === 'WARNING') {
                      bgBorder = 'border-amber-500/50 bg-amber-950/10';
                      textAccent = 'text-amber-400';
                    } else {
                      bgBorder = 'border-blue-500/50 bg-blue-950/10';
                      textAccent = 'text-blue-400';
                    }

                    return (
                      <div key={alert.id} className={`p-5 rounded-xl border ${bgBorder} transition-all relative overflow-hidden`}>
                        
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`w-5 h-5 ${textAccent}`} />
                            <h4 className="text-base font-bold text-white">{alert.title}</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            {alert.detectedOnInvoice && (
                              <span className="text-xs bg-gray-900 px-2 py-1 rounded font-mono text-gray-400 border border-gray-800">
                                HĐ: #{alert.detectedOnInvoice}
                              </span>
                            )}
                            <span className={`badge ${alert.level === 'CRITICAL' ? 'badge-danger' : alert.level === 'WARNING' ? 'badge-warning' : 'badge-info'}`}>
                              {alert.level}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed mb-4">
                          {alert.description}
                        </p>

                        <div className="mt-3 pt-3 border-t border-gray-800/80 bg-black/30 p-3 rounded-lg">
                          <strong className="text-[11px] text-emerald-400 uppercase tracking-wider block mb-1">💡 Tư vấn Khắc phục từ Expert Tax Consultant:</strong>
                          <p className="text-xs text-gray-300 leading-relaxed">
                            {alert.recommendation}
                          </p>
                        </div>

                        <div className="mt-2 text-[10px] text-gray-500 font-mono text-right">
                          Thời gian phát hiện: {alert.timestamp}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: TAX COMPLIANCE & REPORTING (HTKK XML) */}
          {activeTab === 'reporting' && (
            <div className="animate-fade-in flex flex-col gap-6">
              
              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-white mb-1">Kết xuất Tờ khai Thuế định dạng XML (Chuẩn HTKK)</h3>
                <p className="text-xs text-gray-400 mb-6">
                  Dữ liệu từ sổ sách kế toán tự động tổng hợp vào tờ khai chuẩn mã vạch HTKK mới nhất. Tương thích nộp thẳng lên hệ thống thuedientu.gdt.gov.vn.
                </p>

                {/* FORM SELECTOR ROW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  
                  <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                    <span className="text-xs text-gray-500 block mb-1 font-medium">Chọn loại Tờ khai kết xuất</span>
                    <select 
                      value={selectedDeclarationForm} 
                      onChange={(e) => setSelectedDeclarationForm(e.target.value)}
                      className="bg-black text-sm font-bold text-emerald-400 p-2.5 rounded-lg w-full border border-gray-700 outline-none cursor-pointer"
                    >
                      <option value="01/GTGT">Tờ khai 01/GTGT (Thuế GTGT)</option>
                      <option value="05/KK-TNCN">Tờ khai 05/KK-TNCN (Thuế TNCN)</option>
                    </select>
                  </div>

                  <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                    <span className="text-xs text-gray-500 block mb-1 font-medium">Kỳ tính thuế áp dụng</span>
                    <div className="text-sm font-bold text-white pt-1">
                      Tháng 04 / 2026
                    </div>
                    <span className="text-[10px] text-gray-500 block mt-0.5">Hạn nộp: 20/05/2026</span>
                  </div>

                  <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col justify-center">
                    <span className="text-xs text-gray-500 block mb-1 font-medium">Chữ ký số tích hợp</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
                      <span className="text-xs font-bold text-purple-300">SmartCA VN (Đã ký sẵn sàng)</span>
                    </div>
                  </div>

                </div>

                {/* XML DATA PREVIEW BOX */}
                <div className="relative">
                  <div className="flex items-center justify-between bg-gray-950 px-4 py-2.5 rounded-t-lg border border-gray-800 border-b-0">
                    <span className="text-xs font-mono font-bold text-gray-400 flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-amber-500" />
                      <span>Cấu trúc XML Gốc - Tờ khai {selectedDeclarationForm}</span>
                    </span>

                    <button 
                      onClick={handleDownloadXml}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất file XML chuẩn HTKK</span>
                    </button>
                  </div>

                  <pre className="bg-[#05070d] p-4 rounded-b-lg border border-gray-800 text-xs font-mono text-emerald-400/90 overflow-x-auto max-h-96 leading-relaxed">
                    {MOCK_HTKK_XML_TEMPLATES[selectedDeclarationForm] || 'Không tìm thấy mẫu file.'}
                  </pre>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Tờ khai đã được AI tự động kiểm tra logic tính toán các chỉ tiêu mua vào (Chỉ tiêu [23], [24], [25]) và bán ra (Chỉ tiêu [27], [28]). 
                    Số liệu hoàn toàn khớp với Tổng Sổ Cái hạch toán.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 6: AI TAX ADVISOR (RAG SYSTEM) WITH EMBEDDING SOURCES PREVIEW */}
          {activeTab === 'advisor' && (
            <div className="animate-fade-in flex flex-col gap-6">
              
              {/* TOP EMBEDDING SOURCES STATUS CONTAINER */}
              <div className="glass-panel p-6 border-t-4 border-purple-500">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      <h3 className="text-base font-bold text-white uppercase tracking-wider">
                        Nguồn Dữ liệu Đã Nạp (Vector Embeddings RAG)
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Trạng thái nhúng (Embedding) trực tiếp vào Vector Store PostgreSQL (pgvector) bằng mô hình Text-Embedding kích thước 1536 chiều.
                    </p>
                  </div>

                  <span className="badge badge-ai">✔ Tổng: 6,110 Chunks</span>
                </div>

                {/* THE 4 EMBEDDED KNOWLEDGE SOURCES CARDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {EMBEDDED_KNOWLEDGE_SOURCES.map(source => {
                    const isSelected = source.id === selectedEmbeddedSourceId;
                    
                    let typeBadgeBg = 'bg-gray-800 text-gray-400';
                    if (source.type === 'LUAT') typeBadgeBg = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
                    else if (source.type === 'THONG_TU') typeBadgeBg = 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
                    else if (source.type === 'KE_TOAN') typeBadgeBg = 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
                    else typeBadgeBg = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';

                    return (
                      <button
                        key={source.id}
                        onClick={() => setSelectedEmbeddedSourceId(source.id)}
                        className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                          isSelected 
                            ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500' 
                            : 'bg-gray-900/90 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${typeBadgeBg}`}>
                              {source.type}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {source.totalChunks} chunks
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-white line-clamp-1 mb-1">
                            {source.title}
                          </h5>
                          <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                            {source.purpose}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-purple-400 font-mono">
                          <span>Dim: {source.vectorDimension}</span>
                          <span className="text-gray-500">{isSelected ? '● Đang xem' : 'Bấm xem →'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* ACTIVE EMBEDDED PREVIEW BOX */}
                <div className="mt-4 p-3 rounded-lg bg-black/60 border border-purple-900/50">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-1.5 mb-2 text-xs">
                    <span className="text-gray-400">
                      Mô phỏng Vector Text Chunk trích xuất từ: <strong className="text-white font-mono">{activeEmbeddedSource.title}</strong>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Trạng thái: {activeEmbeddedSource.lastUpdated}</span>
                  </div>
                  <p className="text-xs font-mono text-purple-300 leading-relaxed italic bg-gray-950 p-2.5 rounded border border-gray-900">
                    "{activeEmbeddedSource.sampleEmbeddedText}"
                  </p>
                </div>

              </div>

              {/* RAG ADVISOR PANEL */}
              <div className="glass-panel p-6">
                
                <div className="border-b border-gray-800 pb-3 mb-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      <span>Hệ thống Tư vấn tự động (Truy vấn chéo các nguồn trên)</span>
                    </h3>
                  </div>

                  <span className="text-xs text-gray-400">Bấm câu hỏi mẫu để đối chiếu độ trích xuất AI:</span>
                </div>

                {/* SUGGESTED PRE-BAKED QUESTIONS */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {MOCK_QA_KNOWLEDGE.map(qa => (
                      <button
                        key={qa.id}
                        onClick={() => {
                          // append history simulation
                          setChatHistory(prev => [
                            ...prev, 
                            { sender: 'USER', text: qa.question },
                            { sender: 'AI', text: `${qa.shortAnswer}\n\n${qa.fullAnalysis}`, citation: qa.legalCitation }
                          ]);
                        }}
                        className="p-3 bg-gray-900/80 hover:bg-purple-950/40 border border-gray-800 hover:border-purple-500/50 rounded-xl text-left transition-all group flex flex-col justify-between"
                      >
                        <p className="text-xs font-medium text-gray-300 group-hover:text-purple-300 line-clamp-2 leading-relaxed">
                          "{qa.question}"
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1 pt-2 border-t border-gray-800 items-center justify-between">
                          <div className="flex gap-1">
                            {qa.tags.slice(0, 2).map(t => (
                              <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                                #{t}
                              </span>
                            ))}
                          </div>
                          
                          {qa.sourceId && (
                            <span className="text-[9px] text-emerald-400 font-mono font-bold">
                              Trích xuất RAG
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CHAT INTERFACE AREA */}
                <div className="rounded-xl border border-gray-800 bg-black/40 flex flex-col h-[420px]">
                  
                  {/* Chat messages stream */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {chatHistory.map((chat, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col max-w-[85%] ${chat.sender === 'USER' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-[11px] text-gray-500 px-1">
                          {chat.sender === 'USER' ? (
                            <span>Kế toán viên (Bạn)</span>
                          ) : (
                            <span className="text-purple-400 font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> SmartTax AI Advisor
                            </span>
                          )}
                        </div>

                        <div 
                          className={`p-3.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                            chat.sender === 'USER' 
                              ? 'bg-emerald-600 text-white rounded-br-none font-medium' 
                              : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-bl-none'
                          }`}
                        >
                          {chat.text}
                        </div>

                        {/* Citation helper display */}
                        {chat.citation && (
                          <div className="mt-1.5 p-2 rounded bg-purple-950/30 border border-purple-900 text-[11px] text-purple-300 font-mono w-full text-left">
                            <strong className="text-purple-400">Nguồn ánh xạ (Legal Citation):</strong> {chat.citation}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>

                  {/* CHAT INPUT FORM */}
                  <form onSubmit={handleSendCustomQuestion} className="p-3 border-t border-gray-800 bg-gray-950 flex gap-2 rounded-b-xl">
                    <input 
                      type="text" 
                      value={customQuestionInput}
                      onChange={(e) => setCustomQuestionInput(e.target.value)}
                      placeholder="Hỏi AI tư vấn về thời hạn nộp, quy tắc phân bổ, chế độ kế toán Thông tư 133 hay chuẩn cấu trúc file XML..."
                      className="flex-1 input-premium text-xs"
                    />
                    <button type="submit" className="btn-ai text-xs py-2 px-4 whitespace-nowrap">
                      <span>Gửi Câu Hỏi</span>
                    </button>
                  </form>

                </div>

              </div>

            </div>
          )}

          {/* TAB 7: PLATFORM STRUCTURE & SCHEMA BLUEPRINT VISUALIZER */}
          {activeTab === 'structure' && (
            <div className="animate-fade-in flex flex-col gap-6">
              
              <div className="glass-panel p-6">
                <div className="border-b border-gray-800 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-teal-400" />
                    <span>Kiến trúc Kỹ thuật & Cấu trúc Nền tảng SmartTax AI</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Bản thiết kế kỹ thuật tiêu chuẩn cho hệ thống kế toán đa chi nhánh (Multi-tenant) kết hợp mã hóa bảo mật.
                  </p>
                </div>

                {/* ARCHITECTURAL VIEW CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  
                  <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                    <div className="flex items-center gap-2 text-teal-400 font-bold text-xs mb-1">
                      <Layers className="w-4 h-4" />
                      <span>Database: PostgreSQL</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Sử dụng Row-Level Security (RLS) cô lập 100% dữ liệu các công ty theo trường `tenant_id`. Kết hợp `pgvector` để nhúng dữ liệu luật.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Security & Chữ ký số</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Mã hóa cột thông tin tài khoản bằng AES-256-GCM. Hỗ trợ xác thực PKCS#11/SmartCA ký trực tiếp gói XML trước khi nộp GDT.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                      <Cpu className="w-4 h-4" />
                      <span>GDT Sync Microservice</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Các endpoint REST API kết nối tự động lấy dữ liệu XML/PDF gốc. Parser tự động phân loại Nợ/Có.
                    </p>
                  </div>

                </div>

                {/* VISUAL CODE SCHEMA RENDERER */}
                <div className="space-y-4">
                  
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">1. Cấu trúc Bảng Cơ sở dữ liệu Cốt lõi (SQL DDL)</span>
                    <pre className="bg-[#05070d] p-4 rounded-lg border border-gray-800 text-xs font-mono text-cyan-400 max-h-72 overflow-y-auto leading-relaxed">
{`CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tax_code VARCHAR(20) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    accounting_regime VARCHAR(50) NOT NULL -- 'CIRCULAR_133' or 'CIRCULAR_88'
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_type VARCHAR(20) NOT NULL, -- 'INCOMING' or 'OUTGOING'
    invoice_symbol VARCHAR(20) NOT NULL,
    invoice_number VARCHAR(20) NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    vat_amount NUMERIC(15, 2) NOT NULL,
    xml_data TEXT,
    risk_status VARCHAR(30) DEFAULT 'SAFE'
);

CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id),
    voucher_code VARCHAR(50) NOT NULL,
    debit_account VARCHAR(50),
    credit_account VARCHAR(50),
    amount NUMERIC(15, 2) NOT NULL
);`}
                    </pre>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">2. API Endpoints Specification (GDT Integration)</span>
                    <div className="bg-[#05070d] p-4 rounded-lg border border-gray-800 space-y-3 text-xs font-mono">
                      
                      <div className="border-b border-gray-800 pb-2">
                        <div className="text-emerald-400 font-bold">POST /api/v1/gdt/authenticate</div>
                        <p className="text-gray-500 text-[11px] mt-0.5">Xác thực chứng thư số với máy chủ Tổng cục Thuế, lấy phiên làm việc bảo mật.</p>
                      </div>

                      <div className="border-b border-gray-800 pb-2">
                        <div className="text-cyan-400 font-bold">GET /api/v1/gdt/invoices/sync?tax_code=0109876543&type=INCOMING</div>
                        <p className="text-gray-500 text-[11px] mt-0.5">Tải luồng dữ liệu hóa đơn điện tử mua vào mới phát sinh trong kỳ.</p>
                      </div>

                      <div>
                        <div className="text-purple-400 font-bold">POST /api/v1/declarations/export-htkk</div>
                        <p className="text-gray-500 text-[11px] mt-0.5">Đóng gói XML chuẩn HTKK đính kèm chữ ký số để truyền trực tiếp hệ thống khai thuế.</p>
                      </div>

                    </div>
                  </div>

                </div>

                <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-400">
                  <span>Tài liệu chi tiết đã được xuất ra thư mục Artifact: <strong className="text-white">platform_architecture_and_schema.md</strong></span>
                  <span className="text-emerald-400 font-semibold">Bản quyền Deepmind / Advanced Agentic Coding</span>
                </div>

              </div>

            </div>
          )}

        </main>

      </div>

      {/* FOOTER */}
      <footer className="mt-auto pt-12 pb-6 text-center text-xs text-gray-600 border-t border-gray-900 max-w-[1600px] w-full mx-auto px-4">
        <p className="font-semibold text-gray-500">SmartTax AI Platform • Cung cấp giải pháp Kế toán tối ưu cho SMEs & Hộ Kinh Doanh Việt Nam</p>
        <p className="mt-1">Hỗ trợ đầy đủ tiêu chuẩn HTKK, e-Invoice GDT & Chữ ký số SmartCA bảo mật cao.</p>
      </footer>

    </div>
  );
}
