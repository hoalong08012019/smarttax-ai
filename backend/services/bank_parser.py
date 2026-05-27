import openpyxl
import csv
from io import BytesIO, StringIO
from datetime import datetime
from typing import List, Dict, Any

def clean_amount(val: Any) -> float:
    """Làm sạch chuỗi số tiền và chuyển sang kiểu float."""
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    
    val_str = str(val).strip().replace('.', '').replace(',', '')
    if not val_str:
        return 0.0
        
    # Xử lý dấu âm ở Techcombank (ví dụ: -5000000 hoặc 5000000-)
    is_negative = False
    if val_str.startswith('-'):
        is_negative = True
        val_str = val_str[1:]
    elif val_str.endswith('-'):
        is_negative = True
        val_str = val_str[:-1]
        
    try:
        amount = float(val_str)
        return -amount if is_negative else amount
    except ValueError:
        return 0.0

def parse_bank_excel(file_content: bytes) -> List[Dict[str, Any]]:
    """
    Phân tích cú pháp tệp Excel sao kê tài khoản ngân hàng (.xlsx).
    Tự động dò tìm tiêu đề hàng (header row) và ánh xạ cột động.
    """
    wb = openpyxl.load_workbook(BytesIO(file_content), data_only=True)
    sheet = wb.active
    
    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        return []
        
    # Tìm kiếm dòng Header
    header_idx = -1
    col_mapping = {}
    
    # Từ khóa tìm kiếm cột tương ứng bằng tiếng Việt/Anh
    keywords = {
        "date": ["ngày giao dịch", "ngày gd", "trans date", "date", "ngày"],
        "ref": ["số giao dịch", "mã giao dịch", "ref", "reference", "số ct", "số chứng từ"],
        "amount": ["số tiền", "amount", "phát sinh", "tiền"],
        "debit": ["nợ", "ghi nợ", "debit", "withdrawals"],
        "credit": ["có", "ghi có", "credit", "deposits"],
        "desc": ["nội dung", "chi tiết", "description", "nội dung giao dịch", "diễn giải"]
    }
    
    for idx, row in enumerate(rows):
        row_str = [str(cell).lower().strip() if cell is not None else "" for cell in row]
        # Nếu dòng chứa ít nhất 2 từ khóa cột chính, coi đó là header row
        match_count = 0
        temp_mapping = {}
        
        for key, aliases in keywords.items():
            for c_idx, cell_text in enumerate(row_str):
                if any(alias in cell_text for alias in aliases):
                    temp_mapping[key] = c_idx
                    match_count += 1
                    break
                    
        if match_count >= 2:
            header_idx = idx
            col_mapping = temp_mapping
            break
            
    # Fallback mặc định nếu không tự dò được (Giả định cột Techcombank/Vietcombank tiêu chuẩn)
    if header_idx == -1:
        header_idx = 0
        col_mapping = {
            "date": 0,
            "ref": 1,
            "amount": 2,
            "desc": 3
        }
        
    transactions = []
    
    # Đọc dữ liệu từ sau dòng header
    for row in rows[header_idx + 1:]:
        # Bỏ qua dòng trống
        if all(cell is None for cell in row):
            continue
            
        # Trích xuất Ngày giao dịch
        date_val = row[col_mapping["date"]] if "date" in col_mapping and col_mapping["date"] < len(row) else None
        if not date_val:
            continue
            
        date_str = ""
        if isinstance(date_val, datetime):
            date_str = date_val.strftime("%d/%m/%Y")
        else:
            date_str = str(date_val).strip()
            
        # Trích xuất Mã giao dịch / Tham chiếu
        ref_val = row[col_mapping["ref"]] if "ref" in col_mapping and col_mapping["ref"] < len(row) else ""
        ref_str = str(ref_val).strip() if ref_val is not None else ""
        
        # Trích xuất Diễn giải nội dung
        desc_val = row[col_mapping["desc"]] if "desc" in col_mapping and col_mapping["desc"] < len(row) else ""
        desc_str = str(desc_val).strip() if desc_val is not None else ""
        
        # Trích xuất Số tiền (Ghi nợ/Ghi có độc lập hoặc cột Số tiền chung)
        amount = 0.0
        tx_type = "CREDIT"
        
        if "amount" in col_mapping and col_mapping["amount"] < len(row):
            val = row[col_mapping["amount"]]
            amount = clean_amount(val)
            tx_type = "DEBIT" if amount < 0 else "CREDIT"
            amount = abs(amount)
        elif "debit" in col_mapping and "credit" in col_mapping:
            debit_val = row[col_mapping["debit"]] if col_mapping["debit"] < len(row) else None
            credit_val = row[col_mapping["credit"]] if col_mapping["credit"] < len(row) else None
            
            debit_amt = abs(clean_amount(debit_val))
            credit_amt = abs(clean_amount(credit_val))
            
            if debit_amt > 0:
                amount = debit_amt
                tx_type = "DEBIT"
            else:
                amount = credit_amt
                tx_type = "CREDIT"
                
        # Thêm giao dịch đã phân tích thành công
        if amount > 0:
            transactions.append({
                "date": date_str,
                "reference_number": ref_str,
                "description": desc_str,
                "amount": amount,
                "type": tx_type,
                "match_status": "UNMATCHED"
            })
            
    return transactions

def parse_bank_csv(file_content: bytes) -> List[Dict[str, Any]]:
    """Phân tích cú pháp tệp sao kê CSV tương tự như Excel."""
    csv_str = file_content.decode('utf-8', errors='ignore')
    reader = csv.reader(StringIO(csv_str))
    rows = list(reader)
    
    if not rows:
        return []
        
    header_idx = -1
    col_mapping = {}
    keywords = {
        "date": ["ngày giao dịch", "ngày gd", "trans date", "date", "ngày"],
        "ref": ["số giao dịch", "mã giao dịch", "ref", "reference", "số ct"],
        "amount": ["số tiền", "amount", "phát sinh", "tiền"],
        "debit": ["nợ", "ghi nợ", "debit", "withdrawals"],
        "credit": ["có", "ghi có", "credit", "deposits"],
        "desc": ["nội dung", "chi tiết", "description", "diễn giải"]
    }
    
    for idx, row in enumerate(rows):
        row_str = [cell.lower().strip() for cell in row]
        match_count = 0
        temp_mapping = {}
        for key, aliases in keywords.items():
            for c_idx, cell_text in enumerate(row_str):
                if any(alias in cell_text for alias in aliases):
                    temp_mapping[key] = c_idx
                    match_count += 1
                    break
        if match_count >= 2:
            header_idx = idx
            col_mapping = temp_mapping
            break
            
    if header_idx == -1:
        header_idx = 0
        col_mapping = {"date": 0, "ref": 1, "amount": 2, "desc": 3}
        
    transactions = []
    for row in rows[header_idx + 1:]:
        if not row or all(not cell.strip() for cell in row):
            continue
            
        date_str = row[col_mapping["date"]].strip() if "date" in col_mapping and col_mapping["date"] < len(row) else ""
        if not date_str:
            continue
            
        ref_str = row[col_mapping["ref"]].strip() if "ref" in col_mapping and col_mapping["ref"] < len(row) else ""
        desc_str = row[col_mapping["desc"]].strip() if "desc" in col_mapping and col_mapping["desc"] < len(row) else ""
        
        amount = 0.0
        tx_type = "CREDIT"
        
        if "amount" in col_mapping and col_mapping["amount"] < len(row):
            amount = clean_amount(row[col_mapping["amount"]])
            tx_type = "DEBIT" if amount < 0 else "CREDIT"
            amount = abs(amount)
        elif "debit" in col_mapping and "credit" in col_mapping:
            debit_val = row[col_mapping["debit"]] if col_mapping["debit"] < len(row) else ""
            credit_val = row[col_mapping["credit"]] if col_mapping["credit"] < len(row) else ""
            
            debit_amt = abs(clean_amount(debit_val))
            credit_amt = abs(clean_amount(credit_val))
            
            if debit_amt > 0:
                amount = debit_amt
                tx_type = "DEBIT"
            else:
                amount = credit_amt
                tx_type = "CREDIT"
                
        if amount > 0:
            transactions.append({
                "date": date_str,
                "reference_number": ref_str,
                "description": desc_str,
                "amount": amount,
                "type": tx_type,
                "match_status": "UNMATCHED"
            })
            
    return transactions
