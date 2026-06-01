export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
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
  const taxCode = email.split("@")[0];

  // 1. Chế độ Mock Fallback khi offline hoặc chưa cấu hình
  if (!isSupabaseConfigured()) {
    console.warn("Supabase Auth: Chạy chế độ Mock offline.");
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (taxCode === "0109876543" && password === "123456") {
          resolve({
            token: "u-sme-001",
            tenantId: "t-001",
            role: "SME",
            email: email,
          });
        } else if (taxCode === "0311223344" && password === "123456") {
          resolve({
            token: "u-hkd-002",
            tenantId: "t-002",
            role: "HOUSEHOLD",
            email: email,
          });
        } else {
          reject(new Error("Mã số thuế hoặc Mật khẩu giả định không chính xác (Mẫu: 0109876543/0311223344 mật khẩu 123456)."));
        }
      }, 800);
    });
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
  } catch (error: any) {
    console.error("Supabase Auth Error, falling back to mock: ", error);
    // Hỗ trợ dự phòng chạy demo nếu lỗi kết nối mạng tới Supabase
    if (taxCode === "0109876543" && password === "123456") {
      return {
        token: "u-sme-001",
        tenantId: "t-001",
        role: "SME",
        email: email,
      };
    } else if (taxCode === "0311223344" && password === "123456") {
      return {
        token: "u-hkd-002",
        tenantId: "t-002",
        role: "HOUSEHOLD",
        email: email,
      };
    }
    throw new Error(error.message || "Không thể kết nối đến máy chủ xác thực.");
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
    return {
      success: true,
      message: "Đăng ký thành công (Chế độ Mock Offline).",
    };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || errorData.message || "Đăng ký tài khoản mới thất bại.");
    }

    const signUpData = await response.json();
    const userId = signUpData.id || (signUpData.user && signUpData.user.id);

    if (userId) {
      // Tự động tạo Tenant & User profile liên kết bằng Service-Role hoặc thông qua Client API nếu cấu hình cho phép.
      // Do Supabase RLS giới hạn tạo thẳng từ client vô danh, việc liên kết tenant thường được thực hiện qua Database Trigger
      // khi có bản ghi auth.users mới. Tuy nhiên, chúng ta gửi thêm bản ghi qua REST API nếu không có RLS chặn tạo.
      try {
        // Tạo tenant
        const tenantRes = await fetch(`${SUPABASE_URL}/rest/v1/tenants`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            tax_code: email.split("@")[0],
            company_name: companyName,
            accounting_regime: role === "SME" ? "TT133" : "TT88",
          }),
        });

        if (tenantRes.ok) {
          const tenants = await tenantRes.json();
          const tenantId = tenants[0]?.id;
          
          if (tenantId) {
            // Tạo user profile tương ứng
            await fetch(`${SUPABASE_URL}/rest/v1/users`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: SUPABASE_KEY,
              },
              body: JSON.stringify({
                id: userId,
                email: email,
                role: role === "HOUSEHOLD" ? "HOUSEHOLD" : "OWNER",
                tenant_id: tenantId,
              }),
            });
          }
        }
      } catch (err) {
        console.warn("Không thể tự động tạo Tenant profile. Kỳ vọng Trigger DB sẽ xử lý.", err);
      }
    }

    return {
      success: true,
      message: "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản nếu có yêu cầu.",
    };
  } catch (error: any) {
    throw new Error(error.message || "Lỗi đăng ký tài khoản.");
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
