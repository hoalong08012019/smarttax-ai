from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import uvicorn
import shutil
import os
import logging
logger = logging.getLogger(__name__)

from services.xml_parser import parse_vietnam_invoice_xml, parse_invoices_zip
from services.bank_parser import parse_bank_excel, parse_bank_csv
from services.telegram_notify import send_telegram_alert, format_autopilot_telegram_message
from services.blacklist_scanner import scan_tax_code
from services.xml_generator import XMLHTKKGenerator
from services.rag_advisor import generate_text_embedding, search_semantic_knowledge, ask_llm_advisor, index_document_source
from auth.supabase_jwt import get_current_tenant_id, require_admin
from config import settings

app = FastAPI(
    title="SmartTax AI Core API Service",
    description="Lõi API Kế toán trưởng AI sản xuất chuyên dụng cho 10 doanh nghiệp thử nghiệm",
    version="1.0.0"
)

# Cấu hình CORS để Frontend React kết nối an toàn
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "service": "SmartTax AI SaaS MVP Backend"
    }

@app.post("/api/invoices/upload-zip")
async def upload_invoices(
    file: UploadFile = File(...),
    tenant_id: str = Depends(get_current_tenant_id)
):
    """
    Endpoint tiếp nhận file Zip chứa nhiều hóa đơn XML của Tổng cục Thuế hoặc file XML đơn lẻ.
    Tự động rà soát đối chiếu mã số thuế người bán với danh sách đen (Blacklist GDT).
    """
    content = await file.read(10 * 1024 * 1024 + 1)
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Upload exceeds size limit")
    filename = (file.filename or "").lower()
    
    try:
        if filename.endswith('.zip'):
            parsed_invoices = parse_invoices_zip(content)
            for inv in parsed_invoices:
                blacklist_info = scan_tax_code(inv.get("seller_tax_code", ""))
                if blacklist_info:
                    inv["status"] = "CRITICAL"
                    inv["risk_flags"] = [f"GDT BLACKLISTED: {blacklist_info['reason']} ({blacklist_info['law_basis']})"]
            return {
                "success": True,
                "message": f"Giải nén và phân tích thành công {len(parsed_invoices)} hóa đơn XML từ tệp Zip.",
                "invoices": parsed_invoices
            }
        elif filename.endswith('.xml'):
            invoice = parse_vietnam_invoice_xml(content)
            invoice["file_name"] = file.filename
            blacklist_info = scan_tax_code(invoice.get("seller_tax_code", ""))
            if blacklist_info:
                invoice["status"] = "CRITICAL"
                invoice["risk_flags"] = [f"GDT BLACKLISTED: {blacklist_info['reason']} ({blacklist_info['law_basis']})"]
            return {
                "success": True,
                "message": "Phân tích hóa đơn XML đơn lẻ thành công.",
                "invoices": [invoice]
            }
        else:
            raise HTTPException(status_code=400, detail="Chỉ hỗ trợ tải lên file định dạng .zip hoặc .xml")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid invoice file")


@app.post("/api/bank/upload-statement")
async def upload_bank_statement(
    file: UploadFile = File(...),
    tenant_id: str = Depends(get_current_tenant_id)
):
    """
    Endpoint tiếp nhận tệp Excel (.xlsx) hoặc CSV sao kê tài khoản ngân hàng xuất từ Internet Banking.
    """
    content = await file.read(10 * 1024 * 1024 + 1)
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Upload exceeds size limit")
    filename = (file.filename or "").lower()
    
    try:
        if filename.endswith('.xlsx'):
            transactions = parse_bank_excel(content)
        elif filename.endswith('.csv'):
            transactions = parse_bank_csv(content)
        else:
            raise HTTPException(status_code=400, detail="Chỉ hỗ trợ tải lên file định dạng .xlsx hoặc .csv")
            
        return {
            "success": True,
            "message": f"Đã đọc thành công {len(transactions)} giao dịch phát sinh từ tệp sao kê.",
            "transactions": transactions
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid bank statement")


@app.post("/api/autopilot/run")
async def run_autopilot(
    background_tasks: BackgroundTasks,
    company_name: str = Form(...),
    tax_code: str = Form(...),
    accounting_regime: str = Form(...),
    period: str = Form("Tháng 04/2026"),
    telegram_token: Optional[str] = Form(None),
    telegram_chat_id: Optional[str] = Form(None),
    tenant_id: str = Depends(get_current_tenant_id)
):
    """
    Kích hoạt tiến trình Kê khai tự trị Autopilot.
    AI sẽ hạch toán ngầm và tự động gửi thông báo báo cáo hoàn tất qua Telegram Bot.
    """
    raise HTTPException(status_code=503, detail="Verified autopilot executor not configured")


@app.post("/api/advisor/chat")
async def advisor_chat(
    question: str = Form(...),
    tenant_id: str = Depends(get_current_tenant_id)
):
    """
    Endpoint RAG xử lý hỏi đáp luật thuế (Tìm kiếm ngữ nghĩa pgvector + Tổng hợp LLM).
    """
    try:
        # 1. Sinh vector nhúng cho câu hỏi
        emb = generate_text_embedding(question)
        
        # 2. Tìm kiếm các mảnh tri thức tương đồng nhất từ DB
        matches = search_semantic_knowledge(emb)
        
        # 3. Tổng hợp thông tin ngữ cảnh
        context = "\n\n".join([
            f"Tài liệu: {m['title']}\nNội dung: {m['content']}" 
            for m in matches
        ])
        
        # 4. Trích lập câu trả lời từ LLM
        res = ask_llm_advisor(question, context)
        return {
            "answer": res["answer"],
            "citation": res["citation"]
        }
    except Exception as e:
        logger.error("Advisor execution failed")
        raise HTTPException(status_code=500, detail="Advisor service unavailable")

@app.get("/api/admin/session")
def admin_session(tenant_id: str = Depends(require_admin)):
    return {"authenticated": True}

@app.post("/api/admin/index-source")
async def index_knowledge_source(
    source_id: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    tenant_id: str = Depends(require_admin)
):
    """
    Endpoint nạp văn bản luật mới, tự động băm nhỏ, sinh embeddings và lưu vào pgvector DB.
    """
    try:
        chunks_count = index_document_source(source_id, title, content)
        return {
            "success": True,
            "message": f"Tài liệu đã được băm nhỏ thành công thành {chunks_count} mảnh tri thức và lập chỉ mục vào pgvector DB."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Indexing service unavailable")

@app.post("/api/reporting/generate-xml")
async def generate_xml_report(
    tax_code: str = Form(...),
    company_name: str = Form(...),
    accounting_regime: str = Form(...),
    period: str = Form(...),
    revenue: float = Form(150000000.0),
    input_vat: float = Form(12500000.0),
    carryforward_vat: float = Form(12000000.0),
    tenant_id: str = Depends(get_current_tenant_id)
):
    """
    Sinh tờ khai XML chuẩn HTKK cho doanh nghiệp hoặc hộ kinh doanh và trả về dưới dạng file download.
    """
    try:
        data = {
            "tax_code": tax_code,
            "company_name": company_name,
            "accounting_regime": accounting_regime,
            "period": period,
            "revenue": revenue,
            "input_vat": input_vat,
            "carryforward_vat": carryforward_vat
        }
        xml_content = XMLHTKKGenerator.generate_xml_by_regime(data)
        
        filename = f"TKHAI_{accounting_regime.replace('/', '_')}_{tax_code}.xml"
        
        return Response(
            content=xml_content,
            media_type="application/xml",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Report generation failed")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
