import { proxyFetch } from './proxy';
import { generateTvLoginParams, tvSign } from './signing';

export async function generateWebQR(): Promise<{ url: string; qrcodeKey: string }> {
  const res = await proxyFetch('https://passport.bilibili.com/x/passport-login/web/qrcode/generate');
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
  const res = await proxyFetch(`https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${qrcodeKey}`);
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
  const params = generateTvLoginParams();
  params.local_id = '0';
  const query = tvSign(params);
  
  const res = await proxyFetch(`https://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code`, {
      method: 'POST',
      body: query
  });

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
  const params = generateTvLoginParams();
  params.auth_code = authCode;
  params.local_id = '0';
  const query = tvSign(params);

  const res = await proxyFetch(`https://passport.bilibili.com/x/passport-tv-login/qrcode/poll`, {
      method: 'POST',
      body: query
  });

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
  const res = await proxyFetch('https://api.bilibili.com/x/web-interface/nav', { cookie });
  
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
