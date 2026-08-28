export interface DetectedDeviceInfo {
  friendlyName: string;
  browser: string;
  os: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  screenResolution: string;
  userAgent: string;
}

export function detectDevice(): DetectedDeviceInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      friendlyName: 'Unknown Device',
      browser: 'Unknown Browser',
      os: 'Unknown OS',
      deviceType: 'Desktop',
      screenResolution: 'N/A',
      userAgent: '',
    };
  }

  const ua = navigator.userAgent;
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';

  // 1. Detect OS
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    os = /iPad/.test(ua) || navigator.maxTouchPoints > 1 ? 'iPadOS' : 'iOS';
    deviceType = os === 'iPadOS' ? 'Tablet' : 'Mobile';
  } else if (/Android/.test(ua)) {
    os = 'Android';
    deviceType = /Tablet|Silk|Kindle/i.test(ua) || window.innerWidth >= 768 ? 'Tablet' : 'Mobile';
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    os = 'macOS';
    deviceType = 'Desktop';
  } else if (/Windows NT 10.0/.test(ua)) {
    os = 'Windows 10/11';
    deviceType = 'Desktop';
  } else if (/Windows/.test(ua)) {
    os = 'Windows';
    deviceType = 'Desktop';
  } else if (/CrOS/.test(ua)) {
    os = 'Chrome OS';
    deviceType = 'Desktop';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
    deviceType = 'Desktop';
  }

  // 2. Detect Browser
  if (/Edg\//.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/OPR\/|Opera\//.test(ua)) {
    browser = 'Opera';
  } else if (/SamsungBrowser/.test(ua)) {
    browser = 'Samsung Internet';
  } else if (/Firefox\//.test(ua)) {
    browser = 'Firefox';
  } else if (/Chrome\//.test(ua) && !/Chromium\//.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) {
    browser = 'Safari';
  } else {
    browser = 'Web Browser';
  }

  // Refine mobile detection if window width is narrow
  if (deviceType === 'Desktop' && window.innerWidth <= 640 && navigator.maxTouchPoints > 0) {
    deviceType = 'Mobile';
  }

  const screenResolution = `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`;
  const friendlyName = `${browser} on ${os} (${deviceType})`;

  return {
    friendlyName,
    browser,
    os,
    deviceType,
    screenResolution,
    userAgent: ua,
  };
}
