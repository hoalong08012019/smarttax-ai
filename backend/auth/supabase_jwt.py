import jwt
import logging
from fastapi import Header, HTTPException, Depends
from typing import Optional
from config import settings

logger = logging.getLogger(__name__)

# CSDL cục bộ giả lập để ánh xạ nhanh User ID sang Tenant ID khi chạy offline
MOCK_USER_TENANT_MAP = {
    "u-sme-001": "t-001",
    "u-hkd-002": "t-002"
}

def get_current_tenant_id(
    authorization: Optional[str] = Header(None),
    x_test_tenant: Optional[str] = Header(None)
) -> str:
    """
    FastAPI Dependency: Trích xuất và xác thực token JWT của Supabase Auth từ HTTP Header.
    Từ đó, tìm kiếm tenant_id (mã định danh doanh nghiệp) tương ứng của người dùng.
    Hỗ trợ chế độ chạy thử nghiệm offline (Fallback).
    """
    # 1. Kiểm tra header chạy thử nghiệm thủ công (ưu tiên khi chạy offline)
    if x_test_tenant:
        logger.info(f"Auth: Sử dụng Test Tenant ID từ Header: {x_test_tenant}")
        return x_test_tenant

    if not authorization:
        # Nếu hoàn toàn không có header xác thực và đang chạy offline, mặc định trả về t-001 (SME)
        logger.warning("Auth: Không tìm thấy Authorization Header. Mặc định trả về tenant 't-001' (Chế độ demo offline).")
        return "t-001"

    token = ""
    try:
        # Tách chuỗi Bearer <token>
        if authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
        else:
            token = authorization
    except Exception:
        logger.warning("Auth: Định dạng Authorization Header sai. Mặc định trả về tenant 't-001'.")
        return "t-001"

    # 2. Thử giải mã chữ ký JWT thực tế bằng Supabase JWT Secret
    try:
        # Khóa bí mật dùng để xác thực chữ ký Supabase JWT
        # Nếu người dùng chưa cấu hình SECRET_KEY thật, ta sẽ bắt lỗi và sang fallback
        jwt_secret = settings.SECRET_KEY
        if not jwt_secret or jwt_secret == "super-secret-key-smarttax-2026":
            raise jwt.InvalidSignatureError("Chưa cấu hình Supabase JWT Secret thật.")
            
        payload = jwt.decode(
            token, 
            jwt_secret, 
            algorithms=["HS256"], 
            options={"verify_aud": True},
            audience="authenticated"
        )
        user_uuid = payload.get("sub")
        if not user_uuid:
            raise HTTPException(status_code=401, detail="Token không chứa mã định danh người dùng sub.")

        # Truy vấn Supabase DB tìm tenant_id
        from supabase import create_client, Client
        if settings.SUPABASE_URL and settings.SUPABASE_KEY and "your-project" not in settings.SUPABASE_URL:
            supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            res = supabase.table("users").select("tenant_id").eq("id", user_uuid).execute()
            if res.data and len(res.data) > 0:
                tenant_id = res.data[0]["tenant_id"]
                logger.info(f"Auth: Đăng nhập thực tế thành công. User={user_uuid} -> Tenant={tenant_id}")
                return str(tenant_id)

        # Fallback đối chiếu với bảng mock nếu Supabase URL rỗng
        if user_uuid in MOCK_USER_TENANT_MAP:
            return MOCK_USER_TENANT_MAP[user_uuid]
            
        # Nếu giải mã thành công nhưng không có tenant liên kết, mặc định trả về t-001
        return "t-001"

    except Exception as e:
        logger.warning(f"Auth: Xác thực JWT thất bại ({str(e)}). Chuyển sang chế độ xác thực cục bộ (Offline).")
        
        # Mô phỏng: Nếu token khớp với User ID chạy thử, trả về Tenant tương ứng
        if token in MOCK_USER_TENANT_MAP:
            return MOCK_USER_TENANT_MAP[token]
            
        return "t-001"
