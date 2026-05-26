export interface Tenant {
  id: string;
  taxCode: string;
  companyName: string;
  legalRepresentative: string;
  accountingRegime: 'TT133' | 'TT88';
  industry: string;
  lastSyncTime: string;
  digitalSignatureStatus: 'CONNECTED' | 'DISCONNECTED';
  totalRevenue: number;
  totalExpenses: number;
  taxLiabilities: {
    vat: number; // Thuế GTGT
    cit: number; // Thuế TNDN
    pit: number; // Thuế TNCN
  };
  monthlyRevenue: number[]; // Jan-Dec simulation
  monthlyExpenses: number[];
}

export interface Invoice {
  id: string;
  type: 'INCOMING' | 'OUTGOING'; // Mua vào hay Bán ra
  symbol: string;
  number: string;
  issueDate: string;
  counterpartTaxCode: string;
  counterpartName: string;
  preTaxAmount: number;
  vatRate: string;
  vatAmount: number;
  totalAmount: number;
  ocrConfidence: number;
  riskStatus: 'SAFE' | 'WARNING' | 'CRITICAL';
  riskFlags: string[];
  suggestedDebitAcc: string;
  suggestedCreditAcc: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  voucherCode: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  isAutomated: boolean;
}

export interface RiskAlert {
  id: string;
  level: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  timestamp: string;
  detectedOnInvoice?: string;
  recommendation: string;
}

export interface EmbeddedSource {
  id: string;
  type: 'LUAT' | 'THONG_TU' | 'KE_TOAN' | 'KY_THUAT';
  title: string;
  purpose: string;
  totalChunks: number;
  vectorDimension: number;
  sampleEmbeddedText: string;
  lastUpdated: string;
}

export interface LegalQA {
  id: string;
  question: string;
  shortAnswer: string;
  legalCitation: string;
  fullAnalysis: string;
  tags: string[];
  sourceId?: string; // Links to embedded source
}

export interface AccountingAuditIssue {
  id: string;
  level: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  lawBasis: string;
  affectedAccount: string;
  affectedValue: number;
  status: 'ACTIVE' | 'RESOLVED';
  autoFixText: string;
  fixData: {
    debitAccount?: string;
    creditAccount?: string;
    amount?: number;
    action?: 'REPLACE_ACCOUNT' | 'SPLIT_TRANSACTION' | 'REMOVE_TRANSACTION' | 'MARK_NON_DEDUCTIBLE';
  };
}

export interface TrialBalanceItem {
  accountNumber: string;
  accountName: string;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
}

export interface GdtReceipt {
  receiptNumber: string;
  receivedDate: string;
  statusText: string;
  taxCode: string;
  companyName: string;
  declarationType: string;
  period: string;
  xmlHash: string;
  gdtCode: string;
  paymentCode: string;
  acceptanceMessage: string;
}

export interface PayrollEmployee {
  id: string;
  name: string;
  role: string;
  contractStatus: 'SIGNED' | 'UNSIGNED';
  taxCodeStatus: 'REGISTERED' | 'UNREGISTERED';
  baseSalary: number;
  allowances: {
    clothing: number;
    lunch: number;
    telephone: number;
    other: number;
  };
  optimized: boolean;
}

export interface InternalControlIssue {
  id: string;
  category: 'CASH_STOCK' | 'PAYROLL' | 'BLACKLIST';
  level: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  lawBasis: string;
  affectedValue: number;
  status: 'ACTIVE' | 'RESOLVED';
  autoFixText: string;
  invoiceId?: string;
}

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 't-001',
    taxCode: '0109876543',
    companyName: 'Công ty TNHH Giải Pháp Công Nghệ Viễn Đông',
    legalRepresentative: 'Nguyễn Văn Long',
    accountingRegime: 'TT133',
    industry: 'Lập trình phần mềm & CNTT',
    lastSyncTime: '14/05/2026 13:45:12',
    digitalSignatureStatus: 'CONNECTED',
    totalRevenue: 1250000000,
    totalExpenses: 780000000,
    taxLiabilities: {
      vat: 85000000,
      cit: 94000000,
      pit: 18500000
    },
    monthlyRevenue: [80, 95, 110, 105, 125, 140, 120, 130, 150, 160, 175, 200], // in millions
    monthlyExpenses: [50, 55, 60, 62, 70, 75, 65, 68, 80, 85, 90, 120]
  },
  {
    id: 't-002',
    taxCode: '8392019283-001',
    companyName: 'Hộ kinh doanh TM&DV Thực phẩm An Khang',
    legalRepresentative: 'Trần Thị Mai',
    accountingRegime: 'TT88',
    industry: 'Phân phối hàng tiêu dùng',
    lastSyncTime: '14/05/2026 10:12:05',
    digitalSignatureStatus: 'CONNECTED',
    totalRevenue: 640000000,
    totalExpenses: 420000000,
    taxLiabilities: {
      vat: 9600000, // Tỷ lệ khoán GTGT 1.5%
      cit: 0, // Hộ kinh doanh không nộp TNDN
      pit: 3200000 // Tỷ lệ khoán TNCN 0.5%
    },
    monthlyRevenue: [45, 50, 52, 48, 55, 60, 58, 62, 65, 70, 75, 0],
    monthlyExpenses: [30, 32, 35, 31, 38, 40, 36, 41, 44, 48, 50, 0]
  }
];

export const MOCK_INVOICES: Record<string, Invoice[]> = {
  't-001': [
    {
      id: 'inv-101',
      type: 'OUTGOING',
      symbol: '1C26TAA',
      number: '00000105',
      issueDate: '12/05/2026',
      counterpartTaxCode: '0101234567',
      counterpartName: 'Công ty Cổ phần Đầu tư & Phát triển Bất động sản Vinh Quang',
      preTaxAmount: 150000000,
      vatRate: '10%',
      vatAmount: 15000000,
      totalAmount: 165000000,
      ocrConfidence: 1.0,
      riskStatus: 'SAFE',
      riskFlags: [],
      suggestedDebitAcc: '131',
      suggestedCreditAcc: '5111'
    },
    {
      id: 'inv-102',
      type: 'INCOMING',
      symbol: '1C26TBB',
      number: '00004921',
      issueDate: '10/05/2026',
      counterpartTaxCode: '0100112233',
      counterpartName: 'Công ty Cổ phần Viễn thông FPT',
      preTaxAmount: 12000000,
      vatRate: '10%',
      vatAmount: 1200000,
      totalAmount: 13200000,
      ocrConfidence: 0.99,
      riskStatus: 'SAFE',
      riskFlags: [],
      suggestedDebitAcc: '6422',
      suggestedCreditAcc: '1111'
    },
    {
      id: 'inv-103',
      type: 'INCOMING',
      symbol: '1C26TYY',
      number: '00000888',
      issueDate: '05/05/2026',
      counterpartTaxCode: '0312456789',
      counterpartName: 'Công ty TNHH Truyền thông & Quảng cáo Đỉnh Cao (Mới thành lập)',
      preTaxAmount: 85000000,
      vatRate: '10%',
      vatAmount: 8500000,
      totalAmount: 93500000,
      ocrConfidence: 0.94,
      riskStatus: 'CRITICAL',
      riskFlags: ['Bên bán mới thành lập dưới 6 tháng', 'Doanh số giao dịch lớn bất thường', 'Mã số thuế bên bán có rủi ro cao'],
      suggestedDebitAcc: '6421',
      suggestedCreditAcc: '331'
    },
    {
      id: 'inv-104',
      type: 'INCOMING',
      symbol: '2C26THH',
      number: '00001000',
      issueDate: '01/05/2026',
      counterpartTaxCode: '0105678901',
      counterpartName: 'Công ty Cổ phần Cho thuê Văn phòng Hùng Vương',
      preTaxAmount: 35000000,
      vatRate: '8%',
      vatAmount: 2800000,
      totalAmount: 37800000,
      ocrConfidence: 0.98,
      riskStatus: 'SAFE',
      riskFlags: [],
      suggestedDebitAcc: '6422',
      suggestedCreditAcc: '331'
    }
  ],
  't-002': [
    {
      id: 'inv-201',
      type: 'OUTGOING',
      symbol: '1C26HKD',
      number: '00000042',
      issueDate: '14/05/2026',
      counterpartTaxCode: '0103334455',
      counterpartName: 'Khách hàng Lẻ / Xuất gộp trong ngày',
      preTaxAmount: 18500000,
      vatRate: '1.5%', // Thuế suất khoán
      vatAmount: 277500,
      totalAmount: 18777500,
      ocrConfidence: 1.0,
      riskStatus: 'SAFE',
      riskFlags: [],
      suggestedDebitAcc: 'Sổ quỹ tiền mặt',
      suggestedCreditAcc: 'Doanh thu bán hàng'
    },
    {
      id: 'inv-202',
      type: 'INCOMING',
      symbol: '1C26TNN',
      number: '00000312',
      issueDate: '11/05/2026',
      counterpartTaxCode: '0201112233',
      counterpartName: 'Công ty TNHH Nhập khẩu Thực phẩm Sài Gòn',
      preTaxAmount: 25000000,
      vatRate: '8%',
      vatAmount: 2000000,
      totalAmount: 27000000,
      ocrConfidence: 0.96,
      riskStatus: 'WARNING',
      riskFlags: ['Hóa đơn xuất vào cuối tuần/ngoài giờ hành chính'],
      suggestedDebitAcc: 'Sổ chi phí vật tư',
      suggestedCreditAcc: 'Thanh toán chuyển khoản'
    }
  ]
};

export const MOCK_JOURNALS: Record<string, JournalEntry[]> = {
  't-001': [
    {
      id: 'je-1',
      date: '12/05/2026',
      voucherCode: 'PT-0512',
      description: 'Ghi nhận doanh thu bán phần mềm theo hợp đồng số 12/HD-2026',
      debitAccount: '131 (Phải thu KH)',
      creditAccount: '5111 (Doanh thu bán hàng hóa/dịch vụ)',
      amount: 150000000,
      isAutomated: true
    },
    {
      id: 'je-2',
      date: '12/05/2026',
      voucherCode: 'PT-0512',
      description: 'Thuế GTGT đầu ra phải nộp tương ứng',
      debitAccount: '131 (Phải thu KH)',
      creditAccount: '33311 (Thuế GTGT đầu ra)',
      amount: 15000000,
      isAutomated: true
    },
    {
      id: 'je-3',
      date: '10/05/2026',
      voucherCode: 'PC-0510',
      description: 'Thanh toán cước Internet cáp quang tháng 4/2026',
      debitAccount: '6422 (Chi phí quản lý doanh nghiệp)',
      creditAccount: '1111 (Tiền mặt Việt Nam)',
      amount: 12000000,
      isAutomated: true
    },
    {
      id: 'je-4',
      date: '10/05/2026',
      voucherCode: 'PC-0510',
      description: 'Khấu trừ thuế GTGT đầu vào',
      debitAccount: '1331 (Thuế GTGT được khấu trừ)',
      creditAccount: '1111 (Tiền mặt Việt Nam)',
      amount: 1200000,
      isAutomated: true
    }
  ],
  't-002': [
    {
      id: 'je-88-1',
      date: '14/05/2026',
      voucherCode: 'S1-0042',
      description: 'Ghi Sổ chi tiết doanh thu bán hàng hóa dịch vụ (Thông tư 88)',
      debitAccount: 'Sổ Quỹ',
      creditAccount: 'Mục I. Doanh thu phân phối',
      amount: 18500000,
      isAutomated: true
    },
    {
      id: 'je-88-2',
      date: '11/05/2026',
      voucherCode: 'S2-0312',
      description: 'Ghi Sổ chi phí sản xuất kinh doanh (Mua hàng hóa nhập kho)',
      debitAccount: 'Mục II. Chi phí Hàng hóa',
      creditAccount: 'Thanh toán NH',
      amount: 25000000,
      isAutomated: true
    }
  ]
};

export const MOCK_ALERTS: RiskAlert[] = [
  {
    id: 'alt-001',
    level: 'CRITICAL',
    title: 'Hóa đơn đầu vào từ doanh nghiệp rủi ro cao (Mới thành lập)',
    description: 'Hóa đơn số 00000888 (Công ty TNHH Truyền thông & Quảng cáo Đỉnh Cao) phát sinh giao dịch 93,500,000 VND. Doanh nghiệp này mới thành lập dưới 6 tháng và có dấu hiệu rủi ro trốn thuế theo danh sách cảnh báo của Tổng Cục Thuế.',
    timestamp: '14/05/2026 09:12',
    detectedOnInvoice: '00000888',
    recommendation: 'Cần xác minh lại hồ sơ năng lực của nhà cung cấp, chuẩn bị hợp đồng, biên bản nghiệm thu và chứng từ thanh toán không dùng tiền mặt chi tiết để giải trình khi quyết toán.'
  },
  {
    id: 'alt-002',
    level: 'WARNING',
    title: 'Cảnh báo hạn chót nộp Tờ khai Thuế GTGT Tháng 4/2026',
    description: 'Hôm nay là ngày 14/05. Hạn chót nộp Tờ khai 01/GTGT kỳ tính thuế Tháng 4/2026 là ngày 20/05/2026. Vui lòng ký số và kết xuất nộp qua hệ thống eGP/Thuedientu.',
    timestamp: '13/05/2026 15:30',
    recommendation: 'Sử dụng chức năng Xuất HTKK XML tại Tab Báo Cáo để nộp ngay, tránh bị phạt chậm nộp theo Nghị định 125/2020/NĐ-CP.'
  },
  {
    id: 'alt-003',
    level: 'INFO',
    title: 'Phát hiện sai lệch tỷ lệ Chi phí tiền lương trên Tổng doanh thu',
    description: 'Tỷ lệ chi phí BHXH và Lương kỳ này chiếm 42% tổng doanh thu, cao hơn mức trung bình ngành (25-30%). AI Kế toán gợi ý rà soát lại quy chế lương thưởng.',
    timestamp: '10/05/2026 11:05',
    recommendation: 'Đảm bảo có đầy đủ Hợp đồng lao động, Bảng chấm công và quy chế tài chính để hợp lệ hóa chi phí tính thuế TNDN.'
  }
];

// NẠP (EMBEDDING) CORE KNOWLEDGE SOURCES SPECIFIED BY USER
export const EMBEDDED_KNOWLEDGE_SOURCES: EmbeddedSource[] = [
  {
    id: 'src-luat-38',
    type: 'LUAT',
    title: 'Luật Quản lý thuế số 38/2019/QH14',
    purpose: 'Quy định về thời hạn và thủ tục nộp thuế.',
    totalChunks: 1450,
    vectorDimension: 1536,
    sampleEmbeddedText: 'Điều 44. Thời hạn nộp hồ sơ khai thuế: 1. Thời hạn nộp hồ sơ khai thuế đối với loại thuế khai theo tháng, theo quý được quy định như sau: a) Chậm nhất là ngày thứ 20 của tháng tiếp theo liền kề tháng phát sinh nghĩa vụ thuế đối với trường hợp khai và nộp theo tháng; b) Chậm nhất là ngày cuối cùng của tháng đầu của quý tiếp theo liền kề quý phát sinh nghĩa vụ thuế đối với trường hợp khai và nộp theo quý.',
    lastUpdated: '14/05/2026 (Đã Vector Hóa)'
  },
  {
    id: 'src-tt-80',
    type: 'THONG_TU',
    title: 'Thông tư 80/2021/TT-BTC',
    purpose: 'Hướng dẫn thi hành Luật Quản lý thuế.',
    totalChunks: 2120,
    vectorDimension: 1536,
    sampleEmbeddedText: 'Điều 12. Phân bổ nghĩa vụ thuế của người nộp thuế hạch toán tập trung có đơn vị phụ thuộc, địa điểm kinh doanh tại tỉnh khác nơi có trụ sở chính: Người nộp thuế có trách nhiệm khai thuế, tính thuế và nộp hồ sơ khai thuế cho cơ quan thuế quản lý trực tiếp và phân bổ số thuế phải nộp cho từng tỉnh nơi có cơ sở sản xuất trực thuộc...',
    lastUpdated: '14/05/2026 (Đã Vector Hóa)'
  },
  {
    id: 'src-tt-133',
    type: 'KE_TOAN',
    title: 'Thông tư 133/2016/TT-BTC',
    purpose: 'Chế độ kế toán cho doanh nghiệp vừa và nhỏ.',
    totalChunks: 1890,
    vectorDimension: 1536,
    sampleEmbeddedText: 'Tài khoản 131 - Phải thu của khách hàng: Tài khoản này dùng để phản ánh các khoản nợ phải thu và tình hình thanh toán các khoản nợ phải thu của doanh nghiệp với khách hàng về tiền bán sản phẩm, hàng hóa, BĐS đầu tư, cung cấp dịch vụ... Bên Nợ phản ánh số tiền phải thu của khách hàng phát sinh trong kỳ. Bên Có phản ánh số tiền khách hàng đã trả nợ.',
    lastUpdated: '14/05/2026 (Đã Vector Hóa)'
  },
  {
    id: 'src-xml-gdt',
    type: 'KY_THUAT',
    title: 'Cấu trúc file XML của Tổng cục Thuế',
    purpose: 'Để AI kết xuất dữ liệu nộp thuế đúng định dạng.',
    totalChunks: 650,
    vectorDimension: 1536,
    sampleEmbeddedText: 'Lược đồ XSD Tờ khai điện tử HTKK: Các thẻ gốc bắt buộc bao gồm <HSoThueDTu> chứa <HSoKhaiThue> và <ChuKySo>. Bên trong <HSoKhaiThue> phải cấu trúc chi tiết <TTinChung> (thông tin định danh NNT, mã số thuế, kỳ khai thuế) và <CTieuTKhai> ánh xạ chính xác các thẻ XML tương ứng với số thứ tự chỉ tiêu mẫu biểu kê khai (ví dụ: <ChiTieu23>, <ChiTieu25>).',
    lastUpdated: '14/05/2026 (Đã Vector Hóa)'
  },
  {
    id: 'src-nd-123',
    type: 'THONG_TU',
    title: 'Nghị định 123/2020/NĐ-CP',
    purpose: 'Quy định tiêu chuẩn hóa đơn, chứng từ hợp lệ.',
    totalChunks: 1250,
    vectorDimension: 1536,
    sampleEmbeddedText: 'Điều 9. Thời điểm lập hóa đơn: 1. Thời điểm lập hóa đơn đối với bán hàng hóa là thời điểm chuyển giao quyền sở hữu hoặc quyền sử dụng hàng hóa cho người mua, không phân biệt đã thu được tiền hay chưa thu được tiền. 2. Thời điểm lập hóa đơn đối với cung cấp dịch vụ là thời điểm hoàn thành việc cung cấp dịch vụ...',
    lastUpdated: '14/05/2026 (Đã Vector Hóa)'
  },
  {
    id: 'src-nd-44',
    type: 'LUAT',
    title: 'Nghị định 44/2023/NĐ-CP & NĐ 15/2022',
    purpose: 'Chính sách giảm thuế GTGT từ 10% xuống 8%.',
    totalChunks: 880,
    vectorDimension: 1536,
    sampleEmbeddedText: 'Giảm thuế giá trị gia tăng đối với các nhóm hàng hóa, dịch vụ đang áp dụng mức thuế suất 10% xuống còn 8%, trừ nhóm hàng hóa viễn thông, hoạt động tài chính...',
    lastUpdated: '14/05/2026 (Đã Vector Hóa)'
  }
];

export const MOCK_QA_KNOWLEDGE: LegalQA[] = [
  {
    id: 'qa-cashflow',
    sourceId: 'src-hv-tc',
    question: 'Quy định về quản trị dòng tiền theo giáo trình chính thống của Học viện Tài chính?',
    shortAnswer: 'Dòng tiền thuần từ hoạt động kinh doanh (OCF) phản ánh chênh lệch giữa các dòng tiền vào và dòng tiền ra phát sinh từ các hoạt động tạo ra doanh thu chủ yếu của doanh nghiệp.',
    legalCitation: 'Giáo trình Quản trị Tài chính Doanh nghiệp - Học viện Tài chính (Trang 156)',
    fullAnalysis: 'Trích dẫn nguyên văn:\n"Dòng tiền từ hoạt động kinh doanh là chỉ tiêu quan trọng nhất, phản ánh khả năng của doanh nghiệp trong việc tạo ra đủ tiền để duy trì hoạt động, trả nợ, chia cổ tức và thực hiện các khoản đầu tư mới mà không cần đến các nguồn tài trợ bên ngoài. Phương pháp gián tiếp để xác định OCF bắt đầu từ lợi nhuận trước thuế và điều chỉnh cho các khoản không phải bằng tiền như khấu hao, dự phòng và các thay đổi trong vốn lưu động."',
    tags: ['Dòng tiền', 'OCF', 'Học viện Tài chính']
  },
  {
    id: 'qa-tax-deadline',
    sourceId: 'src-luat-38',
    question: 'Thời hạn nộp hồ sơ khai thuế GTGT được quy định cụ thể tại văn bản luật nào?',
    shortAnswer: 'Chậm nhất là ngày thứ 20 của tháng tiếp theo (tháng) hoặc ngày cuối cùng của tháng đầu quý tiếp theo (quý).',
    legalCitation: 'Điều 44 Luật Quản lý thuế số 38/2019/QH14',
    fullAnalysis: 'Trích dẫn Điều 44 Luật Quản lý thuế số 38/2019/QH14:\n"1. Thời hạn nộp hồ sơ khai thuế đối với loại thuế khai theo tháng, theo quý được quy định như sau:\na) Chậm nhất là ngày thứ 20 của tháng tiếp theo liền kề tháng phát sinh nghĩa vụ thuế đối với trường hợp khai và nộp theo tháng;\nb) Chậm nhất là ngày cuối cùng của tháng đầu của quý tiếp theo liền kề quý phát sinh nghĩa vụ thuế đối với trường hợp khai và nộp theo quý.\n2. Thời hạn nộp hồ sơ khai thuế đối với loại thuế có kỳ tính thuế theo năm..."',
    tags: ['Thời hạn nộp thuế', 'Luật 38', 'GTGT']
  },
  {
    id: 'qa-invoice-timing',
    sourceId: 'src-nd-123',
    question: 'Thời điểm lập hóa đơn đối với bán hàng hóa và cung cấp dịch vụ theo quy định chính phủ?',
    shortAnswer: 'Bán hàng: Thời điểm chuyển giao quyền sở hữu. Dịch vụ: Thời điểm hoàn thành việc cung cấp dịch vụ.',
    legalCitation: 'Điều 9 Nghị định số 123/2020/NĐ-CP',
    fullAnalysis: 'Trích dẫn nguyên văn Nghị định 123/2020/NĐ-CP:\n"1. Thời điểm lập hóa đơn đối với bán hàng hóa (bao gồm cả bán tài sản nhà nước, tài sản tịch thu, sung quỹ nhà nước và bán hàng dự trữ quốc gia) là thời điểm chuyển giao quyền sở hữu hoặc quyền sử dụng hàng hóa cho người mua, không phân biệt đã thu được tiền hay chưa thu được tiền.\n2. Thời điểm lập hóa đơn đối với cung cấp dịch vụ là thời điểm hoàn thành việc cung cấp dịch vụ không phân biệt đã thu được tiền hay chưa thu được tiền. Trường hợp người cung cấp dịch vụ có thu tiền trước hoặc trong khi cung cấp dịch vụ thì thời điểm lập hóa đơn là thời điểm thu tiền..."',
    tags: ['Nghị định 123', 'Hóa đơn', 'Thời điểm lập hóa đơn']
  },
  {
    id: 'qa-taxplanning',
    sourceId: 'src-ueh',
    question: 'Có những phương thức hợp pháp nào để tối ưu hóa thuế TNDN cho doanh nghiệp phần mềm?',
    shortAnswer: 'Tận dụng ưu đãi thuế suất 10% trong 15 năm, miễn 4 năm và giảm 50% trong 9 năm tiếp theo cho dự án phần mềm mới.',
    legalCitation: 'Điều 11 & 12 Thông tư 96/2015/TT-BTC & Tư liệu UEH',
    fullAnalysis: 'Theo **Đại học Kinh tế TP.HCM** và quy định hiện hành:\n- **Ưu đãi ngành nghề**: Sản xuất phần mềm là lĩnh vực ưu đãi đầu tư cao nhất.\n- **Điều kiện**: Doanh nghiệp phải có dự án đầu tư mới và đáp ứng tiêu chuẩn quy trình sản xuất phần mềm của Bộ Thông tin & Truyền thông.\n- **Kết quả**: Giảm mức thuế suất thực tế từ 20% xuống mức trung bình khoảng 5-7% trong suốt vòng đời ưu đãi.',
    tags: ['Tối ưu thuế', 'Thuế TNDN', 'Doanh nghiệp phần mềm']
  },
  {
    id: 'qa-1',
    sourceId: 'src-luat-38',
    question: 'Thời hạn nộp hồ sơ khai thuế GTGT theo tháng và theo quý được quy định cụ thể như thế nào trong Luật Quản lý thuế?',
    shortAnswer: 'Khai theo tháng chậm nhất là ngày 20 của tháng tiếp theo. Khai theo quý chậm nhất là ngày cuối cùng của tháng đầu quý tiếp theo.',
    legalCitation: 'Khoản 1 Điều 44 Luật Quản lý thuế số 38/2019/QH14',
    fullAnalysis: 'Hệ thống SmartTax AI trích xuất Vector Chunk từ nguồn **Luật Quản lý thuế số 38/2019/QH14**:\n- Đối với doanh nghiệp/hộ kinh doanh áp dụng kỳ khai thuế theo tháng: Hạn chót nộp Tờ khai 01/GTGT là ngày thứ 20 của tháng liền kề sau tháng phát sinh.\n- Đối với doanh nghiệp/hộ kinh doanh kê khai theo quý: Hạn chót nộp hồ sơ là ngày cuối cùng của tháng đầu tiên thuộc quý liền kề tiếp theo.\n*Cảnh báo AI*: Quá thời hạn trên, hệ thống HTKK/Thuedientu sẽ ghi nhận nộp trễ và áp dụng tính tiền chậm nộp theo mức 0.03%/ngày tính trên số thuế chậm nộp (Căn cứ Điều 59 Luật 38/2019/QH14).',
    tags: ['Thời hạn nộp thuế', 'Luật Quản lý thuế', 'Thuế GTGT']
  },
  {
    id: 'qa-2',
    sourceId: 'src-tt-80',
    question: 'Theo Thông tư 80/2021/TT-BTC, doanh nghiệp có đơn vị phụ thuộc sản xuất ở tỉnh khác có phải phân bổ thuế GTGT phải nộp không?',
    shortAnswer: 'Có. Doanh nghiệp thực hiện khai thuế tập trung tại trụ sở chính và phân bổ số thuế GTGT phải nộp cho từng tỉnh nơi có cơ sở sản xuất trực thuộc.',
    legalCitation: 'Điều 12 và Điều 13 Thông tư 80/2021/TT-BTC',
    fullAnalysis: 'Trích xuất dữ liệu Embedding từ **Thông tư 80/2021/TT-BTC** hướng dẫn thi hành Luật Quản lý thuế:\nNgười nộp thuế thực hiện khai thuế, tính thuế và nộp hồ sơ khai thuế GTGT cho cơ quan thuế quản lý trực tiếp trụ sở chính, đồng thời sử dụng Phụ lục bảng phân bổ số thuế GTGT phải nộp (Mẫu số 01-6/GTGT) đính kèm Tờ khai 01/GTGT để nộp riêng phần thuế tương ứng cho địa bàn các tỉnh nơi có cơ sở sản xuất trực thuộc (không trực tiếp bán hàng, không hạch toán kế toán).',
    tags: ['Thông tư 80', 'Phân bổ thuế', 'Đơn vị phụ thuộc']
  },
  {
    id: 'qa-3',
    sourceId: 'src-tt-133',
    question: 'Doanh nghiệp áp dụng Thông tư 133/2016/TT-BTC hạch toán chi phí dịch vụ mua ngoài phục vụ quản lý doanh nghiệp vào tài khoản nào?',
    shortAnswer: 'Hạch toán vào Tài khoản 6422 (Chi phí quản lý doanh nghiệp).',
    legalCitation: 'Danh mục hệ thống tài khoản và Hướng dẫn TK 642 - Thông tư 133/2016/TT-BTC',
    fullAnalysis: 'Dữ liệu Kế toán được nạp từ **Thông tư 133/2016/TT-BTC** quy định cụ thể:\nDoanh nghiệp nhỏ và vừa không sử dụng hệ thống tài khoản loại 6 chi tiết như Thông tư 200 (không có TK 6427 hay 6428 độc lập). Mọi chi phí quản lý hành chính, chi phí văn phòng phẩm, cước viễn thông Internet, tiền thuê văn phòng phục vụ chung cho bộ máy quản lý được phản ánh trực tiếp vào **Bên Nợ Tài khoản 6422 (Chi phí quản lý doanh nghiệp)**. Thuế GTGT đầu vào tương ứng phản ánh vào Bên Nợ TK 1331.',
    tags: ['Thông tư 133', 'Hạch toán kế toán', 'Chi phí quản lý', 'TK 6422']
  },
  {
    id: 'qa-4',
    sourceId: 'src-xml-gdt',
    question: 'Cấu trúc thẻ định dạng XML bắt buộc để kết xuất Tờ khai thuế tương thích với phần mềm HTKK và hệ thống GDT?',
    shortAnswer: 'File XML phải tuân thủ chuẩn XSD của TCT: Bắt đầu bằng Root tag <HSoThueDTu>, chứa <HSoKhaiThue> và phân vùng <TTinChung>, <CTieuTKhai>.',
    legalCitation: 'Đặc tả kỹ thuật Cấu trúc dữ liệu Tờ khai XML - Tổng cục Thuế Việt Nam',
    fullAnalysis: 'Nguồn tri thức kỹ thuật nạp từ **Cấu trúc file XML của Tổng cục Thuế** xác định:\nĐể hệ thống eGP của TCT đọc và xác thực tự động, cấu trúc tài liệu bắt buộc bao gồm các vùng định danh không gian tên:\n```xml\n<HSoThueDTu xmlns="http://www.gdt.gov.vn/2026/HTKK">\n  <HSoKhaiThue>\n    <TTinChung>...</TTinChung>\n    <CTieuTKhai>\n      <ChiTieu23>...</ChiTieu23>\n      <ChiTieu25>...</ChiTieu25>\n    </CTieuTKhai>\n  </HSoKhaiThue>\n  <ChuKySo>...</ChuKySo>\n</HSoThueDTu>\n```\nAI Engine của SmartTax AI tuân thủ nghiêm ngặt mô hình này để đảm bảo dữ liệu kết xuất không bị từ chối do lỗi định dạng.',
    tags: ['Cấu trúc XML', 'HTKK tương thích', 'Chuẩn kỹ thuật GDT']
  },
  {
    id: 'qa-5',
    question: 'Chi phí quảng cáo tiếp thị (Marketing) có bị khống chế mức tối đa được trừ khi tính thuế TNDN không?',
    shortAnswer: 'Không. Hiện tại chi phí quảng cáo, tiếp thị không còn bị khống chế tỷ lệ theo luật hiện hành.',
    legalCitation: 'Khoản 2 Điều 14 Luật số 71/2014/QH13 và Điều 4 Thông tư 96/2015/TT-BTC',
    fullAnalysis: 'Trước đây, chi phí quảng cáo tiếp thị bị khống chế ở mức 15% tổng chi phí được trừ. Tuy nhiên, kể từ ngày 01/01/2015 (theo Luật số 71/2014/QH13 sửa đổi các luật về thuế), quy định khống chế này đã được bãi bỏ hoàn toàn. Doanh nghiệp được tính vào chi phí được trừ 100% giá trị phát sinh nếu đáp ứng đủ các điều kiện:\n1. Khoản chi thực tế phát sinh liên quan đến hoạt động sản xuất, kinh doanh của doanh nghiệp.\n2. Có đủ hóa đơn, chứng từ hợp pháp theo quy định của pháp luật (Hóa đơn GTGT, hợp đồng dịch vụ, biên bản nghiệm thu chạy ads Facebook/Google, hình ảnh chứng minh).\n3. Khoản chi nếu có giá trị từ 20 triệu đồng trở lên (giá đã bao gồm thuế GTGT) phải có chứng từ thanh toán không dùng tiền mặt.',
    tags: ['Thuế TNDN', 'Chi phí được trừ', 'Marketing']
  }
];

export const MOCK_HTKK_XML_TEMPLATES: Record<string, string> = {
  '01/GTGT': `<?xml version="1.0" encoding="UTF-8"?>
<HSoThueDTu xmlns="http://www.gdt.gov.vn/2026/HTKK">
  <HSoKhaiThue>
    <TTinChung>
      <TTinDVu>
        <MaDVu>HTKK_AI_CONNECTOR</MaDVu>
        <TenDVu>Phần mềm SmartTax AI tích hợp GDT</TenDVu>
      </TTinDVu>
      <TTinTKhai>
        <MaTKhai>01_GTGT</MaTKhai>
        <TenTKhai>Tờ khai thuế giá trị gia tăng (Mẫu số 01/GTGT)</TenTKhai>
        <KyKKhai>
          <Thang>04</Thang>
          <Nam>2026</Nam>
        </KyKKhai>
        <MaSoThue>0109876543</MaSoThue>
        <TenNNT>Công ty TNHH Giải Pháp Công Nghệ Viễn Đông</TenNNT>
      </TTinTKhai>
    </TTinChung>
    <CTieuTKhai>
      <ChiTieu21>0</ChiTieu21>
      <ChiTieu22>12000000</ChiTieu22> <!-- Thuế GTGT còn được khấu trừ kỳ trước chuyển sang -->
      <ChiTieu23>132000000</ChiTieu23> <!-- Giá trị HHDV mua vào trong kỳ -->
      <ChiTieu24>12500000</ChiTieu24> <!-- Thuế GTGT mua vào trong kỳ -->
      <ChiTieu25>12500000</ChiTieu25> <!-- Thuế GTGT mua vào được khấu trừ -->
      <ChiTieu26>0</ChiTieu26>
      <ChiTieu27>150000000</ChiTieu27> <!-- HHDV bán ra chịu thuế 10% -->
      <ChiTieu28>15000000</ChiTieu28> <!-- Thuế GTGT bán ra -->
      <ChiTieu36>15000000</ChiTieu36> <!-- Tổng thuế GTGT bán ra -->
      <ChiTieu40>0</ChiTieu40> <!-- Thuế GTGT còn phải nộp trong kỳ -->
      <ChiTieu43>9500000</ChiTieu43> <!-- Thuế GTGT còn được khấu trừ chuyển sang kỳ sau -->
    </CTieuTKhai>
  </HSoKhaiThue>
  <ChuKySo>
    <TrangThai>DA_KY_SO_HOP_LE</TrangThai>
    <NguoiKy>CN=Công ty TNHH Giải Pháp Công Nghệ Viễn Đông, O=SmartCA VN, C=VN</NguoiKy>
    <ThoiGianKy>2026-05-14T14:00:00+07:00</ThoiGianKy>
  </ChuKySo>
</HSoThueDTu>`,
  '05/KK-TNCN': `<?xml version="1.0" encoding="UTF-8"?>
<HSoThueDTu xmlns="http://www.gdt.gov.vn/2026/HTKK">
  <HSoKhaiThue>
    <TTinChung>
      <TTinTKhai>
        <MaTKhai>05_KK_TNCN</MaTKhai>
        <TenTKhai>Tờ khai khấu trừ thuế thu nhập cá nhân</TenTKhai>
        <KyKKhai>
          <Thang>04</Thang>
          <Nam>2026</Nam>
        </KyKKhai>
        <MaSoThue>0109876543</MaSoThue>
      </TTinTKhai>
    </TTinChung>
    <CTieuTKhai>
      <TongSoLaoDong>24</TongSoLaoDong>
      <TrongDoHopDongThang>22</TrongDoHopDongThang>
      <TongThuNhapTraChoCN>185000000</TongThuNhapTraChoCN>
      <TongThuNhapChiuThue>185000000</TongThuNhapChiuThue>
      <TongThueTNCNKhauTru>18500000</TongThueTNCNKhauTru>
    </CTieuTKhai>
  </HSoKhaiThue>
</HSoThueDTu>`,
  '01/CNKD': `<?xml version="1.0" encoding="UTF-8"?>
<HSoThueDTu xmlns="http://www.gdt.gov.vn/2026/HTKK">
  <HSoKhaiThue>
    <TTinChung>
      <TTinTKhai>
        <MaTKhai>01_CNKD</MaTKhai>
        <TenTKhai>Tờ khai thuế đối với cá nhân kinh doanh (Hộ kinh doanh TT88)</TenTKhai>
        <KyKKhai>
          <Quy>2</Quy>
          <Nam>2026</Nam>
        </KyKKhai>
        <MaSoThue>8392019283-001</MaSoThue>
        <TenNNT>Hộ kinh doanh TM&amp;DV Thực phẩm An Khang</TenNNT>
      </TTinTKhai>
    </TTinChung>
    <CTieuTKhai>
      <DoanhThuTinhThueGTGT>18500000</DoanhThuTinhThueGTGT>
      <TyLeGTGT>1.5%</TyLeGTGT>
      <ThueGTGTPhaiNop>277500</ThueGTGTPhaiNop>
      <DoanhThuTinhThueTNCN>18500000</DoanhThuTinhThueTNCN>
      <TyLeTNCN>0.5%</TyLeTNCN>
      <ThueTNCNPhaiNop>92500</ThueTNCNPhaiNop>
      <TongThuePhaiNop>370000</TongThuePhaiNop>
    </CTieuTKhai>
  </HSoKhaiThue>
</HSoThueDTu>`,
  '03/TNDN': `<?xml version="1.0" encoding="UTF-8"?>
<HSoThueDTu xmlns="http://www.gdt.gov.vn/2026/HTKK">
  <HSoKhaiThue>
    <TTinChung>
      <TTinTKhai>
        <MaTKhai>03_TNDN</MaTKhai>
        <TenTKhai>Tờ khai quyết toán thuế thu nhập doanh nghiệp (Mẫu 03/TNDN)</TenTKhai>
        <KyKKhai>
          <Nam>2026</Nam>
        </KyKKhai>
        <MaSoThue>0109876543</MaSoThue>
      </TTinTKhai>
    </TTinChung>
    <CTieuTKhai>
      <ChiTieuA1>1250000000</ChiTieuA1> <!-- Tổng lợi nhuận kế toán trước thuế -->
      <ChiTieuB4>35000000</ChiTieuB4> <!-- Các khoản chi không được trừ (B4) -->
      <ChiTieuC1>1285000000</ChiTieuC1> <!-- Thu nhập chịu thuế -->
      <ChiTieuE1>257000000</ChiTieuE1> <!-- Thuế TNDN phải nộp (Thuế suất 20%) -->
    </CTieuTKhai>
  </HSoKhaiThue>
</HSoThueDTu>`,
  '04/GTGT': `<?xml version="1.0" encoding="UTF-8"?>
<HSoThueDTu xmlns="http://www.gdt.gov.vn/2026/HTKK">
  <HSoKhaiThue>
    <TTinChung>
      <TTinTKhai>
        <MaTKhai>04_GTGT</MaTKhai>
        <TenTKhai>Tờ khai thuế GTGT trực tiếp trên doanh thu (Mẫu 04/GTGT)</TenTKhai>
        <KyKKhai>
          <Thang>04</Thang>
          <Nam>2026</Nam>
        </KyKKhai>
        <MaSoThue>0109876543</MaSoThue>
      </TTinTKhai>
    </TTinChung>
    <CTieuTKhai>
      <DoanhThuHHDV>150000000</DoanhThuHHDV>
      <TyLeTinhThue>5%</TyLeTinhThue>
      <ThueGTGTPhaiNop>7500000</ThueGTGTPhaiNop>
    </CTieuTKhai>
  </HSoKhaiThue>
</HSoThueDTu>`
};

export interface Circular88BookRecord {
  id: string;
  bookCode: 'S1' | 'S2' | 'S3' | 'S4';
  bookTitle: string;
  entryDate: string;
  voucherRef: string;
  description: string;
  amount: number;
  note?: string;
}

export const MOCK_CIRCULAR_88_BOOKS: Circular88BookRecord[] = [
  // Sổ S1: Sổ chi tiết doanh thu
  {
    id: 's1-1',
    bookCode: 'S1',
    bookTitle: 'Sổ chi tiết doanh thu bán hàng hóa, dịch vụ',
    entryDate: '14/05/2026',
    voucherRef: 'HD-00042',
    description: 'Doanh thu phân phối hàng tiêu dùng cho khách vãng lai',
    amount: 18500000,
    note: 'Thuế suất GTGT 1.5%, TNCN 0.5%'
  },
  {
    id: 's1-2',
    bookCode: 'S1',
    bookTitle: 'Sổ chi tiết doanh thu bán hàng hóa, dịch vụ',
    entryDate: '12/05/2026',
    voucherRef: 'HD-00041',
    description: 'Cung cấp suất ăn công nghiệp / hợp đồng dịch vụ',
    amount: 32000000,
    note: 'Thuế suất GTGT 3%, TNCN 1.5%'
  },
  // Sổ S2: Sổ chi tiết vật liệu, dụng cụ, hàng hóa
  {
    id: 's2-1',
    bookCode: 'S2',
    bookTitle: 'Sổ chi tiết vật liệu, dụng cụ, sản phẩm, hàng hóa',
    entryDate: '11/05/2026',
    voucherRef: 'PN-0312',
    description: 'Nhập kho lô hàng thực phẩm đóng hộp (Hóa đơn đầu vào hợp lệ NĐ 123)',
    amount: 25000000,
    note: 'SL: 500 thùng, Đơn giá: 50,000'
  },
  // Sổ S3: Sổ chi phí sản xuất, kinh doanh
  {
    id: 's3-1',
    bookCode: 'S3',
    bookTitle: 'Sổ chi phí sản xuất, kinh doanh',
    entryDate: '10/05/2026',
    voucherRef: 'PC-0105',
    description: 'Thanh toán tiền thuê mặt bằng cửa hàng tháng 5/2026',
    amount: 12000000,
    note: 'Đã thanh toán qua ngân hàng (Matching OK)'
  },
  {
    id: 's3-2',
    bookCode: 'S3',
    bookTitle: 'Sổ chi phí sản xuất, kinh doanh',
    entryDate: '08/05/2026',
    voucherRef: 'PC-0102',
    description: 'Chi phí nhân công thuê ngoài / bốc vác lô hàng',
    amount: 3500000,
    note: 'Có phiếu chi và CMND đính kèm'
  },
  // Sổ S4: Sổ theo dõi thực hiện nghĩa vụ thuế với NSNN
  {
    id: 's4-1',
    bookCode: 'S4',
    bookTitle: 'Sổ theo dõi tình hình thực hiện nghĩa vụ thuế với NSNN',
    entryDate: '05/05/2026',
    voucherRef: 'GNT-009',
    description: 'Nộp tiền thuế khoán quý 1/2026 vào Kho bạc Nhà nước',
    amount: 9200000,
    note: 'Mã chương 757, Tiểu mục 1701 (GTGT) & 1001 (TNCN)'
  }
];

export const MOCK_AUDIT_ISSUES_TT133: AccountingAuditIssue[] = [
  {
    id: 'iss-101',
    level: 'CRITICAL',
    title: 'Giao dịch mua hàng thanh toán tiền mặt vượt định mức 20 triệu',
    description: 'Bút toán thanh toán hóa đơn số 00001090 cho Công ty Văn phòng phẩm Đại Dương với số tiền 24,500,000 VND bằng Tiền mặt (Nợ TK 6422 / Có TK 1111). Theo quy định, các hóa đơn trên 20 triệu bắt buộc phải chuyển khoản để được khấu trừ thuế GTGT và tính chi phí hợp lệ.',
    lawBasis: 'Khoản 1 Điều 4 Thông tư 96/2015/TT-BTC & Khoản 5 Điều 14 Thông tư 219/2013/TT-BTC',
    affectedAccount: '1111 (Tiền mặt Việt Nam Đồng)',
    affectedValue: 24500000,
    status: 'ACTIVE',
    autoFixText: 'Tự động sửa: Chuyển tài khoản thanh toán sang Có TK 1121 (Tiền gửi ngân hàng) và gắn mã chứng từ UNC',
    fixData: {
      creditAccount: '1121',
      action: 'REPLACE_ACCOUNT'
    }
  },
  {
    id: 'iss-102',
    level: 'WARNING',
    title: 'Sử dụng sai hệ thống tài khoản theo Chế độ kế toán TT133',
    description: 'Phát hiện 2 bút toán dịch vụ mua ngoài đang định khoản vào Nợ TK 6427 (Chi phí dịch vụ mua ngoài) và Nợ TK 6428 (Chi phí bằng tiền khác). Chế độ kế toán TT133 cho DN vừa và nhỏ không sử dụng TK 6427/6428 mà bắt buộc gộp chung vào TK 6422 (Chi phí quản lý doanh nghiệp).',
    lawBasis: 'Điều 58 Thông tư 133/2016/TT-BTC về Hệ thống tài khoản kế toán',
    affectedAccount: '6427 / 6428',
    affectedValue: 12800000,
    status: 'ACTIVE',
    autoFixText: 'Tự động sửa: Chuyển toàn bộ dư nợ của 6427/6428 sang TK 6422 theo chuẩn TT133',
    fixData: {
      debitAccount: '6422',
      action: 'REPLACE_ACCOUNT'
    }
  },
  {
    id: 'iss-103',
    level: 'INFO',
    title: 'Tỷ lệ chi phí Tiếp thị quảng cáo tăng cao đột biến',
    description: 'Tổng chi phí tiếp thị quảng cáo của quý này chiếm 18.5% tổng doanh thu thực tế, cao hơn mức trung bình ngành công nghệ (10-12%). Mặc dù không còn bị khống chế trần 15% nhưng cơ quan thuế sẽ thanh tra kỹ tính hợp lý và hồ sơ bàn giao dịch vụ.',
    lawBasis: 'Khoản 2 Điều 14 Luật số 71/2014/QH13 (Bãi bỏ khống chế chi phí quảng cáo)',
    affectedAccount: '6422 (Chi phí quản lý - chi tiết ADS)',
    affectedValue: 145000000,
    status: 'ACTIVE',
    autoFixText: 'Đánh dấu rà soát hồ sơ chứng từ (Hợp đồng ads, Báo cáo nghiệm thu)',
    fixData: {
      action: 'MARK_NON_DEDUCTIBLE'
    }
  }
];

export const MOCK_AUDIT_ISSUES_TT88: AccountingAuditIssue[] = [
  {
    id: 'iss-201',
    level: 'CRITICAL',
    title: 'Thanh toán tiền mặt cho hóa đơn thuê mặt bằng trên 20 triệu',
    description: 'Phát hiện phiếu chi PC-0101 chi trả 22,000,000 VND bằng tiền mặt cho chủ nhà để thuê cửa hàng kinh doanh. Hộ kinh doanh kê khai áp dụng nộp thuế trực tiếp vẫn cần có chứng từ thanh toán không dùng tiền mặt đối với các khoản chi phí mua vào từ 20 triệu để làm cơ sở chứng minh nguồn tiền hợp pháp và giảm trừ nghĩa vụ nếu có.',
    lawBasis: 'Thông tư 40/2021/TT-BTC & Nghị định 125/2020/NĐ-CP',
    affectedAccount: 'Sổ S3 - Chi phí kinh doanh',
    affectedValue: 22000000,
    status: 'ACTIVE',
    autoFixText: 'Tự động sửa: Cập nhật chứng từ đính kèm sang Ủy nhiệm chi (UNC) ngân hàng',
    fixData: {
      action: 'REPLACE_ACCOUNT'
    }
  },
  {
    id: 'iss-202',
    level: 'WARNING',
    title: 'Sai lệch số lượng tồn kho giữa Sổ nhập kho vật liệu và Sổ chi tiết doanh thu',
    description: 'Sản phẩm "Nước giải khát đóng chai" bán ra theo Hóa đơn HD-00045 ghi nhận số lượng 120 thùng, nhưng Sổ chi tiết vật liệu dụng cụ (Sổ S2) chỉ ghi nhận nhập kho 80 thùng và không có tồn kho đầu kỳ. Sai lệch này dẫn đến âm kho lý thuyết.',
    lawBasis: 'Quy định lập Sổ S2 ban hành kèm theo Thông tư 88/2021/TT-BTC',
    affectedAccount: 'Sổ S2 - Chi tiết vật liệu, sản phẩm, hàng hóa',
    affectedValue: 40,
    status: 'ACTIVE',
    autoFixText: 'Tự động sửa: Khởi tạo phiếu nhập bổ sung cho lô hàng nhập ngày 05/05/2026',
    fixData: {
      action: 'SPLIT_TRANSACTION'
    }
  }
];

export const MOCK_TRIAL_BALANCE_TT133: TrialBalanceItem[] = [
  { accountNumber: '1111', accountName: 'Tiền mặt Việt Nam Đồng', openingDebit: 120000000, openingCredit: 0, periodDebit: 340000000, periodCredit: 290000000, closingDebit: 170000000, closingCredit: 0 },
  { accountNumber: '1121', accountName: 'Tiền gửi Ngân hàng thương mại', openingDebit: 450000000, openingCredit: 0, periodDebit: 980000000, periodCredit: 650000000, closingDebit: 780000000, closingCredit: 0 },
  { accountNumber: '131', accountName: 'Phải thu khách hàng', openingDebit: 85000000, openingCredit: 0, periodDebit: 1250000000, periodCredit: 1100000000, closingDebit: 235000000, closingCredit: 0 },
  { accountNumber: '1331', accountName: 'Thuế GTGT đầu vào được khấu trừ', openingDebit: 12500000, openingCredit: 0, periodDebit: 78000000, periodCredit: 82500000, closingDebit: 8000000, closingCredit: 0 },
  { accountNumber: '156', accountName: 'Hàng hóa mua vào', openingDebit: 210000000, openingCredit: 0, periodDebit: 480000000, periodCredit: 520000000, closingDebit: 170000000, closingCredit: 0 },
  { accountNumber: '331', accountName: 'Phải trả người bán', openingDebit: 0, openingCredit: 45000000, periodDebit: 580000000, periodCredit: 620000000, closingDebit: 0, closingCredit: 85000000 },
  { accountNumber: '33311', accountName: 'Thuế GTGT đầu ra phải nộp', openingDebit: 0, openingCredit: 15200000, periodDebit: 82500000, periodCredit: 125000000, closingDebit: 0, closingCredit: 57700000 },
  { accountNumber: '5111', accountName: 'Doanh thu bán hàng hóa, dịch vụ', openingDebit: 0, openingCredit: 0, periodDebit: 0, periodCredit: 1250000000, closingDebit: 0, closingCredit: 1250000000 },
  { accountNumber: '6422', accountName: 'Chi phí quản lý doanh nghiệp (TT133)', openingDebit: 0, openingCredit: 0, periodDebit: 622400000, periodCredit: 0, closingDebit: 622400000, closingCredit: 0 },
  { accountNumber: '6427', accountName: 'Chi phí dịch vụ mua ngoài (Sai chế độ)', openingDebit: 0, openingCredit: 0, periodDebit: 12800000, periodCredit: 0, closingDebit: 12800000, closingCredit: 0 }
];

export const MOCK_TRIAL_BALANCE_TT88: TrialBalanceItem[] = [
  { accountNumber: 'Sổ S1', accountName: 'Doanh thu bán hàng hóa, dịch vụ', openingDebit: 0, openingCredit: 0, periodDebit: 0, periodCredit: 185000000, closingDebit: 0, closingCredit: 185000000 },
  { accountNumber: 'Sổ S2', accountName: 'Vật liệu, dụng cụ, sản phẩm, hàng hóa', openingDebit: 15000000, openingCredit: 0, periodDebit: 45000000, periodCredit: 38000000, closingDebit: 22000000, closingCredit: 0 },
  { accountNumber: 'Sổ S3', accountName: 'Chi phí sản xuất, kinh doanh', openingDebit: 0, openingCredit: 0, periodDebit: 32500000, periodCredit: 0, closingDebit: 32500000, closingCredit: 0 },
  { accountNumber: 'Sổ S4', accountName: 'Tình hình thực hiện nghĩa vụ thuế', openingDebit: 0, openingCredit: 9200000, periodDebit: 9200000, periodCredit: 3700000, closingDebit: 0, closingCredit: 3700000 }
];

export const MOCK_GDT_RECEIPTS: Record<string, GdtReceipt> = {
  't-001': {
    receiptNumber: 'GD-2026-05-998811',
    receivedDate: '26/05/2026 19:10:45',
    statusText: 'ĐÃ CHẤP NHẬN TỜ KHAI',
    taxCode: '0109876543',
    companyName: 'Công ty TNHH Giải Pháp Công Nghệ Viễn Đông',
    declarationType: 'Tờ khai thuế Giá trị gia tăng (Mẫu 01/GTGT)',
    period: 'Tháng 04/2026',
    xmlHash: 'E8A9F3C1D0B7E6F4A2B8C3D9E0A1F2C3B4A5D6E7',
    gdtCode: 'QTN-0100 (Chi cục Thuế Quận Cầu Giấy)',
    paymentCode: 'GNT-2026-05-883391',
    acceptanceMessage: 'Thông báo số 18839/TB-TCT: Tổng cục Thuế Việt Nam thông báo chấp nhận Hồ sơ khai thuế điện tử của NNT. Hồ sơ hợp lệ và đã ghi nhận nghĩa vụ thuế GTGT phải nộp là 2,500,000 VND vào NSNN.'
  },
  't-002': {
    receiptNumber: 'GD-2026-05-998822',
    receivedDate: '26/05/2026 19:11:12',
    statusText: 'ĐÃ CHẤP NHẬN TỜ KHAI',
    taxCode: '0311223344',
    companyName: 'Hộ Kinh Doanh Tiệm Bánh & Cà Phê Horizon',
    declarationType: 'Tờ khai thuế Hộ kinh doanh (Mẫu 01/CNKD)',
    period: 'Quý 2/2026',
    xmlHash: 'FA2B8C3D9E0A1F2C3B4A5D6E7E8A9F3C1D0B7E6F',
    gdtCode: 'QTN-0300 (Chi cục Thuế Quận 1 - TP.HCM)',
    paymentCode: 'GNT-2026-05-883392',
    acceptanceMessage: 'Thông báo số 18840/TB-TCT: Tổng cục Thuế Việt Nam thông báo chấp nhận Hồ sơ khai thuế điện tử của NNT. Hồ sơ hợp lệ và đã ghi nhận nghĩa vụ thuế phải nộp (1.5% GTGT + 0.5% TNCN) vào NSNN.'
  }
};

export const MOCK_GDT_BLACKLIST: string[] = ['0315556677', '0104445556'];

export const MOCK_PAYROLL_EMPLOYEES: PayrollEmployee[] = [
  {
    id: 'emp-001',
    name: 'Nguyễn Văn Long',
    role: 'Giám Đốc Điều Hành',
    contractStatus: 'SIGNED',
    taxCodeStatus: 'REGISTERED',
    baseSalary: 28000000,
    allowances: { clothing: 0, lunch: 0, telephone: 0, other: 0 },
    optimized: false
  },
  {
    id: 'emp-002',
    name: 'Trần Thị Thu thảo',
    role: 'Lập trình viên Senior',
    contractStatus: 'SIGNED',
    taxCodeStatus: 'REGISTERED',
    baseSalary: 22000000,
    allowances: { clothing: 0, lunch: 0, telephone: 0, other: 0 },
    optimized: false
  },
  {
    id: 'emp-003',
    name: 'Phạm Minh Đức',
    role: 'Nhân viên Thử việc CNTT',
    contractStatus: 'UNSIGNED',
    taxCodeStatus: 'UNREGISTERED',
    baseSalary: 8500000,
    allowances: { clothing: 0, lunch: 0, telephone: 0, other: 0 },
    optimized: false
  }
];

export const MOCK_INTERNAL_CONTROL_ISSUES_TT133: InternalControlIssue[] = [
  {
    id: 'ic-101',
    category: 'CASH_STOCK',
    level: 'CRITICAL',
    title: 'Phát hiện thâm hụt số dư quỹ tiền mặt (Âm quỹ lý thuyết)',
    description: 'Số dư Tiền mặt Việt Nam Đồng (TK 1111) bị âm -12,800,000 VND sau bút toán hạch toán mua sắm thiết bị văn phòng. Kê khai sổ sách có quỹ tiền mặt âm là sai phạm kế toán nghiêm trọng, sẽ bị cơ quan thuế bác bỏ sổ sách và ấn định thuế.',
    lawBasis: 'Điều 14 Thông tư 133/2016/TT-BTC & Luật Kế toán số 88/2015/QH13',
    affectedValue: 12800000,
    status: 'ACTIVE',
    autoFixText: 'Tự động sửa: Tạo hợp đồng vay cá nhân không lãi suất (UNC 3411) để bù đắp quỹ mặt 50,000,000 VND'
  },
  {
    id: 'ic-102',
    category: 'PAYROLL',
    level: 'WARNING',
    title: 'Rủi ro bảo hiểm & thuế TNCN: Thiếu hợp đồng và MST nhân viên thử việc',
    description: 'Nhân viên Phạm Minh Đức (Lương: 8,500,000 VND) chưa đăng ký MST cá nhân và chưa có hợp đồng lao động ký kết, nhưng vẫn được hạch toán chi phí lương vào TK 6422. Chi phí này có nguy cơ bị loại trừ 100% khi quyết toán thuế TNDN.',
    lawBasis: 'Điều 4 Thông tư 96/2015/TT-BTC & Điều 25 Thông tư 111/2013/TT-BTC',
    affectedValue: 8500000,
    status: 'ACTIVE',
    autoFixText: 'Tự động sửa: Cơ cấu lại lương (tách phụ cấp trang phục & điện thoại miễn thuế) và tạo tờ khai đăng ký MST nhanh'
  },
  {
    id: 'ic-103',
    category: 'BLACKLIST',
    level: 'CRITICAL',
    title: 'Hóa đơn đầu vào mua quảng cáo thuộc danh nghiệp rủi ro cao (GDT Blacklist)',
    description: 'Hóa đơn số 00005220 phát sinh giao dịch 120,000,000 VND do doanh nghiệp MST 0104445556 (Công ty Đầu tư Thiết bị Văn phòng Cao Cấp) xuất bản. Doanh nghiệp này nằm trong danh sách đen cảnh báo trốn thuế/bán hóa đơn khống của Tổng cục Thuế.',
    lawBasis: 'Công văn số 2524/TCT-TTKT của Tổng cục Thuế về hóa đơn rủi ro',
    affectedValue: 120000000,
    status: 'ACTIVE',
    autoFixText: 'Tự động loại bỏ hóa đơn khỏi Tờ khai GTGT khấu trừ và đưa vào Chi phí không được trừ',
    invoiceId: 'inv-ocr-' // Will match with OCR demo file
  }
];

export const MOCK_INTERNAL_CONTROL_ISSUES_TT88: InternalControlIssue[] = [
  {
    id: 'ic-201',
    category: 'CASH_STOCK',
    level: 'CRITICAL',
    title: 'Cảnh báo âm quỹ tiền mặt trên Sổ S1 (Sổ chi tiết doanh thu & quỹ)',
    description: 'Phát hiện số dư tiền mặt tại quỹ của hộ kinh doanh bị âm -4,200,000 VND sau khi chi trả lương nhân công thuê ngoài bốc vác hàng hóa.',
    lawBasis: 'Chế độ sổ sách ban hành kèm theo Thông tư 88/2021/TT-BTC',
    affectedValue: 4200000,
    status: 'ACTIVE',
    autoFixText: 'Tự động sửa: Lập phiếu thu bổ sung vốn góp cá nhân của chủ hộ kinh doanh trị giá 10,000,000 VND'
  },
  {
    id: 'ic-202',
    category: 'PAYROLL',
    level: 'WARNING',
    title: 'Bảng lương hộ kinh doanh chưa được tối ưu hóa thuế',
    description: 'Toàn bộ lương nhân viên đang được chi trả dưới dạng lương cứng 100%, chưa tối ưu hóa các khoản trợ cấp ăn trưa và phụ cấp trang phục để được miễn trừ thuế TNCN theo chế độ kê khai trực tiếp.',
    lawBasis: 'Thông tư 40/2021/TT-BTC & Thông tư 111/2013/TT-BTC',
    affectedValue: 6000000,
    status: 'ACTIVE',
    autoFixText: 'Tự động sửa: Thiết lập cơ cấu phụ cấp ăn trưa tối đa 730,000đ/tháng và trang phục 5,000,000đ/năm'
  }
];

export interface BankTransaction {
  id: string;
  date: string;
  referenceNumber: string;
  description: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  matchStatus: 'UNMATCHED' | 'MATCHED' | 'SUGGESTED';
  suggestedLedgerEntry?: {
    debitAccount: string;
    creditAccount: string;
    description: string;
    invoiceNumber?: string;
  };
}

export const MOCK_BANK_TRANSACTIONS_TT133: BankTransaction[] = [
  {
    id: 'bt-101',
    date: '13/05/2026',
    referenceNumber: 'FT261330928301',
    description: 'CO PHAN BDS VINH QUANG THANH TOAN HIEU LUONG HD00000105',
    amount: 165000000,
    type: 'DEPOSIT',
    matchStatus: 'SUGGESTED',
    suggestedLedgerEntry: {
      debitAccount: '1121',
      creditAccount: '131',
      description: 'Nhận tiền gửi ngân hàng thanh toán cho Hóa đơn số 00000105 (BDS Vinh Quang)',
      invoiceNumber: '00000105'
    }
  },
  {
    id: 'bt-102',
    date: '11/05/2026',
    referenceNumber: 'FT261310029381',
    description: 'UNC-4921 CHUYEN TIEN TT TIEN INTERNET FPT TELECOM',
    amount: 13200000,
    type: 'WITHDRAWAL',
    matchStatus: 'SUGGESTED',
    suggestedLedgerEntry: {
      debitAccount: '331',
      creditAccount: '1121',
      description: 'Chuyển khoản thanh toán tiền cước Internet FPT theo HĐ 00004921',
      invoiceNumber: '00004921'
    }
  },
  {
    id: 'bt-103',
    date: '10/05/2026',
    referenceNumber: 'FT261300084321',
    description: 'TECHCOMBANK - PHI QUAN LY DIEN TU VA DUY TRI DICH VU THANG 04',
    amount: 110000,
    type: 'WITHDRAWAL',
    matchStatus: 'SUGGESTED',
    suggestedLedgerEntry: {
      debitAccount: '6425',
      creditAccount: '1121',
      description: 'Phí dịch vụ tài khoản quản lý điện tử Techcombank Tháng 04/2026'
    }
  },
  {
    id: 'bt-104',
    date: '08/05/2026',
    referenceNumber: 'FT261280982736',
    description: 'NGUYEN VAN LONG CHUYEN TIEN TAM UNG HD KINH DOANH',
    amount: 50000000,
    type: 'DEPOSIT',
    matchStatus: 'UNMATCHED',
    suggestedLedgerEntry: {
      debitAccount: '1121',
      creditAccount: '3411',
      description: 'Nhận tiền vay cá nhân Nguyễn Văn Long bổ sung vốn lưu động ngân hàng'
    }
  }
];

export const MOCK_BANK_TRANSACTIONS_TT88: BankTransaction[] = [
  {
    id: 'bt-201',
    date: '12/05/2026',
    referenceNumber: 'FT261320921102',
    description: 'AN BINH SHOP CHUYEN KHOAN THANH TOAN TIEN MUA HANG',
    amount: 5500000,
    type: 'DEPOSIT',
    matchStatus: 'SUGGESTED',
    suggestedLedgerEntry: {
      debitAccount: 'Sổ S1',
      creditAccount: 'Sổ S2',
      description: 'Nhận tiền chuyển khoản thanh toán mua hàng của An Bình Shop',
      invoiceNumber: '00005520'
    }
  },
  {
    id: 'bt-202',
    date: '10/05/2026',
    referenceNumber: 'FT261300029311',
    description: 'TECHCOMBANK SMS BAN KING FEE',
    amount: 22000,
    type: 'WITHDRAWAL',
    matchStatus: 'SUGGESTED',
    suggestedLedgerEntry: {
      debitAccount: 'Sổ chi phí',
      creditAccount: 'Sổ S1',
      description: 'Phí dịch vụ biến động số dư SMS Banking ngân hàng Techcombank'
    }
  }
];


