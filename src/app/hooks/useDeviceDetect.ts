'use client';

import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  deviceType: DeviceType;
}

interface WindowWithOperaMini extends Window {
  opera?: unknown;
  MSStream?: unknown;
}

export function useDeviceDetect(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isIOS: false,
    isAndroid: false,
    deviceType: 'unknown',
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent || navigator.vendor || ((window as WindowWithOperaMini).opera as string || '');
    
    // Check for iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as WindowWithOperaMini).MSStream;
    
    // Check for Android devices
    const isAndroid = /android/i.test(userAgent);
    
    // Check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Determine if tablet based on screen size
    const isTablet = 
      (isMobile && window.innerWidth >= 768 && window.innerWidth <= 1024) ||
      /iPad/i.test(userAgent);
    
    // Desktop is anything that's not mobile or tablet
    const isDesktop = !isMobile && !isTablet;
    
    // Determine device type
    let deviceType: DeviceType = 'unknown';
    if (isDesktop) deviceType = 'desktop';
    else if (isTablet) deviceType = 'tablet';
    else if (isMobile) deviceType = 'mobile';

    setDeviceInfo({
      isMobile,
      isTablet,
      isDesktop,
      isIOS,
      isAndroid,
      deviceType,
    });
  }, []);

  return deviceInfo;
}
