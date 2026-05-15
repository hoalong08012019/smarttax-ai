import { useState, useCallback } from 'react';

// Security Configuration
const MOCK_DEVICE_PIN = '123456';
const MAX_PIN_ATTEMPTS = 3;

export interface SignatureStatus {
  isConnected: boolean;
  deviceName: string | null;
  isLocked: boolean;
  isBlocked: boolean; // For security lockout
  lastSignedAt: string | null;
}

export const useDigitalSignature = () => {
  const [status, setStatus] = useState<SignatureStatus>({
    isConnected: false,
    deviceName: null,
    isLocked: true,
    isBlocked: false,
    lastSignedAt: null
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinAttempts, setPinAttempts] = useState(0);
  const [showPinDialog, setShowPinDialog] = useState(false);

  // Simulate WebHID Device Request
  const requestToken = useCallback(async () => {
    if (status.isBlocked) {
      throw new Error('Thiết bị đã bị khóa do nhập sai mã PIN quá nhiều lần. Vui lòng liên hệ nhà cung cấp CA.');
    }
    
    setIsConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockDevices = [
      { name: 'VNPT-CA USB Token (PKCS#11)', vendorId: 0x1234 },
      { name: 'Viettel-CA v2 Token', vendorId: 0x5678 },
      { name: 'FPT-CA Smart Device', vendorId: 0x90AB }
    ];
    
    const randomDevice = mockDevices[Math.floor(Math.random() * mockDevices.length)];
    
    setStatus(prev => ({
      ...prev,
      isConnected: true,
      deviceName: randomDevice.name,
      isLocked: true
    }));
    
    setIsConnecting(false);
    return randomDevice.name;
  }, [status.isBlocked]);

  const disconnectToken = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      isConnected: false,
      deviceName: null,
      isLocked: true,
      // Persist lastSignedAt for session visibility
    }));
  }, []);

  const openPinDialog = useCallback(() => {
    if (!status.isConnected) return;
    if (status.isBlocked) return;
    setShowPinDialog(true);
  }, [status.isConnected, status.isBlocked]);

  const verifyPinAndSign = useCallback(async (xmlContent: string) => {
    if (status.isBlocked) return;

    if (pinInput !== MOCK_DEVICE_PIN) {
      const newAttempts = pinAttempts + 1;
      setPinAttempts(newAttempts);
      
      if (newAttempts >= MAX_PIN_ATTEMPTS) {
        setStatus(prev => ({ ...prev, isBlocked: true, isConnected: false }));
        setShowPinDialog(false);
        throw new Error('CẢNH BÁO BẢO MẬT: Thiết bị đã bị khóa vĩnh viễn do nhập sai PIN 3 lần!');
      }
      
      throw new Error(`Mã PIN không chính xác. Bạn còn ${MAX_PIN_ATTEMPTS - newAttempts} lần thử.`);
    }

    setIsSigning(true);
    setPinAttempts(0); // Reset on success
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const timestamp = new Date().toLocaleString('vi-VN');
    
    setStatus(prev => ({
      ...prev,
      isLocked: false,
      lastSignedAt: timestamp
    }));
    
    setIsSigning(false);
    setShowPinDialog(false);
    setPinInput('');
    
    return `<!-- Signed by ${status.deviceName} at ${timestamp} -->\n${xmlContent}`;
  }, [pinInput, pinAttempts, status.deviceName, status.isBlocked]);

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
