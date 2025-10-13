import React, { createContext, useContext, useEffect, useState } from 'react';

interface DeviceInfo {
  browser: string;
  os: string;
  device: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
}

interface DeviceContextType {
  deviceId: string | null;
  deviceInfo: DeviceInfo | null;
  isLoading: boolean;
}

const DeviceContext = createContext<DeviceContextType>({
  deviceId: null,
  deviceInfo: null,
  isLoading: true,
});

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};

// Simple device fingerprinting function
const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.platform,
    navigator.cookieEnabled,
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

const getDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent;
  
  // Simple browser detection
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  // Simple OS detection
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  // Simple device detection
  let device = 'Desktop';
  if (/Mobi|Android/i.test(userAgent)) device = 'Mobile';
  else if (/Tablet|iPad/i.test(userAgent)) device = 'Tablet';
  
  return {
    browser,
    os,
    device,
    userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
  };
};

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDevice = async () => {
      try {
        // Check if device ID is already stored
        let storedDeviceId = localStorage.getItem('deviceId');
        
        if (!storedDeviceId) {
          // Generate new device fingerprint
          storedDeviceId = generateDeviceFingerprint();
          localStorage.setItem('deviceId', storedDeviceId);
        }
        
        const info = getDeviceInfo();
        
        setDeviceId(storedDeviceId);
        setDeviceInfo(info);
      } catch (error) {
        console.error('Error initializing device:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDevice();
  }, []);

  return (
    <DeviceContext.Provider value={{ deviceId, deviceInfo, isLoading }}>
      {children}
    </DeviceContext.Provider>
  );
};