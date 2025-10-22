import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/apiClient';

interface Device {
  id: string;
  deviceIdentifier: string;
  deviceInfo: {
    userAgent?: string;
    platform?: string;
    language?: string;
  };
  lastLogin: string;
  isCurrentDevice: boolean;
}

interface DeviceSecurityProps {
  onDeviceRegistered?: () => void;
}

const DeviceSecurity: React.FC<DeviceSecurityProps> = ({ onDeviceRegistered }) => {
  const { user, auth0User, isAuthenticated } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate device identifier
  const generateDeviceIdentifier = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = canvas.toDataURL();
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    
    return btoa(`${fingerprint}-${userAgent}-${platform}-${language}`).substring(0, 32);
  };

  // Get device info
  const getDeviceInfo = () => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  // Register device on login
  const registerDevice = async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);

    try {
      const deviceIdentifier = generateDeviceIdentifier();
      const deviceInfo = getDeviceInfo();

      const response = await apiClient.post('/auth/login', {
        deviceIdentifier,
        deviceInfo,
        auth0UserData: {
          auth0Id: auth0User?.sub || '',
          email: auth0User?.email,
          name: auth0User?.name,
          picture: auth0User?.picture
        }
      });

      if (response.data.user) {
        onDeviceRegistered?.();
      }
    } catch (err: any) {
      if (err.response?.data?.code === 'DEVICE_LIMIT_EXCEEDED') {
        setError('تم الوصول إلى الحد الأقصى للأجهزة المسموحة (جهازين). تم قفل حسابك لأسباب أمنية.');
      } else if (err.response?.data?.code === 'ACCOUNT_DISABLED') {
        setError('تم تعطيل حسابك بسبب انتهاك أمني. يرجى التواصل مع الدعم الفني.');
      } else {
        setError('حدث خطأ أثناء تسجيل الجهاز');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load user devices
  const loadDevices = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await apiClient.get('/auth/devices', {
        data: { currentDeviceId: generateDeviceIdentifier() }
      });
      setDevices(response.data.devices);
    } catch (err) {
      console.error('Error loading devices:', err);
    }
  };

  // Remove device
  const removeDevice = async (deviceId: string) => {
    try {
      await apiClient.delete(`/auth/devices/${deviceId}`);
      await loadDevices();
    } catch (err) {
      setError('حدث خطأ أثناء حذف الجهاز');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      registerDevice();
      loadDevices();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4">
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-bold text-red-600">تحذير أمني</h3>
          </div>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span>جاري التحقق من الجهاز...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <h3 className="text-lg font-bold text-gray-900">أمان الأجهزة</h3>
      </div>

      <p className="text-gray-600 mb-4">
        يمكنك الوصول إلى حسابك من جهازين فقط كحد أقصى لضمان الأمان.
      </p>

      <div className="space-y-3">
        {devices.map((device) => (
          <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${device.isCurrentDevice ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <div>
                <div className="font-medium text-gray-900">
                  {device.deviceInfo.platform || 'جهاز غير معروف'}
                  {device.isCurrentDevice && <span className="text-green-600 text-sm mr-2">(الجهاز الحالي)</span>}
                </div>
                <div className="text-sm text-gray-500">
                  آخر دخول: {new Date(device.lastLogin).toLocaleDateString('ar-SA')}
                </div>
              </div>
            </div>
            {!device.isCurrentDevice && (
              <button
                onClick={() => removeDevice(device.id)}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
              >
                حذف
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-blue-800">
            الأجهزة المستخدمة: {devices.length}/2
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeviceSecurity;