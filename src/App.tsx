import React, { useMemo } from 'react';
import { useSmartTax } from './hooks/useSmartTax';
import { useAdminAuth } from './hooks/useAdminAuth';
import { useAdminIndexing } from './hooks/useAdminIndexing';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { AdminPortal } from './components/Admin/AdminPortal';
import { Overview } from './components/Views/Overview';
import { SyncView } from './components/Views/SyncView';
import { AccountingView } from './components/Views/AccountingView';
import { RadarView } from './components/Views/RadarView';
import { ReportingView } from './components/Views/ReportingView';
import { AdvisorView } from './components/Views/AdvisorView';
import { 
  MOCK_TENANTS, 
  MOCK_ALERTS, 
  EMBEDDED_KNOWLEDGE_SOURCES,
  MOCK_QA_KNOWLEDGE,
  MOCK_HTKK_XML_TEMPLATES
} from './mockData';
import type { Invoice, JournalEntry } from './mockData';

export default function App() {
  const smartTax = useSmartTax();
  const adminAuth = useAdminAuth();
  const adminIndexing = useAdminIndexing();

  const {
    activeTenantId, setActiveTenantId,
    activeTab, setActiveTab,
    tenant,
    isSyncing, setIsSyncing,
    syncLog, setSyncLog,
    localInvoices, setLocalInvoices,
    localJournals, setLocalJournals,
    uploadedFileName, setUploadedFileName,
    ocrParsingStatus, setOcrParsingStatus,
    newOcrResult, setNewOcrResult,
    riskFilter, setRiskFilter,
    selectedDeclarationForm, setSelectedDeclarationForm,
    reportPeriodType, setReportPeriodType,
    reportPeriodValue, setReportPeriodValue,
    isGeneratingReport,
    generatedReportSummary,
    handleCalculateDynamicReport
  } = smartTax;

  // Derived data
  const currentInvoices = useMemo(() => localInvoices[activeTenantId] || [], [localInvoices, activeTenantId]);
  const currentJournals = useMemo(() => localJournals[activeTenantId] || [], [localJournals, activeTenantId]);

  // Actions
  const handleTriggerGdtSync = () => {
    setIsSyncing(true);
    setSyncLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Bắt đầu truy vấn cổng dữ liệu GDT (Hóa đơn điện tử)...`]);
    
    setTimeout(() => {
      setSyncLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Tìm thấy 2 hóa đơn mới phát sinh từ hệ thống tra cứu GDT.`]);
      
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

      setLocalInvoices(prev => ({ ...prev, [activeTenantId]: [newInv, ...(prev[activeTenantId] || [])] }));

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

      setLocalJournals(prev => ({ ...prev, [activeTenantId]: [newEntry, ...(prev[activeTenantId] || [])] }));
      setSyncLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Phân tích hóa đơn hoàn tất. Hạch toán kép tự động theo đúng chế độ ${tenant.accountingRegime === 'TT133' ? 'Thông tư 133/2016' : 'Thông tư 88/2021'}!`]);
      setIsSyncing(false);
    }, 2000);
  };

  const handleSimulateFileUpload = (fileName: string, invType: 'INCOMING' | 'OUTGOING', amount: number) => {
    if (fileName === 'RESET') {
      setUploadedFileName(null);
      setOcrParsingStatus('IDLE');
      setNewOcrResult(null);
      return;
    }
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

      setLocalInvoices(prev => ({ ...prev, [activeTenantId]: [fullInv, ...(prev[activeTenantId] || [])] }));

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

      setLocalJournals(prev => ({ ...prev, [activeTenantId]: [autoJe, ...(prev[activeTenantId] || [])] }));
    }, 1500);
  };

  const [chatHistory, setChatHistory] = React.useState<any[]>([
    { sender: 'AI', text: MOCK_QA_KNOWLEDGE[0].shortAnswer + '\n\n' + MOCK_QA_KNOWLEDGE[0].fullAnalysis, citation: MOCK_QA_KNOWLEDGE[0].legalCitation }
  ]);
  const [customQuestionInput, setCustomQuestionInput] = React.useState('');
  const [selectedEmbeddedSourceId, setSelectedEmbeddedSourceId] = React.useState('src-luat-38');

  const handleSendCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestionInput.trim()) return;
    const userQ = customQuestionInput;
    setChatHistory(prev => [...prev, { sender: 'USER', text: userQ }]);
    setCustomQuestionInput('');
    setTimeout(() => {
      const matchedQA = MOCK_QA_KNOWLEDGE.find(item => item.question.toLowerCase().includes(userQ.toLowerCase()));
      if (matchedQA) {
        setChatHistory(prev => [...prev, { sender: 'AI', text: `🔍 **RAG Extract**:\n\n${matchedQA.shortAnswer}\n\n${matchedQA.fullAnalysis}`, citation: matchedQA.legalCitation }]);
      } else {
        setChatHistory(prev => [...prev, { sender: 'AI', text: '💡 **AI Advisor**: Căn cứ Luật Quản lý Thuế số 38/2019/QH14...', citation: 'Luật Quản lý Thuế số 38/2019/QH14' }]);
      }
    }, 1000);
  };

  const handleDownloadXml = () => {
    const xmlContent = MOCK_HTKK_XML_TEMPLATES[selectedDeclarationForm] || '<?xml version="1.0"?><Error>No content</Error>';
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TKHAI_${selectedDeclarationForm.replace('/', '_')}_${tenant.taxCode}.xml`;
    link.click();
  };

  // Check for standalone admin view
  const isStandaloneAdminView = (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) || activeTab === 'admin';

  if (isStandaloneAdminView) {
    return (
      <AdminPortal 
        {...adminAuth}
        {...adminIndexing}
        setActiveTab={setActiveTab}
        activeTenantId={activeTenantId}
      />
    );
  }

  return (
    <div className="app-container">
      <Header 
        activeTenantId={activeTenantId}
        setActiveTenantId={setActiveTenantId}
        tenants={MOCK_TENANTS}
        currentTenant={tenant}
      />

      <div className="regime-banner">
        <div className="flex-row-center">
          <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '11px' }} className="font-mono">Chế độ:</span>
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

      <div className="main-workspace">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isSyncing={isSyncing} />

        <main className="main-content">
          {activeTab === 'overview' && (
            <Overview 
              tenant={tenant} 
              alerts={MOCK_ALERTS} 
              setActiveTab={setActiveTab} 
              setRiskFilter={setRiskFilter} 
            />
          )}

          {activeTab === 'sync' && (
            <SyncView 
              isSyncing={isSyncing}
              syncLog={syncLog}
              handleTriggerGdtSync={handleTriggerGdtSync}
              handleSimulateFileUpload={handleSimulateFileUpload}
              ocrParsingStatus={ocrParsingStatus}
              uploadedFileName={uploadedFileName}
              newOcrResult={newOcrResult}
            />
          )}

          {activeTab === 'accounting' && (
            <AccountingView 
              currentInvoices={currentInvoices}
              currentJournals={currentJournals}
            />
          )}

          {activeTab === 'radar' && (
            <RadarView 
              alerts={MOCK_ALERTS}
              riskFilter={riskFilter}
              setRiskFilter={setRiskFilter}
            />
          )}

          {activeTab === 'reporting' && (
            <ReportingView 
              tenant={tenant}
              selectedDeclarationForm={selectedDeclarationForm}
              setSelectedDeclarationForm={setSelectedDeclarationForm}
              reportPeriodType={reportPeriodType}
              setReportPeriodType={setReportPeriodType}
              reportPeriodValue={reportPeriodValue}
              setReportPeriodValue={setReportPeriodValue}
              isGeneratingReport={isGeneratingReport}
              handleCalculateDynamicReport={handleCalculateDynamicReport}
              generatedReportSummary={generatedReportSummary}
              handleDownloadXml={handleDownloadXml}
            />
          )}

          {activeTab === 'advisor' && (
            <AdvisorView 
              chatHistory={chatHistory}
              customQuestionInput={customQuestionInput}
              setCustomQuestionInput={setCustomQuestionInput}
              handleSendCustomQuestion={handleSendCustomQuestion}
              embeddedSources={EMBEDDED_KNOWLEDGE_SOURCES}
              selectedEmbeddedSourceId={selectedEmbeddedSourceId}
              setSelectedEmbeddedSourceId={setSelectedEmbeddedSourceId}
              activeEmbeddedSource={EMBEDDED_KNOWLEDGE_SOURCES.find(s => s.id === selectedEmbeddedSourceId)!}
            />
          )}
        </main>
      </div>
    </div>
  );
}
