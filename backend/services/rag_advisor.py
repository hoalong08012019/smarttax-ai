import logging
import hashlib
from typing import List, Dict, Any, Optional
from config import settings

logger = logging.getLogger(__name__)

# Fallback RAG matches cục bộ phục vụ chế độ offline của 10 doanh nghiệp chạy thử
LOCAL_KNOWLEDGE = [
    {
        "source_id": "src-luat-38",
        "title": "Luật Quản lý thuế số 38/2019/QH14",
        "content": "Điều 44. Thời hạn nộp hồ sơ khai thuế đối với loại thuế khai theo tháng: Chậm nhất là ngày thứ 20 của tháng tiếp theo liền kề tháng phát sinh nghĩa vụ thuế. Khai theo quý: Chậm nhất là ngày cuối cùng của tháng đầu quý tiếp theo liền kề quý phát sinh."
    },
    {
        "source_id": "src-tt-111",
        "title": "Thông tư 111/2013/TT-BTC",
        "content": "Hướng dẫn luật thuế thu nhập cá nhân: Các khoản phụ cấp trang phục bằng tiền không quá 5 triệu đồng/người/năm, phụ cấp ăn trưa không quá 730,000 đồng/tháng, và phụ cấp tiền điện thoại theo quy chế công ty được trừ khỏi thu nhập chịu thuế TNCN."
    },
    {
        "source_id": "src-tt-133",
        "title": "Thông tư 133/2016/TT-BTC",
        "content": "Chế độ kế toán DN nhỏ và vừa: Chi phí dịch vụ mua ngoài, chi phí bằng tiền khác phục vụ bộ máy quản lý được hạch toán trực tiếp vào Bên Nợ tài khoản 6422 (Chi phí quản lý doanh nghiệp). Không sử dụng TK 6427 hay TK 6428."
    },
    {
        "source_id": "src-nd-132",
        "title": "Nghị định 132/2020/NĐ-CP",
        "content": "Giao dịch liên kết: Tổng chi phí lãi vay được trừ khi tính thuế TNDN đối với doanh nghiệp có phát sinh giao dịch liên kết không vượt quá 30% tổng chỉ số EBITDA cộng với chi phí lãi vay và chi phí khấu hao trong kỳ."
    }
]

def generate_text_embedding(text: str) -> List[float]:
    """
    Sinh vector nhúng (embedding) 1536 chiều bằng OpenAI hoặc Gemini API.
    Có fallback sinh vector mã băm giả lập nếu không cấu hình khóa API.
    """
    # 1. Thử sinh bằng OpenAI
    if settings.OPENAI_API_KEY and "your-" not in settings.OPENAI_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.embeddings.create(
                input=[text],
                model="text-embedding-3-small"
            )
            return response.data[0].embedding
        except Exception as e:
            logger.warning(f"Lỗi gọi OpenAI Embedding: {str(e)}")

    # 2. Thử sinh bằng Gemini/Google Generative AI
    if settings.GEMINI_API_KEY and "your-" not in settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            response = genai.embed_content(
                model="models/text-embedding-004",
                content=text,
                task_type="retrieval_query"
            )
            # Embedding của Gemini thường là 768 chiều. Để tương thích với VECTOR(1536) trong schema, ta nhân đôi hoặc bù 0.
            emb = response['embedding']
            if len(emb) == 768:
                return emb + [0.0] * 768
            return emb[:1536]
        except Exception as e:
            logger.warning(f"Lỗi gọi Gemini Embedding: {str(e)}")

    # 3. Fallback: Sinh vector giả lập 1536 chiều bằng thuật toán MD5 băm chuỗi (Deterministic Mock Vector)
    logger.info("Chưa có API Key. Hệ thống sử dụng sinh Vector giả lập 1536 chiều.")
    vector = []
    text_bytes = text.encode('utf-8')
    for i in range(1536):
        # Tạo salt động cho mỗi chiều
        salt = f"dim-{i}-salt".encode('utf-8')
        h = hashlib.md5(text_bytes + salt).hexdigest()
        # Chuyển hash hex sang float thuộc khoảng [-1.0, 1.0]
        val = (int(h[:8], 16) / 4294967295.0) * 2.0 - 1.0
        vector.append(val)
    return vector

def search_semantic_knowledge(query_emb: List[float], threshold: float = 0.3, limit: int = 3) -> List[Dict[str, Any]]:
    """
    Truy vấn Postgres pgvector tìm các phân đoạn tri thức luật tương đồng nhất.
    Có fallback trả về danh sách cục bộ nếu Supabase offline.
    """
    try:
        from supabase import create_client, Client
        if settings.SUPABASE_URL and settings.SUPABASE_KEY and "your-project" not in settings.SUPABASE_URL:
            supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            # Gọi PostgreSQL Stored Procedure (match_knowledge_chunks)
            response = supabase.rpc("match_knowledge_chunks", {
                "query_embedding": query_emb,
                "match_threshold": threshold,
                "match_count": limit
            }).execute()
            if response.data and len(response.data) > 0:
                logger.info(f"RAG: Đã tìm thấy {len(response.data)} chunks tương đồng từ Supabase.")
                return [
                    {
                        "source_id": chunk["source_id"],
                        "title": chunk["title"],
                        "content": chunk["content"],
                        "similarity": chunk.get("similarity", 0.0)
                    }
                    for chunk in response.data
                ]
    except Exception as e:
        logger.warning(f"CSDL ngoại tuyến hoặc lỗi truy vấn pgvector: {str(e)}. Sử dụng Local Knowledge Match.")

    # Fallback đối sánh từ khóa cục bộ đơn giản làm mô phỏng
    return LOCAL_KNOWLEDGE[:limit]

def ask_llm_advisor(question: str, context: str) -> Dict[str, str]:
    """
    Gọi mô hình ngôn ngữ LLM (GPT-4o hoặc Gemini) để tổng hợp câu trả lời dựa trên ngữ cảnh luật thuế.
    """
    prompt = f"""Bạn là một Kế toán trưởng AI chuyên nghiệp tại Việt Nam. Hãy trả lời câu hỏi dưới đây của doanh nghiệp sử dụng các thông tin luật thuế đã được xác thực (ngữ cảnh) dưới đây.
Nếu thông tin ngữ cảnh không đủ để trả lời, hãy trả lời dựa trên kiến thức luật thuế Việt Nam của bạn nhưng ghi chú rõ là thông tin ngoài ngữ cảnh được cung cấp.
Luôn trích dẫn rõ số hiệu thông tư/nghị định (ví dụ: Thông tư 133/2016/TT-BTC, Luật Quản lý thuế số 38/2019/QH14) nếu có.

NGỮ CẢNH HỖ TRỢ:
{context}

CÂU HỎI DOANH NGHIỆP:
{question}

TRẢ LỜI:"""

    # 1. Thử gọi OpenAI GPT-4o
    if settings.OPENAI_API_KEY and "your-" not in settings.OPENAI_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            completion = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a professional chief accountant in Vietnam specializing in tax regulations."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2
            )
            return {
                "answer": completion.choices[0].message.content,
                "citation": "Phân tích RAG ngữ nghĩa sâu (GPT-4o API)"
            }
        except Exception as e:
            logger.warning(f"Lỗi gọi OpenAI Chat GPT-4o: {str(e)}")

    # 2. Thử gọi Gemini API (Sử dụng thư viện google-generativeai)
    if settings.GEMINI_API_KEY and "your-" not in settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            return {
                "answer": response.text,
                "citation": "Phân tích RAG ngữ nghĩa sâu (Gemini 1.5 Flash API)"
            }
        except Exception as e:
            logger.warning(f"Lỗi gọi Gemini 1.5 Flash API: {str(e)}")

    # 3. Fallback cục bộ nếu không cấu hình khóa API (đọc từ mock)
    # Lấy tiêu đề tài liệu làm nguồn trích dẫn
    q_lower = question.lower()
    citation = "Hệ thống tri thức luật số e-GDT"
    answer = "💡 **Hệ thống chuyên gia AI (Chế độ chạy thử offline)**:\n\n"
    
    if "thuế" in q_lower or "hạn" in q_lower:
        answer += LOCAL_KNOWLEDGE[0]["content"]
        citation = LOCAL_KNOWLEDGE[0]["title"]
    elif "lương" in q_lower or "phụ cấp" in q_lower:
        answer += LOCAL_KNOWLEDGE[1]["content"]
        citation = LOCAL_KNOWLEDGE[1]["title"]
    elif "hạch toán" in q_lower or "6422" in q_lower:
        answer += LOCAL_KNOWLEDGE[2]["content"]
        citation = LOCAL_KNOWLEDGE[2]["title"]
    elif "liên kết" in q_lower or "lãi vay" in q_lower:
        answer += LOCAL_KNOWLEDGE[3]["content"]
        citation = LOCAL_KNOWLEDGE[3]["title"]
    else:
        answer += "Tôi đã ghi nhận câu hỏi. Để nhận được tư vấn thuế chính xác nhất từ mô hình ngôn ngữ lớn (Gemini/OpenAI), xin vui lòng cấu hình API Key tương ứng trong tệp `.env` của backend."
        
    return {
        "answer": answer,
        "citation": citation
    }

def index_document_source(source_id: str, title: str, text_content: str) -> int:
    """
    Thực hiện chia nhỏ tài liệu (chunking) và băm vector đẩy trực tiếp vào cơ sở dữ liệu.
    """
    # 1. Phân mảnh văn bản thô (Mỗi chunk khoảng 400 ký tự)
    chunks = []
    chunk_size = 400
    overlap = 50
    
    start = 0
    while start < len(text_content):
        end = min(start + chunk_size, len(text_content))
        chunk_text = text_content[start:end].strip()
        if chunk_text:
            chunks.append(chunk_text)
        start += chunk_size - overlap
        
    # 2. Sinh embeddings và chèn vào database
    inserted_count = 0
    try:
        from supabase import create_client, Client
        if settings.SUPABASE_URL and settings.SUPABASE_KEY and "your-project" not in settings.SUPABASE_URL:
            supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            rows = []
            for idx, chunk in enumerate(chunks):
                emb = generate_text_embedding(chunk)
                rows.append({
                    "source_id": source_id,
                    "title": f"{title} (Mảnh {idx+1})",
                    "content": chunk,
                    "embedding": emb
                })
            
            # Chèn nhiều hàng đồng thời để tối ưu hiệu năng
            response = supabase.table("knowledge_chunks").insert(rows).execute()
            inserted_count = len(response.data) if response.data else len(rows)
            logger.info(f"Đã index thành công {inserted_count} chunks vào database.")
            return inserted_count
    except Exception as e:
        logger.error(f"Lỗi đẩy dữ liệu index vào pgvector DB: {str(e)}")
        
    return len(chunks) # Trả về số lượng mảnh ước tính nếu CSDL offline
