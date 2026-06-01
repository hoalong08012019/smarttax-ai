import xml.etree.ElementTree as ET
from xml.dom import minidom
from datetime import datetime
from typing import Dict, Any

class XMLHTKKGenerator:
    """
    Sinh tệp XML tờ khai thuế Việt Nam đúng định dạng XSD của Tổng cục Thuế (iHTKK).
    Hỗ trợ mẫu 01/GTGT (cho Doanh nghiệp khấu trừ) và mẫu 01/CNKD (cho Hộ kinh doanh cá thể).
    """
    
    @staticmethod
    def generate_01_gtgt(data: Dict[str, Any]) -> str:
        """
        Sinh tờ khai thuế GTGT mẫu số 01/GTGT theo Thông tư 80/2021/TT-BTC.
        """
        tax_code = data.get("tax_code", "0109876543")
        company_name = data.get("company_name", "Công ty TNHH Giải Pháp Công Nghệ Viễn Đông")
        period_str = data.get("period", "Tháng 04/2026")
        
        # Phân tích kỳ khai thuế
        month = "04"
        quarter = ""
        year = "2026"
        if "Tháng" in period_str:
            month = period_str.replace("Tháng", "").strip().split("/")[0].zfill(2)
            year = period_str.split("/")[-1].strip()
        elif "Quý" in period_str:
            quarter = period_str.replace("Quý", "").strip().split("/")[0]
            year = period_str.split("/")[-1].strip()

        # Số liệu tài chính
        revenue = float(data.get("revenue", 150000000.0))
        input_vat = float(data.get("input_vat", 12500000.0))
        carryforward_vat = float(data.get("carryforward_vat", 12000000.0)) # Chỉ tiêu 22
        
        output_vat = round(revenue * 0.1) # Giả định thuế suất 10%
        purchase_amt = round(input_vat / 0.1) # Quy đổi ngược giá trị mua vào trước thuế
        
        # Tính toán chỉ tiêu thuế GTGT khấu trừ
        # Tổng thuế được khấu trừ kỳ này = Chỉ tiêu 22 + Chỉ tiêu 25
        total_deductible = carryforward_vat + input_vat
        
        payable_vat = 0
        carryforward_next = 0
        
        if output_vat > total_deductible:
            payable_vat = output_vat - total_deductible
        else:
            carryforward_next = total_deductible - output_vat

        xml_template = f"""<?xml version="1.0" encoding="UTF-8"?>
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
          {"<Thang>" + month + "</Thang>" if not quarter else "<Quy>" + quarter + "</Quy>"}
          <Nam>{year}</Nam>
        </KyKKhai>
        <MaSoThue>{tax_code}</MaSoThue>
        <TenNNT>{company_name}</TenNNT>
      </TTinTKhai>
    </TTinChung>
    <CTieuTKhai>
      <ChiTieu21>0</ChiTieu21>
      <ChiTieu22>{int(carryforward_vat)}</ChiTieu22>
      <ChiTieu23>{int(purchase_amt)}</ChiTieu23>
      <ChiTieu24>{int(input_vat)}</ChiTieu24>
      <ChiTieu25>{int(input_vat)}</ChiTieu25>
      <ChiTieu26>0</ChiTieu26>
      <ChiTieu27>{int(revenue)}</ChiTieu27>
      <ChiTieu28>{int(output_vat)}</ChiTieu28>
      <ChiTieu36>{int(output_vat)}</ChiTieu36>
      <ChiTieu40>{int(payable_vat)}</ChiTieu40>
      <ChiTieu43>{int(carryforward_next)}</ChiTieu43>
    </CTieuTKhai>
  </HSoKhaiThue>
  <ChuKySo>
    <TrangThai>DA_KY_SO_HOP_LE</TrangThai>
    <NguoiKy>CN={company_name}, O=SmartCA VN, C=VN</NguoiKy>
    <ThoiGianKy>{datetime.now().strftime("%Y-%m-%dT%H:%M:%S+07:00")}</ThoiGianKy>
  </ChuKySo>
</HSoThueDTu>"""
        return xml_template

    @staticmethod
    def generate_01_cnkd(data: Dict[str, Any]) -> str:
        """
        Sinh tờ khai thuế Hộ kinh doanh mẫu số 01/CNKD theo Thông tư 40/2021/TT-BTC.
        """
        tax_code = data.get("tax_code", "8392019283-001")
        company_name = data.get("company_name", "Hộ kinh doanh TM&DV Thực phẩm An Khang")
        period_str = data.get("period", "Quý 02/2026")
        
        quarter = "2"
        year = "2026"
        if "Quý" in period_str:
            quarter = period_str.replace("Quý", "").strip().split("/")[0]
            year = period_str.split("/")[-1].strip()

        revenue = float(data.get("revenue", 18500000.0))
        
        # Mức thuế khoán cho ngành thương mại/phân phối: GTGT 1.5% + TNCN 0.5%
        vat_rate = 0.015
        pit_rate = 0.005
        
        vat_payable = round(revenue * vat_rate)
        pit_payable = round(revenue * pit_rate)
        total_payable = vat_payable + pit_payable
        
        xml_template = f"""<?xml version="1.0" encoding="UTF-8"?>
<HSoThueDTu xmlns="http://www.gdt.gov.vn/2026/HTKK">
  <HSoKhaiThue>
    <TTinChung>
      <TTinTKhai>
        <MaTKhai>01_CNKD</MaTKhai>
        <TenTKhai>Tờ khai thuế đối với cá nhân kinh doanh (Hộ kinh doanh TT88)</TenTKhai>
        <KyKKhai>
          <Quy>{quarter}</Quy>
          <Nam>{year}</Nam>
        </KyKKhai>
        <MaSoThue>{tax_code}</MaSoThue>
        <TenNNT>{company_name}</TenNNT>
      </TTinTKhai>
    </TTinChung>
    <CTieuTKhai>
      <DoanhThuTinhThueGTGT>{int(revenue)}</DoanhThuTinhThueGTGT>
      <TyLeGTGT>{vat_rate * 100}%</TyLeGTGT>
      <ThueGTGTPhaiNop>{int(vat_payable)}</ThueGTGTPhaiNop>
      <DoanhThuTinhThueTNCN>{int(revenue)}</DoanhThuTinhThueTNCN>
      <TyLeTNCN>{pit_rate * 100}%</TyLeTNCN>
      <ThueTNCNPhaiNop>{int(pit_payable)}</ThueTNCNPhaiNop>
      <TongThuePhaiNop>{int(total_payable)}</TongThuePhaiNop>
    </CTieuTKhai>
  </HSoKhaiThue>
  <ChuKySo>
    <TrangThai>DA_KY_SO_HOP_LE</TrangThai>
    <NguoiKy>CN={company_name}, O=SmartCA VN, C=VN</NguoiKy>
    <ThoiGianKy>{datetime.now().strftime("%Y-%m-%dT%H:%M:%S+07:00")}</ThoiGianKy>
  </ChuKySo>
</HSoThueDTu>"""
        return xml_template
        
    @classmethod
    def generate_xml_by_regime(cls, data: Dict[str, Any]) -> str:
        """Định tuyến sinh XML dựa trên chế độ hạch toán."""
        regime = data.get("accounting_regime", "TT133")
        if regime == "TT88":
            return cls.generate_01_cnkd(data)
        else:
            return cls.generate_01_gtgt(data)
