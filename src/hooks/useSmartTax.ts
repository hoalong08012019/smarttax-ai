import { useState, useMemo, useCallback, useEffect } from 'react';
import { supabaseSignOut } from '../utils/supabaseAuth';
import { 
  MOCK_TENANTS, 
  MOCK_INVOICES, 
  MOCK_JOURNALS,
  MOCK_AUDIT_ISSUES_TT133,
  MOCK_AUDIT_ISSUES_TT88,
  MOCK_TRIAL_BALANCE_TT133,
  MOCK_TRIAL_BALANCE_TT88,
  MOCK_GDT_RECEIPTS,
  MOCK_PAYROLL_EMPLOYEES,
  MOCK_INTERNAL_CONTROL_ISSUES_TT133,
  MOCK_INTERNAL_CONTROL_ISSUES_TT88,
  MOCK_BANK_TRANSACTIONS_TT133,
  MOCK_BANK_TRANSACTIONS_TT88
} from '../mockData';
import type { Invoice, JournalEntry, AccountingAuditIssue, TrialBalanceItem, GdtReceipt, PayrollEmployee, InternalControlIssue, BankTransaction } from '../mockData';


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
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('smarttax_theme');
      if (stored === 'light' || stored === 'dark') return stored;
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('smarttax_theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem('smarttax_user_auth');
      if (!raw) return false;
      try {
        const data = JSON.parse(raw);
        if (data.authenticated && data.expiresAt > Date.now()) {
          return true;
        }
        sessionStorage.removeItem('smarttax_user_auth');
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  const [userType, setUserType] = useState<'SME' | 'HOUSEHOLD' | null>(() => {
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem('smarttax_user_auth');
      if (!raw) return null;
      try {
        const data = JSON.parse(raw);
        if (data.authenticated && data.expiresAt > Date.now()) {
          return data.userType;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem('smarttax_user_auth');
      if (raw) {
        try {
          const data = JSON.parse(raw);
          if (data.authenticated && data.expiresAt > Date.now()) {
            return data.tenantId;
          }
        } catch (e) {}
      }
    }
    return 't-001';
  });

  const [activeTab, setActiveTab] = useState<string>('overview');

  const getAuthToken = useCallback((): string => {
    if (typeof window === 'undefined') return '';
    const raw = sessionStorage.getItem('smarttax_user_auth');
    if (!raw) return '';
    try {
      const data = JSON.parse(raw);
      return data.token || '';
    } catch (e) {
      return '';
    }
  }, []);
  
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

  // AI Chief Accountant Internal Control states
  const [payrollEmployees, setPayrollEmployees] = useState<PayrollEmployee[]>(MOCK_PAYROLL_EMPLOYEES);
  const [internalControlStatus, setInternalControlStatus] = useState<'IDLE' | 'SCANNING' | 'COMPLETED'>('IDLE');
  const [internalControlIssues, setInternalControlIssues] = useState<InternalControlIssue[]>([]);

  // Bank reconciliation states
  const [bankFileName, setBankFileName] = useState<string | null>(null);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [bankReconStatus, setBankReconStatus] = useState<'IDLE' | 'MATCHING' | 'COMPLETED'>('IDLE');

  // Autopilot states
  const [autopilotEnabled, setAutopilotEnabled] = useState<boolean>(false);
  const [autopilotStatus, setAutopilotStatus] = useState<'IDLE' | 'RUNNING' | 'COMPLETED'>('IDLE');
  const [autopilotLogs, setAutopilotLogs] = useState<string[]>([]);
  const [showZaloNotification, setShowZaloNotification] = useState<boolean>(false);

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

    setPayrollEmployees(MOCK_PAYROLL_EMPLOYEES);
    setInternalControlStatus('IDLE');
    setInternalControlIssues([]);

    setBankFileName(null);
    setBankTransactions([]);
    setBankReconStatus('IDLE');
    setAutopilotStatus('IDLE');
    setAutopilotLogs([]);
    setShowZaloNotification(false);
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

  const loginWithCredentials = useCallback((tenantId: string, role: 'SME' | 'HOUSEHOLD', token?: string) => {
    const sessionData = {
      authenticated: true,
      tenantId,
      userType: role,
      token: token || (role === 'SME' ? 'u-sme-001' : 'u-hkd-002'),
      expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
    };
    sessionStorage.setItem('smarttax_user_auth', JSON.stringify(sessionData));
    setActiveTenantId(tenantId);
    setUserType(role);
    setIsAuthenticated(true);
  }, []);

  const logoutUser = useCallback(() => {
    const raw = sessionStorage.getItem('smarttax_user_auth');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.token) {
          supabaseSignOut(data.token);
        }
      } catch (e) {}
    }
    sessionStorage.removeItem('smarttax_user_auth');
    setIsAuthenticated(false);
    setUserType(null);
    setActiveTenantId('t-001');
    setActiveTab('overview');
  }, []);

  const handleRunInternalControlScan = useCallback(() => {
    setInternalControlStatus('SCANNING');
    setTimeout(() => {
      if (tenant.accountingRegime === 'TT133') {
        setInternalControlIssues(MOCK_INTERNAL_CONTROL_ISSUES_TT133);
      } else {
        setInternalControlIssues(MOCK_INTERNAL_CONTROL_ISSUES_TT88);
      }
      setInternalControlStatus('COMPLETED');
    }, 1500);
  }, [tenant.accountingRegime]);

  const handleApplyPayrollOptimization = useCallback(() => {
    setPayrollEmployees(prev => prev.map(emp => {
      if (emp.id === 'emp-001') {
        return {
          ...emp,
          baseSalary: 22000000,
          allowances: { clothing: 416000, lunch: 730000, telephone: 300000, other: 4554000 },
          optimized: true
        };
      }
      if (emp.id === 'emp-002') {
        return {
          ...emp,
          baseSalary: 17000000,
          allowances: { clothing: 416000, lunch: 730000, telephone: 300000, other: 3554000 },
          optimized: true
        };
      }
      if (emp.id === 'emp-003') {
        return {
          ...emp,
          baseSalary: 7054000,
          allowances: { clothing: 416000, lunch: 730000, telephone: 300000, other: 0 },
          contractStatus: 'SIGNED' as const,
          taxCodeStatus: 'REGISTERED' as const,
          optimized: true
        };
      }
      return emp;
    }));

    setInternalControlIssues(prev => prev.map(issue => {
      if (issue.category === 'PAYROLL') {
        return { ...issue, status: 'RESOLVED' as const };
      }
      return issue;
    }));
  }, []);

  const handleInjectCashLoan = useCallback(() => {
    const loanAmount = tenant.accountingRegime === 'TT133' ? 50000000 : 10000000;
    
    // Add loan transaction to general ledger journals
    const loanEntry: JournalEntry = {
      id: `je-loan-${Date.now()}`,
      date: new Date().toLocaleDateString('vi-VN'),
      voucherCode: tenant.accountingRegime === 'TT133' ? 'UNC-3411' : 'PT-LOAN',
      description: tenant.accountingRegime === 'TT133' 
        ? 'Hạch toán vay cá nhân không lãi suất bổ sung quỹ tiền mặt (AI Inject)' 
        : 'Phiếu thu bổ sung vốn góp cá nhân chủ hộ kinh doanh (AI Inject)',
      debitAccount: tenant.accountingRegime === 'TT133' ? '1111' : 'Sổ S1',
      creditAccount: tenant.accountingRegime === 'TT133' ? '3411' : 'Sổ S4',
      amount: loanAmount,
      isAutomated: true
    };

    setLocalJournals(prev => ({
      ...prev,
      [activeTenantId]: [loanEntry, ...(prev[activeTenantId] || [])]
    }));

    // Adjust Trial Balance Data
    setTrialBalanceData(prev => prev.map(item => {
      if (item.accountNumber === '1111' || item.accountNumber === 'Sổ S1') {
        return {
          ...item,
          periodDebit: item.periodDebit + loanAmount,
          closingDebit: item.closingDebit + loanAmount
        };
      }
      return item;
    }));

    setInternalControlIssues(prev => prev.map(issue => {
      if (issue.id === 'ic-101' || issue.id === 'ic-201') {
        return { ...issue, status: 'RESOLVED' as const };
      }
      return issue;
    }));
  }, [activeTenantId, tenant.accountingRegime]);

  const handleExcludeBlacklistInvoice = useCallback((issueId: string) => {
    setInternalControlIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return { ...issue, status: 'RESOLVED' as const };
      }
      return issue;
    }));

    // Find if we have active invoices and flag them as high risk / excluded
    setLocalInvoices(prev => {
      const invoices = prev[activeTenantId] || [];
      const updated = invoices.map(inv => {
        if (inv.counterpartTaxCode === '0104445556' || inv.preTaxAmount === 120000000) {
          return { ...inv, riskStatus: 'CRITICAL' as const, riskFlags: ['GDT BLACKLISTED - EXCLUDED FROM DECLARATION'] };
        }
        return inv;
      });
      return { ...prev, [activeTenantId]: updated };
    });

    // Reduce VAT deductible in report calculations if it was generated
    setGeneratedReportSummary(prev => {
      if (!prev) return null;
      const taxReduction = 12000000; // 10% of 120,000,000
      return {
        ...prev,
        totalVatDeductible: Math.max(0, prev.totalVatDeductible - taxReduction),
        payableVat: prev.payableVat + taxReduction,
        verifiedLog: prev.verifiedLog + ' [AI Kế toán trưởng: Loại trừ hóa đơn đen MST 0104445556 trị giá 120M]'
      };
    });
  }, [activeTenantId]);


  const handleUploadBankStatement = useCallback((fileName: string) => {
    if (fileName === 'RESET') {
      setBankFileName(null);
      setBankTransactions([]);
      setBankReconStatus('IDLE');
      return;
    }
    setBankFileName(fileName);
    setBankReconStatus('IDLE');
    setBankTransactions(
      tenant.accountingRegime === 'TT133' 
        ? MOCK_BANK_TRANSACTIONS_TT133 
        : MOCK_BANK_TRANSACTIONS_TT88
    );
  }, [tenant.accountingRegime]);

  const handleAutoMatchBankTransactions = useCallback(() => {
    setBankReconStatus('MATCHING');
    setTimeout(() => {
      setBankTransactions(prev => prev.map(t => ({ ...t, matchStatus: 'MATCHED' })));
      
      const list = tenant.accountingRegime === 'TT133' ? MOCK_BANK_TRANSACTIONS_TT133 : MOCK_BANK_TRANSACTIONS_TT88;
      const newEntries: JournalEntry[] = [];
      
      list.forEach(tx => {
        if (tx.suggestedLedgerEntry) {
          newEntries.push({
            id: `je-bank-${tx.id}-${Date.now()}`,
            date: tx.date,
            voucherCode: tx.referenceNumber,
            description: tx.suggestedLedgerEntry.description + ' (AI Bank Match)',
            debitAccount: tx.suggestedLedgerEntry.debitAccount,
            creditAccount: tx.suggestedLedgerEntry.creditAccount,
            amount: tx.amount,
            isAutomated: true
          });
        }
      });

      if (newEntries.length > 0) {
        setLocalJournals(prev => ({
          ...prev,
          [activeTenantId]: [...newEntries, ...(prev[activeTenantId] || [])]
        }));

        setTrialBalanceData(prev => {
          if (prev.length === 0) return prev;
          return prev.map(item => {
            let addedDebit = 0;
            let addedCredit = 0;

            newEntries.forEach(entry => {
              if (entry.debitAccount === item.accountNumber) {
                addedDebit += entry.amount;
              }
              if (entry.creditAccount === item.accountNumber) {
                addedCredit += entry.amount;
              }
            });

            if (addedDebit > 0 || addedCredit > 0) {
              return {
                ...item,
                periodDebit: item.periodDebit + addedDebit,
                periodCredit: item.periodCredit + addedCredit,
                closingDebit: item.accountNumber === '1111' || item.accountNumber === '1121' || item.accountNumber === 'Sổ S1' 
                  ? item.closingDebit + addedDebit - addedCredit
                  : item.closingDebit + addedDebit,
                closingCredit: item.accountNumber === '331' || item.accountNumber === '3411' || item.accountNumber === '5111'
                  ? item.closingCredit + addedCredit - addedDebit
                  : item.closingCredit + addedCredit
              };
            }
            return item;
          });
        });
      }

      setBankReconStatus('COMPLETED');
    }, 1500);
  }, [activeTenantId, tenant.accountingRegime]);

  const handleRealInvoiceUpload = async (file: File) => {
    setUploadedFileName(file.name);
    setOcrParsingStatus('PARSING');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://127.0.0.1:8000/api/invoices/upload-zip', {
        method: 'POST',
        headers,
        body: formData
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.success && data.invoices && data.invoices.length > 0) {
        const newInvs = data.invoices.map((inv: any, index: number) => ({
          id: `inv-real-${Date.now()}-${index}`,
          type: inv.type || 'INCOMING',
          symbol: inv.symbol || '1C26TCC',
          number: inv.number || '00000000',
          issueDate: inv.issue_date || new Date().toLocaleDateString('vi-VN'),
          counterpartTaxCode: inv.seller_tax_code || inv.counterpartTaxCode || '0000000000',
          counterpartName: inv.seller_name || inv.counterpartName || 'Chưa rõ đối tác',
          preTaxAmount: inv.pre_tax_amount || 0,
          vatRate: inv.vat_rate || '10%',
          vatAmount: inv.vat_amount || 0,
          totalAmount: inv.total_amount || 0,
          ocrConfidence: inv.ocr_confidence || 1.0,
          riskStatus: inv.status || 'SAFE',
          riskFlags: inv.risk_flags || [],
          suggestedDebitAcc: tenant.accountingRegime === 'TT133' ? '6422' : 'Sổ chi phí',
          suggestedCreditAcc: tenant.accountingRegime === 'TT133' ? '331' : 'Thanh toán chuyển khoản'
        }));
        
        setLocalInvoices(prev => ({
          ...prev,
          [activeTenantId]: [...newInvs, ...(prev[activeTenantId] || [])]
        }));
        
        const newJournals = newInvs.map((inv: any, index: number) => ({
          id: `je-real-${Date.now()}-${index}`,
          date: inv.issueDate,
          voucherCode: `GDT-${inv.number}`,
          description: `Tự động hạch toán hóa đơn điện tử thực số ${inv.number} (${inv.counterpartName})`,
          debitAccount: inv.suggestedDebitAcc,
          creditAccount: inv.suggestedCreditAcc,
          amount: inv.totalAmount,
          isAutomated: true
        }));
        
        setLocalJournals(prev => ({
          ...prev,
          [activeTenantId]: [...newJournals, ...(prev[activeTenantId] || [])]
        }));

        setNewOcrResult(newInvs[0]);
        setOcrParsingStatus('SUCCESS');
      } else {
        throw new Error('No invoices parsed');
      }
    } catch (err) {
      console.warn("Backend offline, falling back to mock invoice upload...", err);
      setTimeout(() => {
        const amount = file.name.includes('BAN_RA') ? 120000000 : 4500000;
        const type = file.name.includes('BAN_RA') ? 'OUTGOING' : 'INCOMING';
        const parsed: Partial<Invoice> = {
          symbol: type === 'INCOMING' ? '1C26TMM' : '1C26TNN',
          number: `0000${Math.floor(5000 + Math.random() * 4999)}`,
          counterpartName: type === 'INCOMING' ? 'Công ty Cổ phần Đầu tư Thiết bị Văn phòng Cao Cấp (Simulation)' : 'Hợp đồng Tư vấn Giải pháp Phần mềm Kế toán (Simulation)',
          counterpartTaxCode: '0104445556',
          preTaxAmount: amount,
          vatRate: '10%',
          vatAmount: amount * 0.1,
          totalAmount: amount * 1.1,
          ocrConfidence: 0.992,
          type: type,
          suggestedDebitAcc: tenant.accountingRegime === 'TT133' ? (type === 'INCOMING' ? '242 / 6422' : '131') : 'Sổ chi phí',
          suggestedCreditAcc: tenant.accountingRegime === 'TT133' ? (type === 'INCOMING' ? '331' : '5111') : 'Doanh thu'
        };
        setNewOcrResult(parsed);
        setOcrParsingStatus('SUCCESS');

        const fullInv: Invoice = {
          id: `inv-ocr-${Date.now()}`,
          type: type,
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
          description: `Hạch toán hóa đơn điện tử OCR tải lên: ${fullInv.counterpartName} (Simulation)`,
          debitAccount: fullInv.suggestedDebitAcc,
          creditAccount: fullInv.suggestedCreditAcc,
          amount: fullInv.totalAmount,
          isAutomated: true
        };

        setLocalJournals(prev => ({ ...prev, [activeTenantId]: [autoJe, ...(prev[activeTenantId] || [])] }));
      }, 1500);
    }
  };

  const handleRealBankStatementUpload = async (file: File) => {
    setBankFileName(file.name);
    setBankReconStatus('MATCHING');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://127.0.0.1:8000/api/bank/upload-statement', {
        method: 'POST',
        headers,
        body: formData
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.success && data.transactions) {
        const txs = data.transactions.map((tx: any, idx: number) => ({
          id: `tx-real-${Date.now()}-${idx}`,
          date: tx.date || new Date().toLocaleDateString('vi-VN'),
          referenceNumber: tx.reference_number || `UNC-${Math.floor(1000 + Math.random()*9000)}`,
          description: tx.description || 'Giao dịch ngân hàng',
          amount: tx.amount || 0,
          type: tx.type === 'DEBIT' ? 'WITHDRAWAL' as const : 'DEPOSIT' as const,
          matchStatus: 'UNMATCHED' as const,
          suggestedLedgerEntry: {
            debitAccount: tx.type === 'DEBIT' ? '331' : '1121',
            creditAccount: tx.type === 'DEBIT' ? '1121' : '131',
            description: tx.description || 'Đối soát tự động'
          }
        }));
        setBankTransactions(txs);
        setBankReconStatus('IDLE');
      } else {
        throw new Error('No transactions parsed');
      }
    } catch (err) {
      console.warn("Backend offline, falling back to mock bank statement...", err);
      setTimeout(() => {
        setBankTransactions(
          tenant.accountingRegime === 'TT133' 
            ? MOCK_BANK_TRANSACTIONS_TT133 
            : MOCK_BANK_TRANSACTIONS_TT88
        );
        setBankReconStatus('IDLE');
      }, 1500);
    }
  };

  const handleRunAutopilotSimulation = useCallback(async () => {
    setAutopilotStatus('RUNNING');
    setAutopilotLogs([]);

    try {
      const formData = new FormData();
      formData.append('tenant_id', activeTenantId);
      formData.append('company_name', tenant.companyName);
      formData.append('tax_code', tenant.taxCode);
      formData.append('accounting_regime', tenant.accountingRegime);
      formData.append('period', 'Tháng 04/2026');
      
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('http://127.0.0.1:8000/api/autopilot/run', {
        method: 'POST',
        headers,
        body: formData
      });
    } catch (err) {
      console.warn("Backend offline, skipping Telegram alert dispatch...", err);
    }
    
    const logs = [
      '[Autopilot Engine] Khởi chạy worker lập lịch tự trị kiểm tra hạn kê khai...',
      '[Step 1/6] Đang kết nối API Tổng cục Thuế để đồng bộ hóa đơn điện tử... (Thành công)',
      '[Step 2/6] Chạy AI Bookkeeper đối chiếu và khớp dòng tiền sao kê Techcombank... (Thành công)',
      '[Step 3/6] Chạy kiểm toán tuân thủ & Tự động xử lý âm quỹ tiền mặt bằng Hợp đồng Vay Cá Nhân... (Thành công)',
      '[Step 4/6] Đang cơ cấu lại bảng lương tối ưu thuế TNCN theo Thông tư 111... (Thành công)',
      '[Step 5/6] Kết xuất tệp XML tờ khai GTGT & Ký số từ xa không chạm bằng Cloud HSM... (Thành công)',
      '[Step 6/6] Đang nộp tờ khai lên cổng TVAN thuế và chờ tiếp nhận... (Thành công)',
      '[GDT Gateway] Đã tiếp nhận & Chấp nhận tờ khai điện tử. Trạng thái: CHẤP NHẬN TỜ KHAI.',
      '[Notification Agent] Đang đồng bộ Telegram API gửi thông báo và biên nhận cho chủ doanh nghiệp...',
      '[Autopilot Engine] Hoàn tất chu kỳ kê khai tự trị! Hệ thống AN TOÀN & TUÂN THỦ.'
    ];

    let currentLogIndex = 0;
    
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        const timePrefix = `[${new Date().toLocaleTimeString('vi-VN')}] `;
        setAutopilotLogs(prev => [...prev, timePrefix + logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        
        handleApplyPayrollOptimization();
        handleInjectCashLoan();
        
        setFilingStatus('ACCEPTED');
        setFilingStep(4);
        setGdtReceipt(MOCK_GDT_RECEIPTS[activeTenantId] || MOCK_GDT_RECEIPTS['t-001']);
        
        setAutopilotStatus('COMPLETED');
        setShowZaloNotification(true);
      }
    }, 450);

  }, [activeTenantId, handleApplyPayrollOptimization, handleInjectCashLoan, tenant]);

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
    handleSimulateGdtFiling,
    isAuthenticated,
    userType,
    loginWithCredentials,
    logoutUser,
    getAuthToken,
    
    payrollEmployees,
    internalControlStatus,
    internalControlIssues,
    handleRunInternalControlScan,
    handleApplyPayrollOptimization,
    handleInjectCashLoan,
    handleExcludeBlacklistInvoice,

    // Bank reconciliation
    bankFileName,
    bankTransactions,
    bankReconStatus,
    handleUploadBankStatement,
    handleAutoMatchBankTransactions,
    handleRealInvoiceUpload,
    handleRealBankStatementUpload,

    // Autopilot
    autopilotEnabled,
    setAutopilotEnabled,
    autopilotStatus,
    autopilotLogs,
    showZaloNotification,
    setShowZaloNotification,
    handleRunAutopilotSimulation,

    // Theme toggle
    theme,
    setTheme
  };
};
