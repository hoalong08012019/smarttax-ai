import xml.etree.ElementTree as ET
import os
import zipfile
from io import BytesIO
from typing import Dict, Any, List

def parse_vietnam_invoice_xml(xml_content: bytes) -> Dict[str, Any]:
    """
    Phân tích cú pháp tệp XML Hóa đơn Điện tử chuẩn Nghị định 123 / Thông tư 78 của Tổng cục Thuế.
    Hỗ trợ fallback sang định dạng XML mẫu mô phỏng của hệ thống.
    """
    try:
        # Giải mã chuỗi XML bảo mật
        xml_str = xml_content.decode('utf-8-sig', errors='ignore')
        root = ET.fromstring(xml_str)
        
        # Loại bỏ namespaces để dễ tìm kiếm tag bằng XPath đơn giản
        for el in root.iter():
            if '}' in el.tag:
                el.tag = el.tag.split('}', 1)[1]
                
        # Cấu trúc kết quả trả về
        result = {
            "symbol": "",
            "number": "",
            "issue_date": "",
            "seller_name": "",
            "seller_tax_code": "",
            "buyer_name": "",
            "buyer_tax_code": "",
            "pre_tax_amount": 0.0,
            "vat_rate": "10%",
            "vat_amount": 0.0,
            "total_amount": 0.0,
            "status": "SAFE",
            "risk_flags": []
        }

        # 1. Thử phân tích theo chuẩn hóa đơn GDT thực tế (Circular 78)
        # Tìm các nhánh chính: TTChung (Thông tin chung), NBan (Người bán), NMua (Người mua), TToan (Thanh toán)
        tt_chung = root.find(".//TTChung")
        if tt_chung is not None:
            # Ký hiệu mẫu số hóa đơn + Ký hiệu hóa đơn
            kh_mau = tt_chung.findtext("KHMSHDon", "")
            kh_hdon = tt_chung.findtext("KHHDon", "")
            result["symbol"] = f"{kh_mau}{kh_hdon}" if kh_mau else kh_hdon
            
            # Số hóa đơn
            result["number"] = tt_chung.findtext("SHDon", "").zfill(8)
            
            # Ngày lập hóa đơn
            result["issue_date"] = tt_chung.findtext("NLap", "")
            
        n_ban = root.find(".//NBan")
        if n_ban is not None:
            result["seller_name"] = n_ban.findtext("Ten", "")
            result["seller_tax_code"] = n_ban.findtext("MST", "")
            
        n_mua = root.find(".//NMua")
        if n_mua is not None:
            result["buyer_name"] = n_mua.findtext("Ten", "")
            result["buyer_tax_code"] = n_mua.findtext("MST", "")

        t_toan = root.find(".//TToan")
        if t_toan is not None:
            # Giá trị trước thuế
            try:
                result["pre_tax_amount"] = float(t_toan.findtext("TgTCThue", "0").replace(",", ""))
            except ValueError:
                pass
                
            # Tiền thuế GTGT
            try:
                result["vat_amount"] = float(t_toan.findtext("TgTThue", "0").replace(",", ""))
            except ValueError:
                pass
                
            # Tổng tiền thanh toán
            try:
                result["total_amount"] = float(t_toan.findtext("TgTTTBSo", "0").replace(",", ""))
            except ValueError:
                pass

            # Thuế suất (Đọc từ thẻ ThueSuat trong phân vùng THTThue)
            ts = root.find(".//ThueSuat")
            if ts is not None and ts.text:
                result["vat_rate"] = ts.text

        # 2. Fallback xử lý cho XML mô phỏng từ Frontend (HTKK XML Templates)
        if not result["number"]:
            hso_khai = root.find(".//HSoKhaiThue")
            t_tin_chung = root.find(".//TTinChung")
            c_tieu_tkhai = root.find(".//CTieuTKhai")
            
            if t_tin_chung is not None:
                result["seller_name"] = t_tin_chung.findtext("TenNNT", "")
                result["seller_tax_code"] = t_tin_chung.findtext("MaSoThue", "")
                result["number"] = f"HTKK-{t_tin_chung.findtext('MaTKhai', '01_GTGT')}"
                result["symbol"] = "HTKK"
                
                thang = t_tin_chung.findtext(".//Thang", "")
                nam = t_tin_chung.findtext(".//Nam", "")
                if thang and nam:
                    result["issue_date"] = f"01/{thang}/{nam}"
                else:
                    result["issue_date"] = f"01/01/{nam or '2026'}"
            
            if c_tieu_tkhai is not None:
                # Trích xuất doanh thu và thuế GTGT
                try:
                    # Tờ khai 01/GTGT
                    rev_val = c_tieu_tkhai.findtext("ChiTieu27", "") or c_tieu_tkhai.findtext("DoanhThuTinhThueGTGT", "") or c_tieu_tkhai.findtext("DoanhThuHHDV", "0")
                    result["pre_tax_amount"] = float(rev_val.replace(",", ""))
                    
                    tax_val = c_tieu_tkhai.findtext("ChiTieu28", "") or c_tieu_tkhai.findtext("ThueGTGTPhaiNop", "") or c_tieu_tkhai.findtext("TongThuePhaiNop", "0")
                    result["vat_amount"] = float(tax_val.replace(",", ""))
                    
                    result["total_amount"] = result["pre_tax_amount"] + result["vat_amount"]
                except ValueError:
                    pass

        return result
    except Exception as e:
        raise ValueError(f"Không thể phân tích cú pháp tệp XML: {str(e)}")


def parse_invoices_zip(zip_content: bytes) -> List[Dict[str, Any]]:
    """
    Giải nén file Zip chứa nhiều tệp XML hóa đơn điện tử và phân tích đồng thời.
    """
    invoices = []
    try:
        with zipfile.ZipFile(BytesIO(zip_content)) as archive:
            for file_info in archive.infolist():
                if file_info.filename.endswith('.xml') and not file_info.filename.startswith('__MACOSX'):
                    with archive.open(file_info) as file:
                        xml_bytes = file.read()
                        try:
                            inv_data = parse_vietnam_invoice_xml(xml_bytes)
                            inv_data["file_name"] = os.path.basename(file_info.filename)
                            invoices.append(inv_data)
                        except Exception:
                            # Bỏ qua tệp XML lỗi hoặc không đúng cấu trúc hóa đơn
                            continue
        return invoices
    except zipfile.BadZipFile:
        raise ValueError("Định dạng file Zip không hợp lệ.")
