from typing import Dict, Any, Optional
import logging
from config import settings

logger = logging.getLogger(__name__)

# Fallback local list chứa các doanh nghiệp ma rủi ro mua bán hóa đơn của Tổng cục Thuế
LOCAL_BLACKLIST = {
    "0104445556": {
        "company_name": "Công ty TNHH Mua bán Hóa đơn Ma Cao",
        "reason": "Mua bán hóa đơn khống, không hoạt động tại địa chỉ đăng ký",
        "law_basis": "Quyết định 450/QĐ-TCT"
    },
    "0312456789": {
        "company_name": "Công ty TNHH Truyền thông & Quảng cáo Đỉnh Cao",
        "reason": "Mới thành lập dưới 6 tháng nhưng phát sinh doanh thu đột biến nghi vấn trốn thuế",
        "law_basis": "Thông báo 1282/TB-TCT"
    }
}

def scan_tax_code(tax_code: str) -> Optional[Dict[str, Any]]:
    """
    Rà soát mã số thuế người bán có thuộc danh sách doanh nghiệp trốn thuế/bỏ trốn hay không.
    Dò tìm trong Supabase Database đầu tiên, nếu ngoại tuyến sẽ tự động dùng danh sách cục bộ (local).
    """
    cleaned_tc = str(tax_code).strip().replace("-", "")
    
    # 1. Thử kết nối truy vấn Supabase
    try:
        from supabase import create_client, Client
        if settings.SUPABASE_URL and settings.SUPABASE_KEY and "your-project" not in settings.SUPABASE_URL:
            supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            response = supabase.table("blacklist_mst").select("*").eq("tax_code", cleaned_tc).execute()
            if response.data and len(response.data) > 0:
                logger.info(f"Đã phát hiện MST {cleaned_tc} trong DB Blacklist thực tế.")
                return {
                    "company_name": response.data[0]["company_name"],
                    "reason": response.data[0]["reason"],
                    "law_basis": response.data[0]["law_basis"]
                }
    except Exception as e:
        logger.warning(f"Không thể kết nối CSDL Supabase để quét MST: {str(e)}. Fallback sang Local Blacklist.")
        
    # 2. Fallback sang danh sách local
    if cleaned_tc in LOCAL_BLACKLIST:
        logger.info(f"Đã phát hiện MST {cleaned_tc} trong Local Blacklist.")
        return LOCAL_BLACKLIST[cleaned_tc]
        
    return None
