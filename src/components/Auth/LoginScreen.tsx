import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Building2, 
  Sparkles, 
  Usb, 
  RefreshCw, 
  ArrowRight, 
  Bot,
  X
} from 'lucide-react';
import { useDigitalSignature } from '../../hooks/useDigitalSignature';

interface LoginScreenProps {
  onLoginSuccess: (tenantId: string, role: 'SME' | 'HOUSEHOLD') => void;
  onAdminPortal: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onAdminPortal
}) => {
  const ds = useDigitalSignature();
  
  const [loginMode, setLoginMode] = useState<'SME' | 'HOUSEHOLD' | 'DIGITAL_SIGN'>('SME');
  const [taxCode, setTaxCode] = useState('0109876543');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Sync default tax code when mode switches
  useEffect(() => {
    if (loginMode === 'SME') {
      setTaxCode('0109876543');
    } else if (loginMode === 'HOUSEHOLD') {
      setTaxCode('0311223344');
    }
    setError(null);
  }, [loginMode]);

  // Handle traditional credential login
  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxCode.trim()) {
      setError('Vui lòng nhập Mã số thuế.');
      return;
    }
    setIsAuthenticating(true);
    setError(null);

    setTimeout(() => {
      setIsAuthenticating(false);
      if (loginMode === 'SME' && taxCode.trim() === '0109876543') {
        onLoginSuccess('t-001', 'SME');
      } else if (loginMode === 'HOUSEHOLD' && taxCode.trim() === '0311223344') {
        onLoginSuccess('t-002', 'HOUSEHOLD');
      } else {
        setError('Mã số thuế hoặc Mật khẩu không đúng cho phân hệ đã chọn.');
      }
    }, 1000);
  };

  // Handle Digital Signature Login
  const handleRequestToken = async (method: 'USB_TOKEN' | 'SMART_CA') => {
    try {
      setError(null);
      await ds.requestToken(method);
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Triggered when certificate is connected and ready to sign/verify PIN
  const handlePinSubmit = async () => {
    try {
      setError(null);
      // Verify Pin & simulated sign request to verify identity
      await ds.verifyPinAndSign('<AUTH_CHALLENGE>');
      
      // Determine tenant from cert details
      if (ds.certInfo?.subject.includes('VIỄN ĐÔNG')) {
        onLoginSuccess('t-001', 'SME');
      } else if (ds.certInfo?.subject.includes('LONG') || ds.certInfo?.subject.includes('SmartCA')) {
        onLoginSuccess('t-002', 'HOUSEHOLD');
      } else {
        setError('Chứng thư số hợp lệ nhưng không khớp với doanh nghiệp nào đăng ký trên hệ thống.');
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      backgroundColor: '#000000', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px', 
      backgroundImage: 'radial-gradient(circle at center, rgba(157,0,255,0.06) 0%, transparent 65%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* PIN VERIFICATION OVERLAY FOR DIGITAL SIGN LOGIN */}
      {ds.showPinDialog && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="content-card animate-fade-in" style={{ width: '100%', maxWidth: '380px', border: ds.remainingAttempts === 1 ? '1px solid #ff4444' : '1px solid var(--accent-purple)' }}>
            <div className="flex-row-between" style={{ marginBottom: '20px' }}>
              <div className="flex-row-center" style={{ gap: '10px' }}>
                <Lock size={18} color={ds.remainingAttempts === 1 ? '#ff4444' : 'var(--accent-purple)'} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Xác thực chữ ký số đăng nhập</h3>
              </div>
              <button onClick={() => ds.setShowPinDialog(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Thiết bị: <strong style={{ color: '#ffffff' }}>{ds.deviceName}</strong>
            </p>

            <div style={{ marginBottom: '16px' }}>
              <input 
                type="password" 
                value={ds.pinInput}
                onChange={(e) => ds.setPinInput(e.target.value)}
                placeholder="Nhập PIN thiết bị"
                style={{ width: '100%', padding: '12px', borderRadius: '6px', backgroundColor: '#000000', border: '1px solid var(--border-color)', color: ds.remainingAttempts === 1 ? '#ff4444' : '#d4a6ff', fontSize: '14px', textAlign: 'center', letterSpacing: '0.5em' }}
                autoFocus
              />
              <div className="flex-row-between" style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Gợi ý PIN: 123456</span>
                <span style={{ fontSize: '10px', color: ds.remainingAttempts === 1 ? '#ff4444' : 'var(--text-muted)', fontWeight: 700 }}>
                  Còn {ds.remainingAttempts} lần thử
                </span>
              </div>
            </div>

            {error && (
              <div style={{ padding: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,51,51,0.1)', border: '1px solid rgba(255,51,51,0.2)', fontSize: '11px', color: '#ff4444', marginBottom: '16px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button 
              onClick={handlePinSubmit}
              disabled={ds.isSigning || !ds.pinInput}
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '12px', backgroundColor: ds.remainingAttempts === 1 ? '#ff4444' : 'var(--accent-purple)' }}
            >
              {ds.isSigning ? <RefreshCw size={14} className="animate-spin" /> : <Unlock size={14} />}
              <span>{ds.isSigning ? 'Đang giải mã token...' : 'Mở khóa & Đăng nhập'}</span>
            </button>
          </div>
        </div>
      )}

      {/* LOGIN CARD */}
      <div style={{ 
        width: '100%', 
        maxWidth: '440px', 
        padding: '36px', 
        borderRadius: '20px', 
        backgroundColor: '#06070a', 
        border: '1px solid rgba(157,0,255,0.2)', 
        boxShadow: '0 20px 50px rgba(157,0,255,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }} className="animate-fade-in">
        
        {/* BRAND HEADER */}
        <div style={{ textAlign: 'center' }}>
          <div className="flex-row-center" style={{ gap: '10px', justifyContent: 'center', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(157,0,255,0.5)' }}>
              <Bot size={22} color="#ffffff" />
            </div>
            <span style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em' }}>
              Smart<span style={{ color: 'var(--accent-purple)' }}>Tax</span> AI
            </span>
          </div>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Cổng Đăng Nhập Doanh Nghiệp & Hộ Kinh Doanh</h2>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Trợ lý AI chuyên nghiệp tự động hóa báo cáo & quyết toán thuế</p>
        </div>

        {/* MODE SWITCHER TABS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={() => setLoginMode('SME')}
            style={{ 
              padding: '8px 4px', 
              borderRadius: '6px', 
              border: 'none', 
              backgroundColor: loginMode === 'SME' ? 'rgba(157,0,255,0.15)' : 'transparent',
              color: loginMode === 'SME' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: loginMode === 'SME' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderBottom: loginMode === 'SME' ? '1px solid var(--accent-purple)' : 'none'
            }}
          >
            Doanh nghiệp (SME)
          </button>
          <button 
            onClick={() => setLoginMode('HOUSEHOLD')}
            style={{ 
              padding: '8px 4px', 
              borderRadius: '6px', 
              border: 'none', 
              backgroundColor: loginMode === 'HOUSEHOLD' ? 'rgba(157,0,255,0.15)' : 'transparent',
              color: loginMode === 'HOUSEHOLD' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: loginMode === 'HOUSEHOLD' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderBottom: loginMode === 'HOUSEHOLD' ? '1px solid var(--accent-purple)' : 'none'
            }}
          >
            Hộ kinh doanh
          </button>
          <button 
            onClick={() => setLoginMode('DIGITAL_SIGN')}
            style={{ 
              padding: '8px 4px', 
              borderRadius: '6px', 
              border: 'none', 
              backgroundColor: loginMode === 'DIGITAL_SIGN' ? 'rgba(157,0,255,0.15)' : 'transparent',
              color: loginMode === 'DIGITAL_SIGN' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: loginMode === 'DIGITAL_SIGN' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderBottom: loginMode === 'DIGITAL_SIGN' ? '1px solid var(--accent-purple)' : 'none'
            }}
          >
            Ký số (SmartCA)
          </button>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="animate-fade-in" style={{ padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.2)', fontSize: '11px', color: '#ff4444', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* CONDITIONAL FORMS */}
        {loginMode !== 'DIGITAL_SIGN' ? (
          <form onSubmit={handleCredentialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 700 }} className="font-mono">
                MÃ SỐ THUẾ ĐĂNG NHẬP:
              </label>
              <div style={{ position: 'relative' }}>
                <Building2 size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input 
                  type="text"
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  placeholder="Nhập 10 chữ số mã số thuế"
                  style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '6px', backgroundColor: '#000000', border: '1px solid var(--border-color)', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                Tài khoản demo: <strong style={{ color: '#ffffff' }}>{loginMode === 'SME' ? '0109876543 (Viễn Đông)' : '0311223344 (Horizon)'}</strong>
              </span>
            </div>

            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 700 }} className="font-mono">
                MẬT KHẨU TRUY CẬP:
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '6px', backgroundColor: '#000000', border: '1px solid var(--border-color)', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isAuthenticating}
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '13px', marginTop: '8px' }}
            >
              {isAuthenticating ? <RefreshCw size={14} className="animate-spin" /> : <Unlock size={14} />}
              <span>{isAuthenticating ? 'Đang xác thực thông tin...' : 'Đăng Nhập Nền Tảng'}</span>
            </button>
          </form>
        ) : (
          /* DIGITAL SIGNATURE INSTANT LOGIN CARD */
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
              Vui lòng kết nối thiết bị ký số USB Token của bạn hoặc khởi động Session Remote CA để thực hiện đăng nhập nhanh không cần mật khẩu.
            </p>

            {ds.isConnected ? (
              <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(157,0,255,0.2)', marginBottom: '4px' }}>
                <div style={{ marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>CHỨNG THƯ ĐỌC ĐƯỢC:</span>
                  <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 700 }}>{ds.certInfo?.subject}</span>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Cấp bởi: {ds.certInfo?.issuer}</span>
                
                <button 
                  onClick={ds.openPinDialog}
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '12px', marginTop: '12px' }}
                >
                  <Unlock size={12} />
                  <span>Xác thực mã PIN để Đăng nhập</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={() => handleRequestToken('USB_TOKEN')}
                  disabled={ds.isConnecting}
                  className="btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '12px' }}
                >
                  {ds.isConnecting ? <RefreshCw size={12} className="animate-spin" /> : <Usb size={12} />}
                  <span>Đọc thông tin từ USB Token</span>
                </button>
                <button 
                  onClick={() => handleRequestToken('SMART_CA')}
                  disabled={ds.isConnecting}
                  className="btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '12px', borderColor: 'rgba(157,0,255,0.2)' }}
                >
                  {ds.isConnecting ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} color="#d4a6ff" />}
                  <span style={{ color: '#d4a6ff' }}>Đọc thông tin qua SmartCA Session</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM REDIRECT TO ADMIN PORTAL */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Mã hóa kết nối SSL 256-bit</span>
          <button 
            onClick={onAdminPortal}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-purple)', 
              cursor: 'pointer', 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              padding: 0
            }}
          >
            <span>Cổng Quản Trị (Admin)</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
