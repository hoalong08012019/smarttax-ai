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
  BookOpen,
  ArrowRight,
  Send,
  Settings,
  Lock,
  Unlock,
  LogOut
} from 'lucide-react';
import { 
  MOCK_TENANTS, 
  MOCK_INVOICES, 
  MOCK_JOURNALS, 
  MOCK_ALERTS, 
  MOCK_QA_KNOWLEDGE, 
  MOCK_HTKK_XML_TEMPLATES,
  EMBEDDED_KNOWLEDGE_SOURCES,
  MOCK_CIRCULAR_88_BOOKS
} from './mockData';
import type {
  Invoice,
  JournalEntry
} from './mockData';

export default function App() {
  // Multi-tenant active state
  const [activeTenantId, setActiveTenantId] = useState<string>('t-001');
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('overview');
  
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
  const [selectedCircular88Book, setSelectedCircular88Book] = useState<'S1' | 'S2' | 'S3' | 'S4'>('S1');

  // Admin CMS custom states
  const [adminIndexingTitle, setAdminIndexingTitle] = useState<string>('');
  const [adminIndexingStatus, setAdminIndexingStatus] = useState<string | null>(null);
  const [adminSystemPromptOverride, setAdminSystemPromptOverride] = useState<string>('Bắt buộc áp dụng trích xuất RAG chặt chẽ theo Thông tư 80/133/88.');

  // Admin standalone view & authentication gating state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('smarttax_admin_auth') === 'true';
    }
    return false;
  });
  const [adminPasscodeInput, setAdminPasscodeInput] = useState<string>('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  // Automated Tax Report Builder States
  const [reportPeriodType, setReportPeriodType] = useState<'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');
  const [reportPeriodValue, setReportPeriodValue] = useState<string>('04'); // Month 04 or Q2 or 2026
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [generatedReportSummary, setGeneratedReportSummary] = useState<{
    periodText: string;
    totalRevenueBase: number;
    totalVatDeductible: number;
    payableVat: number;
    payableCitOrPit: number;
    deadlineStr: string;
    verifiedLog: string;
  } | null>({
    periodText: 'Tháng 04 / 2026',
    totalRevenueBase: 150000000,
    totalVatDeductible: 12500000,
    payableVat: 2500000,
    payableCitOrPit: 18500000,
    deadlineStr: '20/05/2026',
    verifiedLog: 'Đã nội suy tự động từ Sổ Cái Kế toán. Khớp 100% hóa đơn GDT xác thực.'
  });

  // Calculate customized report parameters dynamically
  const handleCalculateDynamicReport = (pType = reportPeriodType, pVal = reportPeriodValue) => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      // retrieve filtered local active invoices simulation
      const invs = localInvoices[activeTenantId] || [];
      let revSum = 0;
      let vatDeductibleSum = 0;
      let vatOutputSum = 0;

      invs.forEach(inv => {
        if (inv.type === 'OUTGOING') {
          revSum += inv.preTaxAmount;
          vatOutputSum += inv.vatAmount || (inv.preTaxAmount * 0.1);
        } else {
          vatDeductibleSum += inv.vatAmount || (inv.preTaxAmount * 0.1);
        }
      });

      // Scale up or down dynamically depending on chosen aggregate range
      const multiplier = pType === 'YEAR' ? 8.5 : (pType === 'QUARTER' ? 2.8 : 1.0);
      const curRev = Math.round(revSum * multiplier) || Math.round(tenant.totalRevenue * (multiplier / 8.5));
      const curVatDeduct = Math.round(vatDeductibleSum * multiplier) || 12500000;
      const curVatOut = Math.round(vatOutputSum * multiplier) || 15000000;
      const netVat = Math.max(0, curVatOut - curVatDeduct);
      
      let pText = `Tháng ${pVal} / 2026`;
      let dlStr = `20/${String(Number(pVal) + 1).padStart(2, '0')}/2026`;
      if (pType === 'QUARTER') {
        pText = `Quý ${pVal} / 2026`;
        const nextMonthMap: Record<string, string> = { '1': '04', '2': '07', '3': '10', '4': '01/2027' };
        dlStr = `30/${nextMonthMap[pVal] || '07'}/2026`;
      } else if (pType === 'YEAR') {
        pText = `Năm tài chính ${pVal}`;
        dlStr = `31/03/${Number(pVal) + 1}`;
      }

      setGeneratedReportSummary({
        periodText: pText,
        totalRevenueBase: curRev,
        totalVatDeductible: curVatDeduct,
        payableVat: netVat,
        payableCitOrPit: tenant.accountingRegime === 'TT133' ? Math.round(curRev * 0.05) : Math.round(curRev * 0.005),
        deadlineStr: dlStr,
        verifiedLog: `Đã nội suy tự động từ Sổ Cái Kế toán. Khớp 100% hóa đơn GDT phát sinh trong ${pText.toLowerCase()}.`
      });

      setIsGeneratingReport(false);
    }, 600);
  };

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
          text: `🔍 **Hệ thống RAG đã trích xuất từ Kho dữ liệu nạp (Embedding pgvector)**:\n\n${matchedQA.shortAnswer}\n\n${matchedQA.fullAnalysis}`,
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

  // Standalone detection logic
  const isStandaloneAdminView = (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) || activeTab === 'admin';

  if (isStandaloneAdminView) {
    if (!isAdminAuthenticated) {
      return (
        <div style={{ minHeight: '100vh', width: '100vw', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundImage: 'radial-gradient(circle at center, rgba(204,255,0,0.05) 0%, transparent 70%)' }}>
          <div style={{ width: '100%', maxWidth: '420px', padding: '32px', borderRadius: '16px', backgroundColor: '#06070a', border: '1px solid rgba(204,255,0,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }} className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(204,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid var(--accent-lime)' }}>
                <Lock size={28} color="var(--accent-lime)" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>Cổng Quản Trị Độc Lập</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Hệ thống được cô lập hoàn toàn khỏi phân hệ Kế toán viên</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (adminPasscodeInput === 'smarttax2026') {
                sessionStorage.setItem('smarttax_admin_auth', 'true');
                setIsAdminAuthenticated(true);
                setAdminAuthError(null);
              } else {
                setAdminAuthError('Mã truy cập không chính xác. Vui lòng thử lại.');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 700 }} className="font-mono">
                  NHẬP MÃ BẢO MẬT (ROOT PASSCODE):
                </label>
                <input 
                  type="password"
                  value={adminPasscodeInput}
                  onChange={(e) => setAdminPasscodeInput(e.target.value)}
                  placeholder="••••••••••••"
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', backgroundColor: '#000000', border: '1px solid var(--border-color)', color: 'var(--accent-lime)', fontSize: '14px', letterSpacing: '0.2em', textAlign: 'center', outline: 'none' }}
                  autoFocus
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                  Gợi ý mật khẩu demo: <strong style={{ color: '#ffffff' }}>smarttax2026</strong>
                </span>
              </div>

              {adminAuthError && (
                <div style={{ padding: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,51,51,0.1)', border: '1px solid rgba(255,51,51,0.2)', fontSize: '11px', color: '#ff4444', textAlign: 'center' }}>
                  {adminAuthError}
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '13px' }}>
                <Unlock size={16} />
                <span>Xác thực Quyền Quản Trị Cấp Cao</span>
              </button>
            </form>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
                    window.location.href = '/';
                  } else {
                    setActiveTab('overview');
                  }
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', textDecoration: 'underline', cursor: 'pointer' }}
              >
                &larr; Quay lại phân hệ website Kế toán thường
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Fully authenticated standalone Admin space
    return (
      <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', flexDirection: 'column' }}>
        
        {/* Dedicated Admin Header */}
        <header style={{ padding: '16px 32px', backgroundColor: '#050505', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex-row-center" style={{ gap: '12px' }}>
            <div style={{ padding: '6px 10px', borderRadius: '6px', backgroundColor: 'var(--accent-lime)', color: '#000000', fontWeight: 800, fontSize: '14px' }} className="font-mono">
              ROOT // SECURE
            </div>
            <div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>SmartTax AI Core Administration Terminal</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Cô lập bộ nhớ đệm vật lý • Giao thức Zero-Knowledge DB</span>
            </div>
          </div>

          <button 
            onClick={() => {
              sessionStorage.removeItem('smarttax_admin_auth');
              setIsAdminAuthenticated(false);
              if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
                window.location.href = '/';
              } else {
                setActiveTab('overview');
              }
            }}
            style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'rgba(255,51,51,0.1)', border: '1px solid rgba(255,51,51,0.2)', color: '#ff4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <LogOut size={14} />
            <span>Đóng Cổng & Thoát</span>
          </button>
        </header>

        {/* Dedicated Admin Body */}
        <main style={{ flex: 1, padding: '32px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          
          {/* Controls Banner */}
          <div style={{ padding: '24px', borderRadius: '12px', backgroundColor: '#06070a', border: '1px solid var(--accent-lime)', marginBottom: '24px' }}>
            <div className="flex-row-between" style={{ marginBottom: '16px' }}>
              <div className="flex-row-center" style={{ gap: '12px' }}>
                <Settings size={22} color="var(--accent-lime)" />
                <div>
                  <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Bảng điều khiển Máy học & Định tuyến Pháp lý pgvector</h1>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tự động ánh xạ chỉ tiêu kết xuất vào engine tính toán 3 lớp chuẩn hóa.</p>
                </div>
              </div>
              <span className="badge badge-lime font-mono" style={{ fontSize: '11px' }}>AES-256-GCM Secure Shell</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '12px', backgroundColor: '#000000', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Trạng thái Supabase v2</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-emerald)' }}>Active (RLS Enforced)</span>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#000000', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Cơ chế Phân mảnh Chunks</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)' }} className="font-mono">Text-Embedding-Ada-002</span>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#000000', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Bảo mật Chữ ký số</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Token PKCS#11 / HSM VN</span>
              </div>
            </div>
          </div>

          {/* 2-Column Dashboard Split */}
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 992 ? '1fr 1fr' : '1fr', gap: '24px', marginBottom: '24px' }}>
            
            {/* INGEST FORM */}
            <div style={{ backgroundColor: '#06070a', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div className="flex-row-center" style={{ gap: '8px', marginBottom: '12px' }}>
                <UploadCloud size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Nạp Trực tiếp Tri thức Luật vào pgvector DB</h3>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Mô phỏng cơ chế băm dữ liệu nội suy 1536 chiều, tải trực tiếp các Nghị định, Thông tư mới phát sinh vào mô hình tra cứu ngữ nghĩa.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Tên văn bản / Thông tư cần index:</label>
                  <input 
                    type="text"
                    value={adminIndexingTitle}
                    onChange={(e) => setAdminIndexingTitle(e.target.value)}
                    placeholder="Ví dụ: Thông tư 40/2021/TT-BTC hoặc Thông tư sửa đổi..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', backgroundColor: '#000000', border: '1px solid var(--border-color)', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <button 
                  onClick={() => {
                    if (!adminIndexingTitle.trim()) return;
                    setAdminIndexingStatus('INDEXING');
                    setTimeout(() => {
                      setAdminIndexingStatus('SUCCESS');
                    }, 1200);
                  }}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '13px' }}
                >
                  <Sparkles size={14} className={adminIndexingStatus === 'INDEXING' ? 'animate-spin' : ''} />
                  <span>{adminIndexingStatus === 'INDEXING' ? 'Đang băm chuỗi & nhúng Embedding (1536 dims)...' : '⚡ Băm Dữ liệu & Đẩy vào Bảng knowledge_chunks'}</span>
                </button>

                {adminIndexingStatus === 'SUCCESS' && (
                  <div className="animate-fade-in" style={{ padding: '12px', backgroundColor: 'rgba(0,255,128,0.08)', borderRadius: '6px', border: '1px solid rgba(0,255,128,0.2)', fontSize: '12px', color: 'var(--accent-emerald)', lineHeight: 1.4 }}>
                    ✔ <strong>Thành công:</strong> Đã chia tách tài liệu thành <strong>420 chunks</strong> và xây dựng hoàn tất chỉ mục lập chỉ mục HNSW/IVFFlat trên PostgreSQL pgvector!
                  </div>
                )}
              </div>
            </div>

            {/* TENANTS ADMIN CONFIG LIST */}
            <div style={{ backgroundColor: '#06070a', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div className="flex-row-center" style={{ gap: '8px', marginBottom: '12px' }}>
                <Building2 size={18} color="var(--accent-lime)" />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Quản lý Đơn vị Hạch toán & Chế độ Kế toán</h3>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Danh sách các tổ chức khách hàng trực thuộc sự điều phối của hệ thống AI.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '6px' }}>
                {MOCK_TENANTS.map(t => (
                  <div key={t.id} className="flex-row-between" style={{ padding: '10px 14px', backgroundColor: '#000000', borderRadius: '6px', border: t.id === activeTenantId ? '1px solid var(--accent-lime)' : '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block' }}>{t.companyName}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="font-mono">MST: {t.taxCode}</span>
                    </div>
                    <span className={`badge ${t.accountingRegime === 'TT133' ? 'badge-lime' : 'badge-amber'}`} style={{ fontSize: '10px' }}>
                      {t.accountingRegime}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* OVERRIDE SYSTEM PROMPT */}
          <div style={{ backgroundColor: '#06070a', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div className="flex-row-between" style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={18} color="#d4a6ff" />
                <span>Kiểm soát Ngầm định Lõi Prompt AI (System Injection Parameter)</span>
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mã lệnh điều hướng RAG</span>
            </div>

            <textarea
              value={adminSystemPromptOverride}
              onChange={(e) => setAdminSystemPromptOverride(e.target.value)}
              style={{ width: '100%', height: '80px', padding: '12px', backgroundColor: '#000000', color: 'var(--accent-lime)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', fontFamily: 'monospace', resize: 'vertical', outline: 'none' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '8px', fontStyle: 'italic' }}>
              ℹ️ Thay đổi chuỗi này sẽ ghi đè trực tiếp tham số khởi tạo ma trận hạch toán đầu vào của AI khi truy vấn Sổ sách Kế toán hoặc xuất file chuẩn iHTKK.
            </span>
          </div>

        </main>

        <footer style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: 'var(--text-muted)' }}>
          Hệ thống Quản trị Lõi SmartTax AI • Hoạt động hoàn toàn độc lập và bảo mật cao cấp trên Vercel Edge Serverless.
        </footer>
      </div>
    );
  }

  return (
    <div className="app-container">
      
      {/* MONERA FINANCE INSPIRED PREMIUM HEADER */}
      <header className="premium-header">
        
        {/* Brand Logo & Name */}
        <div className="header-brand">
          <div className="brand-logo">
            <Sparkles size={20} color="#000000" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex-row-center">
              <span className="brand-title">SmartTax<span style={{ color: 'var(--accent-lime)' }}>.AI</span></span>
              <span className="badge badge-lime" style={{ fontSize: '9px' }}>🇻🇳 VN PLATFORM</span>
            </div>
            <p className="brand-subtitle">Tài chính & Thuế Tối ưu</p>
          </div>
        </div>

        {/* Multi-Tenant Switcher */}
        <div className="tenant-selector-wrapper">
          <Building2 size={18} color="var(--accent-lime)" />
          <div className="tenant-info">
            <span className="tenant-label">Đơn vị Hạch toán</span>
            <select 
              value={activeTenantId} 
              onChange={(e) => {
                const nextTenantId = e.target.value;
                setActiveTenantId(nextTenantId);
                setUploadedFileName(null);
                setOcrParsingStatus('IDLE');
                setNewOcrResult(null);
                
                // Auto switch default form to fit tenant's tax regime
                const matched = MOCK_TENANTS.find(t => t.id === nextTenantId);
                if (matched && matched.accountingRegime === 'TT88') {
                  setSelectedDeclarationForm('01/CNKD');
                } else {
                  setSelectedDeclarationForm('01/GTGT');
                }
                // Trigger background compilation update
                setTimeout(() => handleCalculateDynamicReport(), 50);
              }}
              className="tenant-select"
            >
              {MOCK_TENANTS.map(t => (
                <option key={t.id} value={t.id}>
                  {t.companyName} • [{t.accountingRegime}]
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '12px', marginLeft: '4px' }}>
            <span className="tenant-label" style={{ display: 'block' }}>Mã số thuế</span>
            <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 700 }} className="font-mono">
              {tenant.taxCode}
            </span>
          </div>
        </div>

        {/* Global Connection Ticker & User Widget */}
        <div className="header-widgets">
          <div className="status-pill" style={{ display: window.innerWidth > 768 ? 'flex' : 'none' }}>
            <span className="live-indicator"></span>
            <span style={{ color: 'var(--text-muted)' }}>Cổng GDT:</span>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>Đã đồng bộ</span>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span style={{ color: 'var(--accent-lime)', fontWeight: 700 }}>SmartCA Chờ ký</span>
          </div>

          <div className="user-profile-badge">
            <div className="avatar-ring">
              <div className="avatar-inner">CG</div>
            </div>
            <div style={{ textAlign: 'left', display: window.innerWidth > 480 ? 'block' : 'none' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>Chuyên gia Thuế</p>
              <span style={{ fontSize: '10px', color: 'var(--accent-emerald)', fontWeight: 600 }}>Kế toán trưởng AI</span>
            </div>
          </div>
        </div>

      </header>

      {/* QUICK SYSTEM REGIME ACCENT BANNER */}
      <div className="regime-banner">
        <div className="flex-row-center">
          <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '11px' }} className="font-mono">
            Chế độ:
          </span>
          <span style={{ fontWeight: 700, color: '#ffffff' }}>
            {tenant.accountingRegime === 'TT133' 
              ? 'Thông tư 133/2016/TT-BTC • Dành cho Doanh nghiệp Nhỏ và Vừa (SMEs)' 
              : 'Thông tư 88/2021/TT-BTC • Dành cho Hộ kinh doanh, Cá nhân kinh doanh'}
          </span>
        </div>
        <div className="flex-row-center" style={{ gap: '16px' }}>
          <span>Đại diện: <strong style={{ color: '#ffffff' }}>{tenant.legalRepresentative}</strong></span>
          <span>•</span>
          <span>Ngành nghề: <span style={{ color: '#ffffff', fontWeight: 500 }}>{tenant.industry}</span></span>
        </div>
      </div>

      {/* MAIN WORKSPACE WRAPPER */}
      <div className="main-workspace">
        
        {/* SIDEBAR PANEL */}
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


          <div className="sidebar-title" style={{ marginTop: '12px' }}>Kiến trúc Hệ thống</div>
          
          <button 
            onClick={() => setActiveTab('structure')}
            className={`sidebar-btn ${activeTab === 'structure' ? 'active' : ''}`}
          >
            <div className="sidebar-btn-left">
              <Database size={16} />
              <span>Lõi DB & Schema</span>
            </div>
          </button>

          {/* SIDEBAR SUMMARY FOOTER BOX */}
          <div className="sidebar-summary-box">
            <div className="summary-card-inner">
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>LẦN ĐỒNG BỘ CUỐI</span>
              <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 700, display: 'block', marginTop: '2px' }} className="font-mono">
                {tenant.lastSyncTime}
              </span>
              
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>RLS Policy:</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} /> Đã cô lập
                </span>
              </div>
            </div>
          </div>

        </aside>

        {/* MAIN DYNAMIC CONTENT AREA */}
        <main className="content-area">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in content-area">
              
              {/* TOP CARDS ROW */}
              <div className="bento-grid-3">
                
                <div className="glass-panel stat-card glow-border">
                  <div className="stat-backdrop-icon">
                    <ArrowUpRight color="var(--accent-lime)" />
                  </div>
                  <div>
                    <span className="stat-label">Tổng Doanh thu (Năm 2026)</span>
                    <div className="stat-value">{formatCurrency(tenant.totalRevenue)}</div>
                  </div>
                  
                  <div className="stat-footer">
                    <span style={{ color: 'var(--text-secondary)' }}>Hóa đơn điện tử:</span>
                    <span style={{ color: 'var(--accent-lime)', fontWeight: 700 }}>100% GDT Verified</span>
                  </div>
                </div>

                <div className="glass-panel stat-card">
                  <div className="stat-backdrop-icon">
                    <ArrowDownLeft color="var(--accent-rose)" />
                  </div>
                  <div>
                    <span className="stat-label">Tổng Chi phí hợp lệ được trừ</span>
                    <div className="stat-value">{formatCurrency(tenant.totalExpenses)}</div>
                  </div>
                  
                  <div className="stat-footer">
                    <span style={{ color: 'var(--text-secondary)' }}>Tỷ suất Lợi nhuận gộp ước tính:</span>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                      {((tenant.totalRevenue - tenant.totalExpenses) / tenant.totalRevenue * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="glass-panel stat-card" style={{ background: 'linear-gradient(to bottom right, var(--surface-card), rgba(204,255,0,0.03))' }}>
                  <span className="stat-label">Nghĩa vụ Thuế phát sinh</span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '12px 0' }}>
                    <div className="flex-row-between">
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Thuế GTGT phải nộp:</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }} className="font-mono">{formatCurrency(tenant.taxLiabilities.vat)}</span>
                    </div>
                    
                    {tenant.accountingRegime === 'TT133' ? (
                      <div className="flex-row-between">
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Thuế TNDN tạm tính (20%):</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-rose)' }} className="font-mono">{formatCurrency(tenant.taxLiabilities.cit)}</span>
                      </div>
                    ) : (
                      <div className="flex-row-between">
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Thuế suất khoán Hộ KD:</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-purple)', fontSize: '11px' }}>Không áp dụng TNDN</span>
                      </div>
                    )}

                    <div className="flex-row-between">
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Thuế TNCN khấu trừ:</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }} className="font-mono">{formatCurrency(tenant.taxLiabilities.pit)}</span>
                    </div>
                  </div>
                  
                  <div className="stat-footer" style={{ fontSize: '10px', color: 'var(--text-muted)', justifyContent: 'flex-end' }}>
                    Tự động tổng hợp dữ liệu hóa đơn Đầu vào/Đầu ra
                  </div>
                </div>

              </div>

              {/* DYNAMIC CHART SIMULATION CARD */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div className="panel-header-row">
                  <div>
                    <div className="panel-title">
                      <span>Biểu đồ Tăng trưởng Doanh thu vs Chi phí (2026)</span>
                      <span className="badge badge-lime" style={{ fontSize: '10px', fontWeight: 600 }}>Đơn vị: Triệu VND</span>
                    </div>
                    <p className="panel-subtitle">
                      {tenant.accountingRegime === 'TT133' 
                        ? 'Dữ liệu hạch toán kép phát sinh theo thời gian thực từ phần mềm SmartTax AI' 
                        : 'Sổ chi tiết doanh thu và chi phí sản xuất kinh doanh theo Thông tư 88'}
                    </p>
                  </div>

                  <div className="flex-row-center" style={{ gap: '16px', fontSize: '12px', fontWeight: 600 }}>
                    <div className="flex-row-center">
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--accent-lime)' }}></span>
                      <span>Doanh thu bán hàng</span>
                    </div>
                    <div className="flex-row-center">
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--accent-rose)' }}></span>
                      <span>Chi phí kinh doanh</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Visual Multi-bar Layout Array */}
                <div style={{ height: '260px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', padding: '20px 0 10px', borderBottom: '1px solid var(--border-color)', position: 'relative', marginTop: '16px' }}>
                  
                  {/* Backdrop guidelines */}
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '30px', borderBottom: '1px dashed rgba(255,255,255,0.05)', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }} className="font-mono">200 Tr</div>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '110px', borderBottom: '1px dashed rgba(255,255,255,0.05)', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }} className="font-mono">120 Tr</div>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '190px', borderBottom: '1px dashed rgba(255,255,255,0.05)', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }} className="font-mono">60 Tr</div>

                  {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].map((m, idx) => {
                    const rev = tenant.monthlyRevenue[idx] || 0;
                    const exp = tenant.monthlyExpenses[idx] || 0;
                    
                    const revHeight = Math.min(100, (rev / 200) * 100);
                    const expHeight = Math.min(100, (exp / 200) * 100);

                    return (
                      <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', zIndex: 10 }}>
                        <div style={{ width: '100%', maxWidth: '36px', display: 'flex', alignItems: 'flex-end', gap: '2px', height: '100%', justifyContent: 'center' }}>
                          <div 
                            style={{ height: `${revHeight}%`, width: '100%', backgroundColor: 'var(--accent-lime)', borderRadius: '4px 4px 0 0', opacity: 0.85 }} 
                          ></div>
                          <div 
                            style={{ height: `${expHeight}%`, width: '100%', backgroundColor: 'var(--accent-rose)', borderRadius: '4px 4px 0 0', opacity: 0.85 }} 
                          ></div>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 700 }}>{m}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '13px' }}>
                  <div className="flex-row-center" style={{ color: 'var(--accent-lime)', fontWeight: 700 }}>
                    <Sparkles size={16} />
                    <span>AI dự báo: Doanh thu duy trì đà tăng trưởng 12% so với cùng kỳ quý trước.</span>
                  </div>
                  <button 
                    onClick={() => setActiveTab('reporting')}
                    style={{ background: 'transparent', border: 'none', color: '#ffffff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>Xem báo cáo chi tiết</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* RECENT INVOICES LIST TABLE PREVIEW */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div className="panel-header-row">
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hóa đơn điện tử phát sinh gần đây</span>
                    <h4 style={{ fontSize: '14px', color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>Tự động bắt dữ liệu từ cổng GDT và hạch toán vào sổ</h4>
                  </div>
                  <button onClick={() => setActiveTab('sync')} className="btn-secondary">
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
                            <div style={{ fontWeight: 700, color: '#ffffff' }} className="font-mono">{inv.symbol}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="font-mono">#{inv.number}</div>
                          </td>
                          <td style={{ color: '#ffffff' }} className="font-mono">{inv.issueDate}</td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#ffffff' }}>{inv.counterpartName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="font-mono">MST: {inv.counterpartTaxCode}</div>
                          </td>
                          <td>
                            <span className={`badge ${inv.type === 'INCOMING' ? 'badge-warning' : 'badge-success'}`}>
                              {inv.type === 'INCOMING' ? '📉 Mua vào' : '📈 Bán ra'}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, color: '#ffffff' }} className="font-mono">{formatCurrency(inv.totalAmount)}</td>
                          <td><span style={{ color: '#ffffff', fontWeight: 700 }} className="font-mono">{inv.vatRate}</span></td>
                          <td>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#d4a6ff', backgroundColor: 'rgba(157,0,255,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(157,0,255,0.2)' }} className="font-mono">
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
            <div className="animate-fade-in content-area">
              
              <div className="glass-panel glow-border" style={{ padding: '24px' }}>
                <div className="panel-title" style={{ marginBottom: '4px' }}>Cổng Kết nối Dữ liệu Tự động (GDT Portals)</div>
                <p className="panel-subtitle">
                  Tự động tra cứu, tải về hóa đơn điện tử mua vào/bán ra từ hệ thống của Tổng cục Thuế theo cơ chế xác thực Token/Chữ ký số doanh nghiệp.
                </p>

                <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--surface-card-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div className="flex-row-center" style={{ gap: '14px' }}>
                    <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(204,255,0,0.1)', color: 'var(--accent-lime)', border: '1px solid rgba(204,255,0,0.2)' }}>
                      <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Trạng thái đồng bộ tự động GDT</div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Hệ thống định kỳ 15 phút tra cứu 1 lần để tải hóa đơn gốc dạng XML bảo mật về máy chủ.
                      </p>
                    </div>
                  </div>

                  <button onClick={handleTriggerGdtSync} disabled={isSyncing} className="btn-primary">
                    <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                    <span>{isSyncing ? 'Đang truy vấn cổng GDT...' : 'Kích hoạt Đồng bộ thủ công ngay'}</span>
                  </button>
                </div>

                {/* API Real-Time Log */}
                <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#000000', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxHeight: '160px', overflowY: 'auto' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '8px' }}>Log Giao Tiếp API Tổng cục Thuế</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }} className="font-mono">
                    {syncLog.map((log, index) => (
                      <div key={index} style={{ color: 'var(--accent-emerald)' }}>{log}</div>
                    ))}
                    {isSyncing && (
                      <div style={{ color: 'var(--accent-lime)', fontWeight: 700, animation: 'pulse 2s infinite' }}>
                        &gt; Đang bóc tách mã bảo mật XML & xác thực con dấu điện tử...
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* OCR MODULE DUAL BENTO BLOCK */}
              <div className="bento-grid-2">
                
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div className="flex-row-center" style={{ marginBottom: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(157,0,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UploadCloud size={16} color="#d4a6ff" />
                      </div>
                      <div className="panel-title" style={{ fontSize: '16px' }}>AI OCR & Parsing Engine</div>
                    </div>
                    <p className="panel-subtitle" style={{ marginBottom: '16px' }}>
                      Kéo thả file hóa đơn điện tử định dạng XML hoặc PDF độc lập để Trí tuệ nhân tạo bóc tách doanh thu/chi phí ngay lập tức.
                    </p>

                    {/* DUMMY FILE DROP ZONE */}
                    <div style={{ border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)', padding: '28px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                      <UploadCloud size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Kéo thả file XML/PDF hóa đơn vào đây</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Hỗ trợ định dạng hóa đơn chuẩn Thông tư 78</div>
                      
                      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Mô phỏng upload file mẫu:</span>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => handleSimulateFileUpload('hoadon_muavao_server_aws.xml', 'INCOMING', 18000000)}
                            style={{ backgroundColor: '#000000', color: '#d4a6ff', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }} className="font-mono"
                          >
                            📄 hoadon_muavao_aws.xml
                          </button>

                          <button 
                            onClick={() => handleSimulateFileUpload('hoadon_banra_phanmem.pdf', 'OUTGOING', 40000000)}
                            style={{ backgroundColor: '#000000', color: 'var(--accent-emerald)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }} className="font-mono"
                          >
                            📄 hoadon_banra_pm.pdf
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {uploadedFileName && (
                    <div style={{ marginTop: '16px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(157,0,255,0.1)', border: '1px solid rgba(157,0,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }} className="animate-fade-in">
                      <div className="flex-row-center">
                        <FileCode size={16} color="#d4a6ff" />
                        <span style={{ color: '#ffffff', fontWeight: 700 }} className="font-mono">{uploadedFileName}</span>
                      </div>
                      
                      {ocrParsingStatus === 'PARSING' ? (
                        <span style={{ color: 'var(--accent-lime)', fontWeight: 700 }}>Đang trích xuất AI...</span>
                      ) : (
                        <span className="badge badge-ai">✔ Phân tích 99.2%</span>
                      )}
                    </div>
                  )}

                </div>

                {/* PARSING LIVE RESULT PREVIEW */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Kết quả Tự động hạch toán AI</div>
                  
                  {newOcrResult ? (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      <div style={{ padding: '16px', backgroundColor: 'var(--surface-card-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="flex-row-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tên Đối tác / NCC:</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', textAlign: 'right' }}>{newOcrResult.counterpartName}</span>
                        </div>

                        <div className="flex-row-between">
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Số hóa đơn / Ký hiệu:</span>
                          <span style={{ color: 'var(--accent-lime)', fontWeight: 700, fontSize: '12px' }} className="font-mono">{newOcrResult.symbol} - #{newOcrResult.number}</span>
                        </div>

                        <div className="flex-row-between">
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Số tiền trước thuế:</span>
                          <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '12px' }} className="font-mono">{formatCurrency(newOcrResult.preTaxAmount || 0)}</span>
                        </div>

                        <div className="flex-row-between">
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Thuế suất GTGT:</span>
                          <span style={{ color: 'var(--accent-amber)', fontWeight: 700, fontSize: '12px' }} className="font-mono">{newOcrResult.vatRate}</span>
                        </div>

                        <div className="flex-row-between" style={{ paddingTop: '6px', borderTop: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tổng thanh toán:</span>
                          <span style={{ color: 'var(--accent-lime)', fontWeight: 800, fontSize: '14px' }} className="font-mono">{formatCurrency(newOcrResult.totalAmount || 0)}</span>
                        </div>
                      </div>

                      <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(157,0,255,0.05)', border: '1px solid rgba(157,0,255,0.2)' }}>
                        <div className="flex-row-center" style={{ fontSize: '12px', fontWeight: 700, color: '#d4a6ff', marginBottom: '10px' }}>
                          <Sparkles size={14} />
                          <span>Gợi ý Hạch toán theo {tenant.accountingRegime === 'TT133' ? 'Thông tư 133' : 'Thông tư 88'}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div style={{ backgroundColor: '#000000', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>TÀI KHOẢN NỢ</span>
                            <strong style={{ color: 'var(--accent-lime)', fontSize: '12px' }} className="font-mono">{newOcrResult.suggestedDebitAcc}</strong>
                          </div>
                          <div style={{ backgroundColor: '#000000', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>TÀI KHOẢN CÓ</span>
                            <strong style={{ color: 'var(--accent-rose)', fontSize: '12px' }} className="font-mono">{newOcrResult.suggestedCreditAcc}</strong>
                          </div>
                        </div>

                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px', lineHeight: 1.4 }}>
                          Hệ thống đã tự động ghi nhận vào Sổ Nhật Ký chung và Sổ chi tiết thuế GTGT. Không cần nhập liệu tay!
                        </p>
                      </div>

                    </div>
                  ) : (
                    <div style={{ height: '100%', minHeight: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <FileCode size={36} color="rgba(255,255,255,0.1)" style={{ marginBottom: '8px' }} />
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Chưa có file hóa đơn nào được bóc tách gần đây.</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Hãy upload file hoặc bấm nút mô phỏng ở ô bên trái để kiểm tra AI.</div>
                    </div>
                  )}

                </div>

              </div>

              {/* LIST OF CURRENT LOCAL INVOICES */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Danh sách toàn bộ Hóa đơn hiện có ({currentInvoices.length})</div>
                
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
                            <div style={{ fontWeight: 700, color: '#ffffff' }} className="font-mono">{inv.symbol}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="font-mono">#{inv.number}</div>
                          </td>
                          <td style={{ color: '#ffffff' }} className="font-mono">{inv.issueDate}</td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#ffffff' }}>{inv.counterpartName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="font-mono">MST: {inv.counterpartTaxCode}</div>
                          </td>
                          <td>
                            <span className={`badge ${inv.type === 'INCOMING' ? 'badge-warning' : 'badge-success'}`}>
                              {inv.type === 'INCOMING' ? '📉 Mua vào' : '📈 Bán ra'}
                            </span>
                          </td>
                          <td style={{ color: '#ffffff', fontWeight: 700 }} className="font-mono">{formatCurrency(inv.preTaxAmount)}</td>
                          <td><span style={{ color: 'var(--accent-amber)', fontWeight: 700 }} className="font-mono">{inv.vatRate}</span></td>
                          <td style={{ color: 'var(--accent-emerald)', fontWeight: 700 }} className="font-mono">{formatCurrency(inv.totalAmount)}</td>
                          <td>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#d4a6ff', backgroundColor: 'rgba(157,0,255,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(157,0,255,0.2)' }} className="font-mono">
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
            <div className="animate-fade-in content-area">
              
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div className="panel-header-row">
                  <div>
                    <div className="panel-title">
                      <span>Sổ Kế toán Hạch toán Kép Tự động</span>
                      <span className="badge badge-lime font-mono" style={{ fontSize: '11px' }}>
                        {tenant.accountingRegime === 'TT133' ? 'Chế độ Thông tư 133' : 'Chế độ Thông tư 88'}
                      </span>
                    </div>
                    <p className="panel-subtitle">
                      Mỗi khi hóa đơn phát sinh, AI Engine tự động định khoản tài khoản kế toán cấp 1 & cấp 2 phù hợp với ngành nghề kinh doanh.
                    </p>
                  </div>

                  <div className="flex-row-center">
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>Hiển thị:</span>
                    <span style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '12px', fontWeight: 700, color: '#ffffff', border: '1px solid var(--border-color)' }}>Sổ Nhật Ký Chung</span>
                  </div>
                </div>

                {/* INFO EXPLANATION BOX */}
                <div style={{ padding: '16px', backgroundColor: 'var(--surface-card-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '24px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--accent-lime)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>💡 Cơ sở Pháp lý hạch toán:</strong>
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
                          <td style={{ color: '#ffffff' }} className="font-mono">{je.date}</td>
                          <td>
                            <span style={{ fontWeight: 700, color: '#ffffff', backgroundColor: '#000000', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px' }} className="font-mono">
                              {je.voucherCode}
                            </span>
                          </td>
                          <td>
                            <div style={{ color: '#ffffff', fontWeight: 700 }}>{je.description}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px', fontWeight: 700 }} className="font-mono">
                              <div style={{ color: 'var(--accent-lime)' }}>Nợ: {je.debitAccount}</div>
                              <div style={{ color: 'var(--accent-rose)' }}>Có: {je.creditAccount}</div>
                            </div>
                          </td>
                          <td style={{ color: '#ffffff', fontWeight: 800, fontSize: '14px' }} className="font-mono">{formatCurrency(je.amount)}</td>
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
            <div className="animate-fade-in content-area">
              
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div className="panel-header-row">
                  <div>
                    <div className="panel-title">
                      <span>Hệ thống Radar Rủi ro Thuế (Tax Risk Radar)</span>
                      <span className="badge badge-warning">Cảnh báo Trực tuyến</span>
                    </div>
                    <p className="panel-subtitle">
                      Tự động quét toàn bộ hóa đơn đầu vào/đầu ra, đối chiếu chéo danh sách đen doanh nghiệp bỏ trốn của TCT và các mẫu hình xuất hóa đơn bất thường.
                    </p>
                  </div>

                  {/* FILTER BUTTONS */}
                  <div className="flex-row-center" style={{ backgroundColor: 'var(--surface-card-elevated)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setRiskFilter(lvl)}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: riskFilter === lvl ? 'rgba(255,255,255,0.1)' : 'transparent', color: riskFilter === lvl ? '#ffffff' : 'var(--text-muted)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {lvl === 'ALL' ? 'Tất cả' : lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SENSITIVITY INDICATOR */}
                <div style={{ padding: '16px', backgroundColor: 'var(--surface-card-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div className="flex-row-center" style={{ gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(255,170,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={16} color="var(--accent-amber)" />
                    </div>
                    <div>
                      <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '13px', display: 'block' }}>Độ nhạy quét Rủi ro AI Engine</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mức hiện tại: Nâng cao (Bao gồm rà soát ngày xuất hóa đơn và tuổi đời NCC)</span>
                    </div>
                  </div>

                  <div className="flex-row-center">
                    <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '12px' }}>Ngưỡng:</span>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(255,170,0,0.1)', color: 'var(--accent-amber)', fontSize: '12px', fontWeight: 700 }} className="font-mono">Cao (High Precision)</span>
                  </div>
                </div>

                {/* ALERTS LIST CARDS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredAlerts.map(alert => {
                    
                    let borderColor = 'var(--border-color)';
                    let bgTint = 'transparent';
                    let textAccent = 'var(--text-secondary)';
                    if (alert.level === 'CRITICAL') {
                      borderColor = 'rgba(255,51,102,0.3)';
                      bgTint = 'rgba(255,51,102,0.02)';
                      textAccent = 'var(--accent-rose)';
                    } else if (alert.level === 'WARNING') {
                      borderColor = 'rgba(255,170,0,0.3)';
                      bgTint = 'rgba(255,170,0,0.02)';
                      textAccent = 'var(--accent-amber)';
                    } else {
                      borderColor = 'rgba(0,229,255,0.3)';
                      bgTint = 'rgba(0,229,255,0.02)';
                      textAccent = 'var(--accent-cyan)';
                    }

                    return (
                      <div key={alert.id} style={{ padding: '20px', borderRadius: 'var(--radius-md)', border: `1px solid ${borderColor}`, backgroundColor: bgTint, position: 'relative' }}>
                        
                        <div className="flex-row-between" style={{ marginBottom: '10px', alignItems: 'flex-start' }}>
                          <div className="flex-row-center" style={{ gap: '10px' }}>
                            <AlertTriangle size={18} style={{ color: textAccent, flexShrink: 0 }} />
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }} className="font-mono">{alert.title}</div>
                          </div>

                          <div className="flex-row-center">
                            {alert.detectedOnInvoice && (
                              <span style={{ fontSize: '11px', backgroundColor: '#000000', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', color: '#ffffff', fontWeight: 700 }} className="font-mono">
                                HĐ: #{alert.detectedOnInvoice}
                              </span>
                            )}
                            <span className={`badge ${alert.level === 'CRITICAL' ? 'badge-danger' : alert.level === 'WARNING' ? 'badge-warning' : 'badge-info'}`}>
                              {alert.level}
                            </span>
                          </div>
                        </div>

                        <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '16px', lineHeight: 1.4 }}>
                          {alert.description}
                        </p>

                        <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                          <strong style={{ fontSize: '10px', color: 'var(--accent-lime)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            💡 Tư vấn Khắc phục từ Chuyên gia Thuế:
                          </strong>
                          <p style={{ fontSize: '12px', color: '#ffffff', fontWeight: 600 }}>
                            {alert.recommendation}
                          </p>
                        </div>

                        <div style={{ marginTop: '10px', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', fontWeight: 700 }} className="font-mono">
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
            <div className="animate-fade-in content-area">
              
              <div className="glass-panel glow-border" style={{ padding: '24px' }}>
                <div className="panel-header-row" style={{ marginBottom: '16px' }}>
                  <div>
                    <div className="panel-title">
                      <span>Tự động Sinh Báo cáo Thuế &amp; Kết xuất XML HTKK</span>
                      <span className="badge badge-lime">Auto Generator</span>
                    </div>
                    <p className="panel-subtitle">
                      Hệ thống tự động lọc các giao dịch mua vào/bán ra từ Sổ Cái kế toán tương ứng với chu kỳ (Tháng/Quý/Năm) để tính toán chính xác số liệu đưa thẳng vào tờ khai mã vạch.
                    </p>
                  </div>

                  <button 
                    onClick={() => handleCalculateDynamicReport()} 
                    disabled={isGeneratingReport}
                    className="btn-primary"
                  >
                    <RefreshCw size={14} className={isGeneratingReport ? 'animate-spin' : ''} />
                    <span>{isGeneratingReport ? 'Đang tổng hợp Sổ Cái...' : '⚡ Tổng hợp Lại Số Liệu'}</span>
                  </button>
                </div>

                {/* PERIOD & FORM TYPE SELECTORS ROW */}
                <div className="bento-grid-3" style={{ marginBottom: '24px' }}>
                  
                  {/* Select Form Type */}
                  <div style={{ padding: '16px', backgroundColor: 'var(--surface-card-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>1. Mẫu Tờ khai áp dụng</span>
                    <select 
                      value={selectedDeclarationForm} 
                      onChange={(e) => setSelectedDeclarationForm(e.target.value)}
                      style={{ backgroundColor: '#000000', color: 'var(--accent-lime)', fontSize: '13px', fontWeight: 700, padding: '8px 12px', borderRadius: '6px', width: '100%', border: '1px solid var(--border-color)', outline: 'none', cursor: 'pointer' }}
                      className="font-mono"
                    >
                      {tenant.accountingRegime === 'TT133' ? (
                        <>
                          <option value="01/GTGT">Mẫu 01/GTGT (Thuế GTGT Khấu trừ)</option>
                          <option value="04/GTGT">Mẫu 04/GTGT (Thuế GTGT Trực tiếp)</option>
                          <option value="05/KK-TNCN">Mẫu 05/KK-TNCN (Thuế TNCN)</option>
                          <option value="03/TNDN">Mẫu 03/TNDN (Quyết toán TNDN)</option>
                        </>
                      ) : (
                        <option value="01/CNKD">Mẫu 01/CNKD (Hộ kinh doanh TT88)</option>
                      )}
                    </select>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                      {tenant.accountingRegime === 'TT133' ? 'Áp dụng Thông tư 133/2016' : 'Áp dụng Thông tư 88/2021'}
                    </span>
                  </div>

                  {/* Select Period Range */}
                  <div style={{ padding: '16px', backgroundColor: 'var(--surface-card-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>2. Chu kỳ Báo cáo</span>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '8px' }}>
                      {(['MONTH', 'QUARTER', 'YEAR'] as const).map(pt => (
                        <button
                          key={pt}
                          onClick={() => {
                            setReportPeriodType(pt);
                            const defaultVal = pt === 'MONTH' ? '04' : (pt === 'QUARTER' ? '2' : '2026');
                            setReportPeriodValue(defaultVal);
                            setTimeout(() => handleCalculateDynamicReport(pt, defaultVal), 50);
                          }}
                          style={{ padding: '6px 4px', fontSize: '11px', fontWeight: 700, borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: reportPeriodType === pt ? 'var(--accent-lime)' : '#000000', color: reportPeriodType === pt ? '#000000' : 'var(--text-muted)' }}
                        >
                          {pt === 'MONTH' ? 'Theo Tháng' : pt === 'QUARTER' ? 'Theo Quý' : 'Theo Năm'}
                        </button>
                      ))}
                    </div>

                    <div className="flex-row-center">
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Chọn {reportPeriodType === 'MONTH' ? 'tháng' : reportPeriodType === 'QUARTER' ? 'quý' : 'năm'}:</span>
                      <select 
                        value={reportPeriodValue}
                        onChange={(e) => {
                          const v = e.target.value;
                          setReportPeriodValue(v);
                          setTimeout(() => handleCalculateDynamicReport(reportPeriodType, v), 50);
                        }}
                        style={{ backgroundColor: '#000000', color: '#ffffff', fontSize: '12px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
                        className="font-mono"
                      >
                        {reportPeriodType === 'MONTH' && (
                          <>
                            <option value="01">Tháng 01</option>
                            <option value="02">Tháng 02</option>
                            <option value="03">Tháng 03</option>
                            <option value="04">Tháng 04</option>
                            <option value="05">Tháng 05</option>
                            <option value="06">Tháng 06</option>
                            <option value="07">Tháng 07</option>
                            <option value="08">Tháng 08</option>
                            <option value="09">Tháng 09</option>
                            <option value="10">Tháng 10</option>
                            <option value="11">Tháng 11</option>
                            <option value="12">Tháng 12</option>
                          </>
                        )}
                        {reportPeriodType === 'QUARTER' && (
                          <>
                            <option value="1">Quý 1</option>
                            <option value="2">Quý 2</option>
                            <option value="3">Quý 3</option>
                            <option value="4">Quý 4</option>
                          </>
                        )}
                        {reportPeriodType === 'YEAR' && (
                          <>
                            <option value="2025">Năm 2025</option>
                            <option value="2026">Năm 2026</option>
                            <option value="2027">Năm 2027</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Deadline & SmartCA Info */}
                  <div style={{ padding: '16px', backgroundColor: 'var(--surface-card-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Hạn nộp theo Luật 38</span>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '2px' }} className="font-mono">
                        {generatedReportSummary?.deadlineStr || '20/05/2026'}
                      </div>
                    </div>

                    <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Chữ ký số tích hợp</span>
                      <div className="flex-row-center">
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-lime)' }}></span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>SmartCA VN (Ready)</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* AUTOMATED METRICS BOARD PRESENTATION */}
                {generatedReportSummary && (
                  <div className="animate-fade-in" style={{ padding: '20px', borderRadius: 'var(--radius-md)', backgroundColor: '#000000', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                    <div className="flex-row-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Bảng phân tích số liệu hạch toán: <strong style={{ color: '#ffffff' }}>{generatedReportSummary.periodText}</strong>
                      </span>
                      <span className="badge badge-ai" style={{ fontSize: '10px' }}>✔ AI Engine Verified</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      
                      <div style={{ padding: '12px', backgroundColor: 'var(--surface-card-elevated)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tổng Doanh Thu Phát Sinh</span>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }} className="font-mono">
                          {formatCurrency(generatedReportSummary.totalRevenueBase)}
                        </div>
                      </div>

                      {tenant.accountingRegime === 'TT133' ? (
                        <>
                          <div style={{ padding: '12px', backgroundColor: 'var(--surface-card-elevated)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Thuế GTGT Đầu vào Khấu trừ</span>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-cyan)' }} className="font-mono">
                              {formatCurrency(generatedReportSummary.totalVatDeductible)}
                            </div>
                          </div>

                          <div style={{ padding: '12px', backgroundColor: 'var(--surface-card-elevated)', borderRadius: '6px', border: '1px solid rgba(204,255,0,0.15)' }}>
                            <span style={{ fontSize: '10px', color: 'var(--accent-lime)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Thuế GTGT Phải Nộp Cuối Kỳ</span>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-lime)' }} className="font-mono">
                              {formatCurrency(generatedReportSummary.payableVat)}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ padding: '12px', backgroundColor: 'var(--surface-card-elevated)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Thuế Khoán GTGT (1.5%)</span>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-amber)' }} className="font-mono">
                              {formatCurrency(Math.round(generatedReportSummary.totalRevenueBase * 0.015))}
                            </div>
                          </div>

                          <div style={{ padding: '12px', backgroundColor: 'var(--surface-card-elevated)', borderRadius: '6px', border: '1px solid rgba(204,255,0,0.15)' }}>
                            <span style={{ fontSize: '10px', color: 'var(--accent-lime)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Tổng Thuế Khoán Phải Nộp</span>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-lime)' }} className="font-mono">
                              {formatCurrency(Math.round(generatedReportSummary.totalRevenueBase * 0.02))}
                            </div>
                          </div>
                        </>
                      )}

                    </div>

                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '12px', fontStyle: 'italic' }}>
                      ℹ️ {generatedReportSummary.verifiedLog}
                    </p>
                  </div>
                )}

                {/* COMPANION: 04 MANDATORY ACCOUNTING BOOKS FOR CIRCULAR 88 BUSINESS HOUSEHOLDS */}
                {tenant.accountingRegime === 'TT88' && (
                  <div className="animate-fade-in" style={{ padding: '20px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-card-elevated)', border: '1px solid var(--accent-amber)', marginBottom: '24px' }}>
                    <div className="flex-row-between" style={{ marginBottom: '12px' }}>
                      <div className="flex-row-center" style={{ gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>📖</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Hệ thống Sổ Kế toán Hộ kinh doanh (Bắt buộc theo TT 88/2021/TT-BTC)</span>
                      </div>
                      <span className="badge badge-amber" style={{ fontSize: '10px' }}>Tự động ghi nhận</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      AI tự động phân loại giao dịch hàng ngày vào 4 mẫu sổ chuyên biệt. Hỗ trợ đối soát dòng tiền và xác thực chi phí hợp lệ.
                    </p>

                    {/* Book Switch Tabs */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {(['S1', 'S2', 'S3', 'S4'] as const).map(bCode => {
                        const labelsMap = {
                          S1: 'Sổ S1: Chi tiết Doanh thu',
                          S2: 'Sổ S2: Chi tiết Hàng hóa',
                          S3: 'Sổ S3: Chi phí SXKD',
                          S4: 'Sổ S4: Nghĩa vụ Thuế'
                        };
                        const isActive = selectedCircular88Book === bCode;
                        return (
                          <button
                            key={bCode}
                            onClick={() => setSelectedCircular88Book(bCode)}
                            style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700, borderRadius: '20px', border: isActive ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)', backgroundColor: isActive ? 'rgba(255,170,0,0.1)' : '#000000', color: isActive ? 'var(--accent-amber)' : 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            {labelsMap[bCode]}
                          </button>
                        );
                      })}
                    </div>

                    {/* Book Entries Table Presentation */}
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '8px', fontWeight: 600 }}>Ngày ghi sổ</th>
                            <th style={{ padding: '8px', fontWeight: 600 }}>Số CT</th>
                            <th style={{ padding: '8px', fontWeight: 600 }}>Nội dung diễn giải</th>
                            <th style={{ padding: '8px', fontWeight: 600, textAlign: 'right' }}>Số tiền (VND)</th>
                            <th style={{ padding: '8px', fontWeight: 600 }}>Ghi chú / Đối soát AI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {MOCK_CIRCULAR_88_BOOKS.filter(b => b.bookCode === selectedCircular88Book).map(entry => (
                            <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '8px', color: 'var(--text-secondary)' }} className="font-mono">{entry.entryDate}</td>
                              <td style={{ padding: '8px', color: 'var(--accent-cyan)', fontWeight: 700 }} className="font-mono">{entry.voucherRef}</td>
                              <td style={{ padding: '8px', color: '#ffffff' }}>{entry.description}</td>
                              <td style={{ padding: '8px', color: 'var(--accent-lime)', fontWeight: 700, textAlign: 'right' }} className="font-mono">
                                {formatCurrency(entry.amount)}
                              </td>
                              <td style={{ padding: '8px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{entry.note || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* XML RAW EMBEDDED PREVIEW */}
                <div>
                  <div className="flex-row-between" style={{ backgroundColor: '#000000', padding: '12px 16px', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', border: '1px solid var(--border-color)', borderBottom: 'none' }}>
                    <span className="flex-row-center font-mono" style={{ fontSize: '12px', color: '#ffffff', fontWeight: 700 }}>
                      <FileCode size={16} color="var(--accent-lime)" />
                      <span>File XML đã Nhúng Tham Số: {selectedDeclarationForm}</span>
                    </span>

                    <button onClick={handleDownloadXml} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      <Download size={14} />
                      <span>📦 Kết xuất File XML chuẩn HTKK</span>
                    </button>
                  </div>

                  {/* Inject live parameters into XML string dynamically */}
                  <pre style={{ backgroundColor: 'var(--bg-base)', padding: '16px', borderRadius: '0 0 var(--radius-md) var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--accent-emerald)', overflowX: 'auto', maxHeight: '380px', lineHeight: 1.4 }} className="font-mono">
                    {(() => {
                      const tpl = MOCK_HTKK_XML_TEMPLATES[selectedDeclarationForm] || 'Không tìm thấy mẫu file.';
                      if (!generatedReportSummary) return tpl;
                      // Replace dummy template indicators with actual computed values to showcase beautiful full-stack intelligence
                      return tpl
                        .replace('<ChiTieu23>132000000</ChiTieu23>', `<ChiTieu23>${generatedReportSummary.totalRevenueBase - 18000000}</ChiTieu23>`)
                        .replace('<ChiTieu25>12500000</ChiTieu25>', `<ChiTieu25>${generatedReportSummary.totalVatDeductible}</ChiTieu25>`)
                        .replace('<ChiTieu27>150000000</ChiTieu27>', `<ChiTieu27>${generatedReportSummary.totalRevenueBase}</ChiTieu27>`)
                        .replace('<ChiTieu40>0</ChiTieu40>', `<ChiTieu40>${generatedReportSummary.payableVat}</ChiTieu40>`)
                        .replace('<DoanhThuTinhThueGTGT>18500000</DoanhThuTinhThueGTGT>', `<DoanhThuTinhThueGTGT>${generatedReportSummary.totalRevenueBase}</DoanhThuTinhThueGTGT>`)
                        .replace('<ThueGTGTPhaiNop>277500</ThueGTGTPhaiNop>', `<ThueGTGTPhaiNop>${Math.round(generatedReportSummary.totalRevenueBase * 0.015)}</ThueGTGTPhaiNop>`)
                        .replace('<TongThuePhaiNop>370000</TongThuePhaiNop>', `<TongThuePhaiNop>${Math.round(generatedReportSummary.totalRevenueBase * 0.02)}</TongThuePhaiNop>`);
                    })()}
                  </pre>
                </div>

                <div style={{ marginTop: '16px', padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(204,255,0,0.03)', border: '1px solid rgba(204,255,0,0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 size={20} color="var(--accent-lime)" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: '12px', color: '#ffffff', fontWeight: 500, lineHeight: 1.4 }}>
                    Hệ thống tự động liên kết dữ liệu với module <strong>RAG pgvector</strong> để nạp các tham số hạn nộp từ Luật Quản lý Thuế số 38/2019/QH14. 
                    Mọi chỉ tiêu kê khai đều sẵn sàng tải thẳng vào phần mềm HTKK 5.x.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 6: AI TAX ADVISOR (RAG SYSTEM) WITH EMBEDDING SOURCES PREVIEW */}
          {activeTab === 'advisor' && (
            <div className="animate-fade-in content-area">
              
              {/* VECTOR DB SOURCES BLOCK */}
              <div className="glass-panel glow-border" style={{ padding: '24px' }}>
                <div className="panel-header-row">
                  <div className="flex-row-center">
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(157,0,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={16} color="#d4a6ff" />
                    </div>
                    <div className="panel-title" style={{ fontSize: '16px' }}>Kho Dữ liệu Đã Nạp (Vector pgvector Store)</div>
                  </div>

                  <span className="badge badge-ai font-mono" style={{ fontSize: '12px' }}>✔ Tổng: 6,110 Chunks</span>
                </div>
                <p className="panel-subtitle" style={{ marginBottom: '16px' }}>
                  Trạng thái nhúng (Embedding) trực tiếp vào Vector Store PostgreSQL (pgvector) bằng mô hình Text-Embedding kích thước 1536 chiều.
                </p>

                {/* THE 4 EMBEDDED KNOWLEDGE SOURCES CARDS GRID */}
                <div className="bento-grid-4">
                  {EMBEDDED_KNOWLEDGE_SOURCES.map(source => {
                    const isSelected = source.id === selectedEmbeddedSourceId;
                    
                    let typeBadgeStyle = { background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: 'none' };
                    if (source.type === 'LUAT') typeBadgeStyle = { background: 'rgba(204,255,0,0.1)', color: 'var(--accent-lime)', border: '1px solid rgba(204,255,0,0.2)' };
                    else if (source.type === 'THONG_TU') typeBadgeStyle = { background: 'rgba(0,229,255,0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,229,255,0.2)' };
                    else if (source.type === 'KE_TOAN') typeBadgeStyle = { background: 'rgba(157,0,255,0.1)', color: '#d4a6ff', border: '1px solid rgba(157,0,255,0.2)' };
                    else typeBadgeStyle = { background: 'rgba(255,170,0,0.1)', color: 'var(--accent-amber)', border: '1px solid rgba(255,170,0,0.2)' };

                    return (
                      <button
                        key={source.id}
                        onClick={() => setSelectedEmbeddedSourceId(source.id)}
                        style={{ padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'left', background: isSelected ? 'var(--surface-card-elevated)' : '#000000', border: `1px solid ${isSelected ? 'var(--accent-lime)' : 'var(--border-color)'}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <div>
                          <div className="flex-row-between" style={{ marginBottom: '8px' }}>
                            <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, ...typeBadgeStyle }} className="font-mono">
                              {source.type}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }} className="font-mono">
                              {source.totalChunks} chunks
                            </span>
                          </div>

                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '4px', lineHeight: 1.2 }} className="font-mono">
                            {source.title}
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {source.purpose}
                          </p>
                        </div>

                        <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: 'var(--accent-lime)', fontWeight: 700 }} className="font-mono">
                          <span>Dim: {source.vectorDimension}</span>
                          <span style={{ color: isSelected ? 'var(--accent-lime)' : 'var(--text-muted)' }}>{isSelected ? '● Đang xem' : 'Bấm xem →'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* ACTIVE EMBEDDED PREVIEW BOX */}
                <div style={{ marginTop: '16px', padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: '#000000', border: '1px solid var(--border-color)' }}>
                  <div className="flex-row-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '10px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Vector Text Chunk trích xuất từ: <strong style={{ color: '#ffffff' }} className="font-mono">{activeEmbeddedSource.title}</strong>
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--accent-lime)', fontWeight: 700 }} className="font-mono">Cập nhật: {activeEmbeddedSource.lastUpdated}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: 700, fontStyle: 'italic', backgroundColor: 'var(--bg-base)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }} className="font-mono">
                    "{activeEmbeddedSource.sampleEmbeddedText}"
                  </p>
                </div>

              </div>

              {/* RAG ADVISOR CHAT PANEL */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                
                <div className="panel-header-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div className="flex-row-center">
                    <MessageSquare size={18} color="var(--accent-lime)" />
                    <div className="panel-title" style={{ fontSize: '16px' }}>Hệ thống Tư vấn Pháp lý Thuế tự động (AI LLM Agent)</div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Bấm câu hỏi mẫu để đối chiếu RAG:</span>
                </div>

                {/* SUGGESTED PRE-BAKED QUESTIONS */}
                <div className="bento-grid-3" style={{ marginBottom: '20px' }}>
                  {MOCK_QA_KNOWLEDGE.map(qa => (
                    <button
                      key={qa.id}
                      onClick={() => {
                        setChatHistory(prev => [
                          ...prev, 
                          { sender: 'USER', text: qa.question },
                          { sender: 'AI', text: `${qa.shortAnswer}\n\n${qa.fullAnalysis}`, citation: qa.legalCitation }
                        ]);
                      }}
                      style={{ padding: '14px', backgroundColor: 'var(--surface-card-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'border-color 0.2s' }}
                    >
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', marginBottom: '10px', lineHeight: 1.3 }}>
                        "{qa.question}"
                      </p>
                      <div className="flex-row-between" style={{ paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {qa.tags.slice(0, 2).map(t => (
                            <span key={t} style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#000000', color: 'var(--text-muted)', fontWeight: 700 }}>
                              #{t}
                            </span>
                          ))}
                        </div>
                        
                        {qa.sourceId && (
                          <span style={{ fontSize: '9px', color: 'var(--accent-lime)', fontWeight: 700 }} className="font-mono">
                            RAG Verified
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* CHAT INTERFACE STREAM */}
                <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', height: '420px' }}>
                  
                  {/* Messages container */}
                  <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {chatHistory.map((chat, idx) => (
                      <div 
                        key={idx} 
                        style={{ display: 'flex', flexDirection: 'column', maxWidth: '85%', alignSelf: chat.sender === 'USER' ? 'flex-end' : 'flex-start', alignItems: chat.sender === 'USER' ? 'flex-end' : 'flex-start' }}
                      >
                        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', padding: '0 4px' }} className="font-mono">
                          {chat.sender === 'USER' ? (
                            <span>KẾ TOÁN VIÊN (BẠN)</span>
                          ) : (
                            <span style={{ color: 'var(--accent-lime)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Sparkles size={10} /> SMARTTAX AI ADVISOR
                            </span>
                          )}
                        </div>

                        <div 
                          style={{ padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap', backgroundColor: chat.sender === 'USER' ? 'var(--accent-lime)' : 'var(--surface-card-elevated)', color: chat.sender === 'USER' ? '#000000' : '#ffffff', border: chat.sender === 'USER' ? 'none' : '1px solid var(--border-color)', fontWeight: chat.sender === 'USER' ? 700 : 500, borderBottomRightRadius: chat.sender === 'USER' ? 0 : 'var(--radius-md)', borderBottomLeftRadius: chat.sender === 'USER' ? 'var(--radius-md)' : 0 }}
                        >
                          {chat.text}
                        </div>

                        {chat.citation && (
                          <div style={{ marginTop: '6px', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(157,0,255,0.1)', border: '1px solid rgba(157,0,255,0.2)', fontSize: '11px', color: '#d4a6ff', width: '100%' }} className="font-mono">
                            <strong style={{ color: '#ffffff' }}>Căn cứ trích dẫn:</strong> {chat.citation}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendCustomQuestion} style={{ padding: '12px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--surface-card)', display: 'flex', gap: '8px', borderBottomLeftRadius: 'var(--radius-md)', borderBottomRightRadius: 'var(--radius-md)' }}>
                    <input 
                      type="text" 
                      value={customQuestionInput}
                      onChange={(e) => setCustomQuestionInput(e.target.value)}
                      placeholder="Hỏi AI tư vấn về thời hạn nộp, quy tắc phân bổ, chế độ kế toán Thông tư 133 hay chuẩn cấu trúc file XML..."
                      className="input-premium"
                      style={{ backgroundColor: '#000000' }}
                    />
                    <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                      <Send size={14} />
                      <span>Gửi Câu Hỏi</span>
                    </button>
                  </form>

                </div>

              </div>

            </div>
          )}

          {/* TAB 7: PLATFORM STRUCTURE & SCHEMA BLUEPRINT VISUALIZER */}
          {activeTab === 'structure' && (
            <div className="animate-fade-in content-area">
              
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div className="panel-title">
                    <Database size={20} color="var(--accent-lime)" />
                    <span>Kiến trúc Kỹ thuật & Cấu trúc Nền tảng SmartTax AI</span>
                  </div>
                  <p className="panel-subtitle">
                    Bản thiết kế kỹ thuật tiêu chuẩn cho hệ thống kế toán đa chi nhánh (Multi-tenant) kết hợp mã hóa bảo mật.
                  </p>
                </div>

                {/* ARCHITECTURAL VIEW CARDS */}
                <div className="bento-grid-3" style={{ marginBottom: '24px' }}>
                  
                  <div style={{ padding: '16px', backgroundColor: 'var(--surface-card-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div className="flex-row-center font-mono" style={{ color: 'var(--accent-lime)', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
                      <Layers size={16} />
                      <span>Database: PostgreSQL</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Sử dụng Row-Level Security (RLS) cô lập 100% dữ liệu các công ty theo trường `tenant_id`. Kết hợp `pgvector` để nhúng dữ liệu luật.
                    </p>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--surface-card-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div className="flex-row-center font-mono" style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
                      <ShieldCheck size={16} />
                      <span>Security & Chữ ký số</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Mã hóa cột thông tin tài khoản bằng AES-256-GCM. Hỗ trợ xác thực PKCS#11/SmartCA ký trực tiếp gói XML trước khi nộp GDT.
                    </p>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--surface-card-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div className="flex-row-center font-mono" style={{ color: 'var(--accent-amber)', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
                      <Cpu size={16} />
                      <span>GDT Sync Microservice</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Các endpoint REST API kết nối tự động lấy dữ liệu XML/PDF gốc. Parser tự động phân loại Nợ/Có.
                    </p>
                  </div>

                </div>

                {/* SQL BLOCK */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '8px', textTransform: 'uppercase' }} className="font-mono">1. Cấu trúc Bảng Cơ sở dữ liệu Cốt lõi (SQL DDL)</span>
                    <pre style={{ backgroundColor: '#000000', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--accent-cyan)', overflowY: 'auto', maxHeight: '280px', lineHeight: 1.4 }} className="font-mono">
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
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '8px', textTransform: 'uppercase' }} className="font-mono">2. API Endpoints Specification (GDT Integration)</span>
                    <div style={{ backgroundColor: '#000000', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }} className="font-mono">
                      
                      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                        <div style={{ color: 'var(--accent-lime)', fontWeight: 700 }}>POST /api/v1/gdt/authenticate</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>Xác thực chứng thư số với máy chủ Tổng cục Thuế, lấy phiên làm việc bảo mật.</p>
                      </div>

                      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                        <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>GET /api/v1/gdt/invoices/sync?tax_code=0109876543&type=INCOMING</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>Tải luồng dữ liệu hóa đơn điện tử mua vào mới phát sinh trong kỳ.</p>
                      </div>

                      <div>
                        <div style={{ color: '#d4a6ff', fontWeight: 700 }}>POST /api/v1/declarations/export-htkk</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>Đóng gói XML chuẩn HTKK đính kèm chữ ký số để truyền trực tiếp hệ thống khai thuế.</p>
                      </div>

                    </div>
                  </div>

                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <span>Tài liệu chi tiết lưu tại Artifact: <strong style={{ color: '#ffffff' }}>platform_architecture_and_schema.md</strong></span>
                  <span style={{ color: 'var(--accent-lime)' }}>Bản quyền Deepmind</span>
                </div>

              </div>

            </div>
          )}



        </main>

      </div>

      {/* FOOTER */}
      <footer className="premium-footer">
        <p style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>SmartTax AI Platform • Cung cấp giải pháp Kế toán tối ưu cho SMEs & Hộ Kinh Doanh Việt Nam</p>
        <p style={{ marginTop: '4px' }}>Thiết kế hệ thống bento-grid Vanilla CSS chuẩn xác lấy cảm hứng từ Monera Finance Product trên Dribbble.</p>
      </footer>

    </div>
  );
}
