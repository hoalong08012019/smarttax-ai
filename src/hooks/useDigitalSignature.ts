import { useState, useCallback } from 'react';

// Security Configuration
const MOCK_DEVICE_PIN = '123456';
const MAX_PIN_ATTEMPTS = 3;

export interface CertificateInfo {
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
}

export interface SignatureStatus {
  isConnected: boolean;
  deviceName: string | null;
  method: 'USB_TOKEN' | 'SMART_CA';
  certInfo: CertificateInfo | null;
  isLocked: boolean;
  isBlocked: boolean;
  lastSignedAt: string | null;
}

export const useDigitalSignature = () => {
  const [status, setStatus] = useState<SignatureStatus>({
    isConnected: false,
    deviceName: null,
    method: 'USB_TOKEN',
    certInfo: null,
    isLocked: true,
    isBlocked: false,
    lastSignedAt: null
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinAttempts, setPinAttempts] = useState(0);
  const [showPinDialog, setShowPinDialog] = useState(false);

  const requestToken = useCallback(async (method: 'USB_TOKEN' | 'SMART_CA' = 'USB_TOKEN') => {
    if (status.isBlocked) {
      throw new Error('Thiết bị/Tài khoản đã bị khóa do bảo mật. Vui lòng liên hệ nhà cung cấp.');
    }
    
    setIsConnecting(true);
    await new Promise(resolve => setTimeout(resolve, method === 'USB_TOKEN' ? 1500 : 800));
    
    const mockCert: CertificateInfo = {
      subject: method === 'USB_TOKEN' ? 'CN=CÔNG TY TNHH VIỄN ĐÔNG' : 'CN=NGUYỄN VĂN LONG (SmartCA)',
      issuer: method === 'USB_TOKEN' ? 'VNPT-CA G2' : 'Viettel Remote CA',
      serialNumber: Math.random().toString(16).toUpperCase().substring(2, 14),
      validFrom: '01/01/2024',
      validTo: '01/01/2027'
    };
    
    setStatus(prev => ({
      ...prev,
      isConnected: true,
      method,
      deviceName: method === 'USB_TOKEN' ? 'VNPT-CA USB Token v2.0' : 'SmartCA (Cloud HSM)',
      certInfo: mockCert,
      isLocked: true
    }));
    
    setIsConnecting(false);
  }, [status.isBlocked]);

  const disconnectToken = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      isConnected: false,
      deviceName: null,
      certInfo: null,
      isLocked: true
    }));
  }, []);

  const verifyPinAndSign = useCallback(async (xmlContent: string) => {
    if (status.isBlocked) return;

    if (status.method === 'USB_TOKEN' && pinInput !== MOCK_DEVICE_PIN) {
      const newAttempts = pinAttempts + 1;
      setPinAttempts(newAttempts);
      if (newAttempts >= MAX_PIN_ATTEMPTS) {
        setStatus(prev => ({ ...prev, isBlocked: true, isConnected: false }));
        setShowPinDialog(false);
        throw new Error('Thiết bị đã bị khóa vĩnh viễn!');
      }
      throw new Error(`Mã PIN sai. Còn ${MAX_PIN_ATTEMPTS - newAttempts} lần thử.`);
    }

    setIsSigning(true);
    // Simulate complex RSA/ECDSA signing delay
    await new Promise(resolve => setTimeout(resolve, status.method === 'USB_TOKEN' ? 2500 : 4000));
    
    const signatureValue = Math.random().toString(36).substring(7).toUpperCase();
    
    setStatus(prev => ({
      ...prev,
      isLocked: false,
      lastSignedAt: new Date().toLocaleString('vi-VN')
    }));
    
    setIsSigning(false);
    setShowPinDialog(false);
    setPinInput('');
    
    // Return standard XAdES-BES structure (simulated)
    return `
<ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
  <ds:SignedInfo>
    <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
    <ds:Reference>
      <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
      <ds:DigestValue>${signatureValue}</ds:DigestValue>
    </ds:Reference>
  </ds:SignedInfo>
  <ds:SignatureValue>${signatureValue}==</ds:SignatureValue>
  <ds:KeyInfo>
    <ds:X509Data>
      <ds:X509Certificate>${status.certInfo?.serialNumber}</ds:X509Certificate>
    </ds:X509Data>
  </ds:KeyInfo>
</ds:Signature>
${xmlContent}`;
  }, [pinInput, pinAttempts, status.deviceName, status.isBlocked, status.method, status.certInfo]);

  const openPinDialog = useCallback(() => {
    if (!status.isConnected) return;
    if (status.isBlocked) return;
    setShowPinDialog(true);
  }, [status.isConnected, status.isBlocked]);

  return {
    ...status,
    isConnecting,
    isSigning,
    requestToken,
    disconnectToken,
    showPinDialog,
    setShowPinDialog,
    pinInput,
    setPinInput,
    openPinDialog,
    verifyPinAndSign,
    remainingAttempts: MAX_PIN_ATTEMPTS - pinAttempts
  };
};
