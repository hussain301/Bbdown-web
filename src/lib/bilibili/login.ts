import { getProxyUrl } from './proxy';

export async function generateWebQR(): Promise<{ url: string; qrcodeKey: string }> {
  // Use dedicated login endpoint on worker (not generic proxy)
  const proxy = getProxyUrl();
  const response = await fetch(`${proxy}/api/login/web/qr/generate`);
  const res = await response.json();
  if (res.code === 0) {
    return {
      url: res.data.url,
      qrcodeKey: res.data.qrcode_key
    };
  }
  throw new Error(`Failed to generate QR: ${res.message}`);
}

export async function pollWebLogin(qrcodeKey: string): Promise<{
  status: 'waiting' | 'scanned' | 'confirmed' | 'expired';
  cookie?: string;
}> {
  const proxy = getProxyUrl();
  const response = await fetch(`${proxy}/api/login/web/qr/poll?qrcode_key=${qrcodeKey}`);
  const res = await response.json();
  if (res.code === 0) {
    const code = res.data.code;
    if (code === 86101) return { status: 'waiting' };
    if (code === 86090) return { status: 'scanned' };
    if (code === 86038) return { status: 'expired' };
    if (code === 0) {
      return { status: 'confirmed', cookie: res.data.url }; 
    }
  }
  return { status: 'waiting' };
}

export async function generateTvQR(): Promise<{ url: string; authCode: string }> {
  const proxy = getProxyUrl();
  const response = await fetch(`${proxy}/api/login/tv/qr/generate`);
  const res = await response.json();

  if (res.code === 0) {
      return {
          url: res.data.url,
          authCode: res.data.auth_code
      };
  }
  throw new Error(`TV QR Error: ${res.message}`);
}

export async function pollTvLogin(authCode: string): Promise<{
  status: 'waiting' | 'scanned' | 'confirmed' | 'expired';
  accessToken?: string;
}> {
  const proxy = getProxyUrl();
  const response = await fetch(`${proxy}/api/login/tv/qr/poll?auth_code=${authCode}`);
  const res = await response.json();

  if (res.code === 0) {
      return {
          status: 'confirmed',
          accessToken: res.data.access_token
      };
  } else if (res.code === 86039) {
      return { status: 'waiting' };
  } else if (res.code === 86090) {
      return { status: 'scanned' };
  } else if (res.code === 86038) {
      return { status: 'expired' };
  }

  return { status: 'waiting' };
}

export async function checkLoginStatus(cookie?: string): Promise<{
  isLoggedIn: boolean;
  username?: string;
  isVip?: boolean;
  vipLabel?: string;
}> {
  if (!cookie) return { isLoggedIn: false };
  const proxy = getProxyUrl();
  const response = await fetch(`${proxy}/api/user/nav`, {
    headers: { 'X-Cookie': cookie }
  });
  const res = await response.json();
  
  if (res.code === 0 && res.data.isLogin) {
      return {
          isLoggedIn: true,
          username: res.data.uname,
          isVip: res.data.vipStatus === 1,
          vipLabel: res.data.vip_label?.text
      };
  }
  return { isLoggedIn: false };
}
