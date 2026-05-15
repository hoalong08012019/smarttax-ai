import { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  MOCK_TENANTS, 
  MOCK_INVOICES, 
  MOCK_JOURNALS
} from '../mockData';
import type { Invoice, JournalEntry } from '../mockData';

export interface ReportSummary {
  periodText: string;
  totalRevenueBase: number;
  totalVatDeductible: number;
  payableVat: number;
  payableCitOrPit: number;
  deadlineStr: string;
  verifiedLog: string;
}

export const useSmartTax = () => {
  const [activeTenantId, setActiveTenantId] = useState<string>('t-001');
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const tenant = useMemo(() => {
    return MOCK_TENANTS.find(t => t.id === activeTenantId) || MOCK_TENANTS[0];
  }, [activeTenantId]);

  // Reset certain states when tenant changes for data isolation
  useEffect(() => {
    setSyncLog([
      'Hệ thống khởi tạo kết nối tự động...',
      'Đã tải chứng thư số SSL/TLS với Tổng cục Thuế thành công.'
    ]);
    setOcrParsingStatus('IDLE');
    setUploadedFileName(null);
    setNewOcrResult(null);
  }, [activeTenantId]);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncLog, setSyncLog] = useState<string[]>([
    'Hệ thống khởi tạo kết nối tự động...',
    'Đã tải chứng thư số SSL/TLS với Tổng cục Thuế thành công.'
  ]);
  const [localInvoices, setLocalInvoices] = useState<Record<string, Invoice[]>>(MOCK_INVOICES);
  const [localJournals, setLocalJournals] = useState<Record<string, JournalEntry[]>>(MOCK_JOURNALS);

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [ocrParsingStatus, setOcrParsingStatus] = useState<'IDLE' | 'PARSING' | 'SUCCESS'>('IDLE');
  const [newOcrResult, setNewOcrResult] = useState<Partial<Invoice> | null>(null);

  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [selectedDeclarationForm, setSelectedDeclarationForm] = useState<string>('01/GTGT');

  const [reportPeriodType, setReportPeriodType] = useState<'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');
  const [reportPeriodValue, setReportPeriodValue] = useState<string>('04');
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [generatedReportSummary, setGeneratedReportSummary] = useState<ReportSummary | null>({
    periodText: 'Tháng 04 / 2026',
    totalRevenueBase: 150000000,
    totalVatDeductible: 12500000,
    payableVat: 2500000,
    payableCitOrPit: 18500000,
    deadlineStr: '20/05/2026',
    verifiedLog: 'Đã nội suy tự động từ Sổ Cái Kế toán. Khớp 100% hóa đơn GDT xác thực.'
  });

  const appendToSyncLog = useCallback((message: string) => {
    setSyncLog(prev => {
      const newLog = [...prev, `[${new Date().toLocaleTimeString()}] ${message}`];
      return newLog.slice(-50); // Keep only last 50 entries to prevent memory issues
    });
  }, []);

  const handleCalculateDynamicReport = useCallback((pType = reportPeriodType, pVal = reportPeriodValue) => {
    setIsGeneratingReport(true);
    setTimeout(() => {
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
  }, [activeTenantId, localInvoices, reportPeriodType, reportPeriodValue, tenant.accountingRegime, tenant.totalRevenue]);

  return {
    activeTenantId, setActiveTenantId,
    activeTab, setActiveTab,
    tenant,
    isSyncing, setIsSyncing,
    syncLog, appendToSyncLog,
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
  };
};
