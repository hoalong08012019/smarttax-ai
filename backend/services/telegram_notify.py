import requests
import logging

logger = logging.getLogger(__name__)

def send_telegram_alert(bot_token: str, chat_id: str, message: str) -> bool:
    """
    Gửi thông báo giao dịch/thuế miễn phí tới Telegram cá nhân hoặc nhóm chat của doanh nghiệp.
    Thay thế giải pháp Zalo ZNS có tính phí cho nhóm thử nghiệm 10 doanh nghiệp.
    """
    if not bot_token or not chat_id:
        logger.warning("Cấu hình Telegram Bot Token hoặc Chat ID bị khuyết. Bỏ qua gửi thông báo.")
        return False
        
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            logger.info("Đã gửi thông báo Telegram thành công!")
            return True
        else:
            logger.error(f"Gửi thông báo Telegram thất bại: {response.text}")
            return False
    except Exception as e:
        logger.error(f"Lỗi kết nối API Telegram: {str(e)}")
        return False


def format_autopilot_telegram_message(company_name: str, tax_code: str, period: str, summary: dict) -> str:
    """
    Định dạng tin nhắn thông báo kết quả Autopilot báo cáo thuế chuyên nghiệp.
    """
    vat_payable = summary.get("payable_vat", 0)
    cit_payable = summary.get("payable_cit", 0)
    
    msg = (
        f"🤖 *[SmartTax Autopilot Engine] BÁO CÁO CHU KỲ KÊ KHAI TỰ TRỊ*\n\n"
        f"🏢 *Doanh nghiệp:* {company_name}\n"
        f"🆔 *Mã số thuế:* `{tax_code}`\n"
        f"📅 *Kỳ tính thuế:* {period}\n"
        f"====================================\n\n"
        f"✅ *Đã hoàn tất quy trình 6 bước tự động:*\n"
        f"1️⃣ Đồng bộ hóa đơn điện tử Tổng cục Thuế\n"
        f"2️⃣ Khớp đối soát giao dịch Ngân hàng mẫu\n"
        f"3️⃣ Kiểm toán quỹ tiền mặt & Tự động tạo vay cá nhân\n"
        f"4️⃣ Tối ưu phụ cấp lương miễn thuế TNCN/BHXH\n"
        f"5️⃣ Ký số tờ khai điện tử bằng Remote Cloud HSM\n"
        f"6️⃣ Nộp Tờ khai cổng Thuế e-GP thành công!\n\n"
        f"📊 *Nghĩa vụ thuế dự kiến kỳ này:*\n"
        f"• Thuế GTGT phải nộp: *{vat_payable:,.0f} VND*\n"
        f"• Thuế TNDN/TNCN phải nộp: *{cit_payable:,.0f} VND*\n\n"
        f"📩 _Biên nhận tiếp nhận chính thức từ Tổng cục Thuế đã được lưu trữ trong hệ thống của bạn._\n"
        f"💡 *Khuyến nghị:* Hãy chuẩn bị nguồn vốn để nộp tiền thuế trước hạn chót quy định để tránh phạt phát sinh."
    )
    return msg
