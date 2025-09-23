import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}

export const useDevice = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1024,
        screenHeight: 768,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      screenWidth: width,
      screenHeight: height,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        screenWidth: width,
        screenHeight: height,
      });
    };

    window.addEventListener('resize', handleResize);

    // 초기 실행
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceInfo;
};

// 모바일 전용 훅
export const useIsMobile = (): boolean => {
  const { isMobile } = useDevice();
  return isMobile;
};

// 데스크탑 전용 훅
export const useIsDesktop = (): boolean => {
  const { isDesktop } = useDevice();
  return isDesktop;
};
