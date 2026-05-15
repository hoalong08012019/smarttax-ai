import { useState, useCallback } from 'react';

export interface SignatureStatus {
  isConnected: boolean;
  deviceName: string | null;
  isLocked: boolean;
  lastSignedAt: string | null;
}

export const useDigitalSignature = () => {
  const [status, setStatus] = useState<SignatureStatus>({
    isConnected: false,
    deviceName: null,
    isLocked: true,
    lastSignedAt: null
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinDialog, setShowPinDialog] = useState(false);

  // Simulate WebHID Device Request
  const requestToken = useCallback(async () => {
    setIsConnecting(true);
    
    // Simulating hardware latency
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
  }, []);

  const disconnectToken = useCallback(() => {
    setStatus({
      isConnected: false,
      deviceName: null,
      isLocked: true,
      lastSignedAt: status.lastSignedAt
    });
  }, [status.lastSignedAt]);

  const openPinDialog = useCallback(() => {
    if (!status.isConnected) return;
    setShowPinDialog(true);
  }, [status.isConnected]);

  const verifyPinAndSign = useCallback(async (xmlContent: string) => {
    if (pinInput !== '123456') { // Mock PIN
      throw new Error('Mã PIN không chính xác. Vui lòng thử lại.');
    }

    setIsSigning(true);
    
    // Simulate cryptographic signing delay (hash + sign)
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
    
    // In a real app, this would return the signed XML string
    // wrapped in <Signature> tags according to XAdES-BES standard
    return `<!-- Signed by ${status.deviceName} at ${timestamp} -->\n${xmlContent}`;
  }, [pinInput, status.deviceName]);

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
    verifyPinAndSign
  };
};
