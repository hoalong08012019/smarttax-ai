export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://zdfutrckmadorhrmzsaz.supabase.co";
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-supabase-anon-key";

export interface AuthSession {
  token: string;
  tenantId: string;
  role: "SME" | "HOUSEHOLD";
  email: string;
}

/**
 * Kiểm tra xem cấu hình Supabase đã được điền thật chưa.
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    !!SUPABASE_URL &&
    !!SUPABASE_KEY &&
    !SUPABASE_URL.includes("your-project") &&
    !SUPABASE_KEY.includes("your-supabase-anon-key")
  );
};

/**
 * Hàm chuyển đổi mã số thuế thành email đăng nhập Supabase nếu cần.
 */
const resolveEmail = (taxCodeOrEmail: string): string => {
  const trimmed = taxCodeOrEmail.trim();
  if (trimmed.includes("@")) {
    return trimmed;
  }
  // Tự động chuyển đổi MST thành email ảo của SmartTax
  return `${trimmed}@smarttax.vn`;
};

/**
 * Đăng nhập qua REST API của Supabase Auth (không dùng npm library).
 */
export const supabaseSignIn = async (
  taxCodeOrEmail: string,
  password: string
): Promise<AuthSession> => {
  const email = resolveEmail(taxCodeOrEmail);
  if (!isSupabaseConfigured()) {
    throw new Error('Dịch vụ xác thực chưa được cấu hình.');
  }

  // 2. Gọi Supabase Auth REST API thật
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error_description || errorData.message || "Xác thực với Supabase thất bại.");
    }

    const authData = await response.json();
    const accessToken = authData.access_token;
    const userId = authData.user.id;

    // Lấy thông tin user profile từ bảng `users` để tìm tenant_id và role tương ứng
    const userProfileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=tenant_id,role`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!userProfileRes.ok) {
      throw new Error("Không thể lấy thông tin định danh Tenant cho người dùng.");
    }

    const profiles = await userProfileRes.json();
    if (!profiles || profiles.length === 0) {
      throw new Error("Người dùng chưa được thiết lập tài khoản doanh nghiệp trong CSDL.");
    }

    const profile = profiles[0];
    const role: "SME" | "HOUSEHOLD" = profile.role === "HOUSEHOLD" ? "HOUSEHOLD" : "SME";

    return {
      token: accessToken,
      tenantId: profile.tenant_id,
      role: role,
      email: authData.user.email || email,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Không thể kết nối đến máy chủ xác thực.";
    throw new Error(errorMessage, { cause: error });
  }
};

/**
 * Đăng ký tài khoản mới trực tiếp qua Supabase Auth REST API
 */
export const supabaseSignUp = async (
  taxCodeOrEmail: string,
  password: string,
  companyName: string,
  role: "SME" | "HOUSEHOLD"
): Promise<{ success: boolean; message: string }> => {
  const email = resolveEmail(taxCodeOrEmail);

  if (!isSupabaseConfigured()) {
    throw new Error('Dịch vụ xác thực chưa được cấu hình.');
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
      },
      body: JSON.stringify({ email, password, data: { company_name: companyName, requested_role: role } }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || errorData.message || "Đăng ký tài khoản mới thất bại.");
    }


    return {
      success: true,
      message: "Yêu cầu đăng ký đã được tiếp nhận. Xác nhận email và cấp quyền doanh nghiệp cần được hoàn tất trước khi đăng nhập.",
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Lỗi đăng ký tài khoản.";
    throw new Error(errorMessage, { cause: error });
  }
};

/**
 * Đăng xuất khỏi hệ thống
 */
export const supabaseSignOut = async (token: string): Promise<void> => {
  if (!isSupabaseConfigured() || token.startsWith("u-")) {
    return;
  }

  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {
    console.warn("Lỗi đăng xuất Supabase REST:", e);
  }
};
