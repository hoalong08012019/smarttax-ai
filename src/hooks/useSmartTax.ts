import { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  MOCK_TENANTS, 
  MOCK_INVOICES, 
  MOCK_JOURNALS,
  MOCK_AUDIT_ISSUES_TT133,
  MOCK_AUDIT_ISSUES_TT88,
  MOCK_TRIAL_BALANCE_TT133,
  MOCK_TRIAL_BALANCE_TT88,
  MOCK_GDT_RECEIPTS
} from '../mockData';
import type { Invoice, JournalEntry, AccountingAuditIssue, TrialBalanceItem, GdtReceipt } from '../mockData';


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

  // Accounting Upload & AI Auditing states
  const [accountingFileName, setAccountingFileName] = useState<string | null>(null);
  const [accountingAuditStatus, setAccountingAuditStatus] = useState<'IDLE' | 'AUDITING' | 'COMPLETED'>('IDLE');
  const [accountingAuditIssues, setAccountingAuditIssues] = useState<AccountingAuditIssue[]>([]);
  const [trialBalanceData, setTrialBalanceData] = useState<TrialBalanceItem[]>([]);

  // Step-by-step Filing Wizard states
  const [filingStep, setFilingStep] = useState<number>(1);
  const [filingStatus, setFilingStatus] = useState<'DRAFT' | 'SIGNED' | 'SUBMITTED' | 'ACCEPTED'>('DRAFT');
  const [gdtReceipt, setGdtReceipt] = useState<GdtReceipt | null>(null);

  // Reset certain states when tenant changes for data isolation
  useEffect(() => {
    setSyncLog([
      'Hệ thống khởi tạo kết nối tự động...',
      'Đã tải chứng thư số SSL/TLS với Tổng cục Thuế thành công.'
    ]);
    setOcrParsingStatus('IDLE');
    setUploadedFileName(null);
    setNewOcrResult(null);
    
    setAccountingFileName(null);
    setAccountingAuditStatus('IDLE');
    setAccountingAuditIssues([]);
    setTrialBalanceData([]);
    setFilingStep(1);
    setFilingStatus('DRAFT');
    setGdtReceipt(null);
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
      
      let netVat = 0;
      let netPit = 0;
      let netCit = 0;
      let legalNote = '';

      if (tenant.accountingRegime === 'TT133') {
        // SME Deduction Method (TT 80/2021/TT-BTC)
        netVat = Math.max(0, curVatOut - curVatDeduct);
        netCit = Math.round((curRev * 0.2) * 0.2); // Simplified profit margin 20% -> 20% tax
        legalNote = 'Căn cứ Thông tư 80/2021/TT-BTC & Thông tư 133/2016/TT-BTC.';
      } else {
        // Household Business (TT 40/2021/TT-BTC)
        // Rate for Distribution/Commerce: 1.5% VAT + 0.5% PIT
        netVat = Math.round(curRev * 0.015);
        netPit = Math.round(curRev * 0.005);
        legalNote = 'Căn cứ Thông tư 40/2021/TT-BTC & Thông tư 88/2021/TT-BTC.';
      }
      
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
        payableCitOrPit: tenant.accountingRegime === 'TT133' ? netCit : netPit,
        deadlineStr: dlStr,
        verifiedLog: `Đối soát hoàn tất: ${legalNote} Dữ liệu khớp 100% hóa đơn điện tử GDT.`
      });

      setIsGeneratingReport(false);
    }, 600);
  }, [activeTenantId, localInvoices, reportPeriodType, reportPeriodValue, tenant.accountingRegime, tenant.totalRevenue]);

  const handleRunAccountingAudit = useCallback(() => {
    setAccountingAuditStatus('AUDITING');
    setTimeout(() => {
      if (tenant.accountingRegime === 'TT133') {
        setAccountingAuditIssues(MOCK_AUDIT_ISSUES_TT133);
      } else {
        setAccountingAuditIssues(MOCK_AUDIT_ISSUES_TT88);
      }
      setAccountingAuditStatus('COMPLETED');
    }, 1500);
  }, [tenant.accountingRegime]);

  const handleFixAuditIssue = useCallback((issueId: string) => {
    setAccountingAuditIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return { ...issue, status: 'RESOLVED' as const };
      }
      return issue;
    }));

    if (issueId === 'iss-101') {
      setLocalJournals(prev => {
        const journals = prev[activeTenantId] || [];
        const updated = journals.map(je => {
          if (je.amount === 24500000) {
            return { ...je, creditAccount: '1121', description: je.description + ' (UNC Bank Transfer - AI Corrected)' };
          }
          return je;
        });
        return { ...prev, [activeTenantId]: updated };
      });
      setTrialBalanceData(prev => prev.map(item => {
        if (item.accountNumber === '1111') {
          return { ...item, periodCredit: item.periodCredit - 24500000, closingDebit: item.closingDebit + 24500000 };
        }
        if (item.accountNumber === '1121') {
          return { ...item, periodCredit: item.periodCredit + 24500000, closingDebit: item.closingDebit - 24500000 };
        }
        return item;
      }));
    } else if (issueId === 'iss-102') {
      setLocalJournals(prev => {
        const journals = prev[activeTenantId] || [];
        const updated = journals.map(je => {
          if (je.debitAccount.includes('6427') || je.debitAccount.includes('6428')) {
            return { ...je, debitAccount: '6422', description: je.description + ' (TT133 mapping - AI Corrected)' };
          }
          return je;
        });
        return { ...prev, [activeTenantId]: updated };
      });
      setTrialBalanceData(prev => prev.map(item => {
        if (item.accountNumber === '6427') {
          return { ...item, periodDebit: 0, closingDebit: 0 };
        }
        if (item.accountNumber === '6422') {
          return { ...item, periodDebit: item.periodDebit + 12800000, closingDebit: item.closingDebit + 12800000 };
        }
        return item;
      }));
    } else if (issueId === 'iss-201') {
      setLocalJournals(prev => {
        const journals = prev[activeTenantId] || [];
        const updated = journals.map(je => {
          if (je.amount === 22000000) {
            return { ...je, description: je.description + ' (UNC Bank transfer attached - AI Corrected)' };
          }
          return je;
        });
        return { ...prev, [activeTenantId]: updated };
      });
    } else if (issueId === 'iss-202') {
      setTrialBalanceData(prev => prev.map(item => {
        if (item.accountNumber === 'Sổ S2') {
          return { ...item, periodDebit: item.periodDebit + 2000000, closingDebit: item.closingDebit + 2000000 };
        }
        return item;
      }));
    }
  }, [activeTenantId]);

  const handleUploadAccountingFile = useCallback((fileName: string) => {
    if (fileName === 'RESET') {
      setAccountingFileName(null);
      setAccountingAuditStatus('IDLE');
      setAccountingAuditIssues([]);
      setTrialBalanceData([]);
      return;
    }
    setAccountingFileName(fileName);
    setAccountingAuditStatus('IDLE');
    setAccountingAuditIssues([]);
    if (tenant.accountingRegime === 'TT133') {
      setTrialBalanceData(MOCK_TRIAL_BALANCE_TT133);
    } else {
      setTrialBalanceData(MOCK_TRIAL_BALANCE_TT88);
    }
  }, [tenant.accountingRegime]);

  const handleSimulateGdtFiling = useCallback(() => {
    setFilingStatus('SUBMITTED');
    setTimeout(() => {
      setFilingStatus('ACCEPTED');
      setGdtReceipt(MOCK_GDT_RECEIPTS[activeTenantId] || MOCK_GDT_RECEIPTS['t-001']);
    }, 2000);
  }, [activeTenantId]);

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
    handleCalculateDynamicReport,
    accountingFileName,
    accountingAuditStatus,
    accountingAuditIssues,
    trialBalanceData,
    filingStep, setFilingStep,
    filingStatus, setFilingStatus,
    gdtReceipt, setGdtReceipt,
    handleRunAccountingAudit,
    handleFixAuditIssue,
    handleUploadAccountingFile,
    handleSimulateGdtFiling
  };
};
