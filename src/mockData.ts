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
    sampleEmbeddedText: 'Giảm thuế giá trị gia tăng đối với các nhóm hàng hóa, dịch vụ đang áp dụng mức thuế suất 10% xuống còn 8%, trừ nhóm hàng hóa viễn thông, hoạt động tài chính, ngân hàng, chứng khoán, bảo hiểm, kinh doanh bất động sản, kim loại và sản phẩm từ kim loại đúc sẵn, sản phẩm khai khoáng (không kể khai thác than), than cốc, dầu mỏ tinh chế, sản phẩm hoá chất...',
    lastUpdated: '14/05/2026 (Đã Vector Hóa)'
  }
];

export const MOCK_QA_KNOWLEDGE: LegalQA[] = [
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
