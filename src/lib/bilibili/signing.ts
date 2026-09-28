import { md5 } from 'js-md5';
import { proxyFetch } from './proxy';

const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
  61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
  36, 20, 34, 44, 52
];

export async function getWbiKeys(cookie?: string): Promise<{imgKey: string, subKey: string}> {
  try {
    const res = await proxyFetch('https://api.bilibili.com/x/web-interface/nav', { cookie });
    if (res?.data?.wbi_img) {
      const imgUrl = res.data.wbi_img.img_url;
      const subUrl = res.data.wbi_img.sub_url;
      const imgKey = imgUrl.substring(imgUrl.lastIndexOf('/') + 1, imgUrl.lastIndexOf('.'));
      const subKey = subUrl.substring(subUrl.lastIndexOf('/') + 1, subUrl.lastIndexOf('.'));
      return { imgKey, subKey };
    }
  } catch (e) {
    console.error('Failed to get wbi keys:', e);
  }
  return { imgKey: '', subKey: '' };
}

export function getMixinKey(imgKey: string, subKey: string): string {
  const orig = imgKey + subKey;
  let temp = '';
  for (let i = 0; i < mixinKeyEncTab.length; i++) {
    if (mixinKeyEncTab[i] < orig.length) {
      temp += orig.charAt(mixinKeyEncTab[i]);
    }
  }
  return temp.substring(0, 32);
}

export function wbiSign(params: Record<string, string>, mixinKey: string): string {
  const keys = Object.keys(params).sort();
  const searchParams = new URLSearchParams();
  for (const k of keys) {
    searchParams.set(k, params[k]);
  }
  searchParams.set('wts', Math.round(Date.now() / 1000).toString());
  const query = searchParams.toString();
  const w_rid = md5(query + mixinKey);
  return query + '&w_rid=' + w_rid;
}

const TV_APPKEY = '4409e2ce8ffd12b8';
const TV_SECRET = '59b43e04ad6965f34319062b478f83dd';

export function tvSign(params: Record<string, string>): string {
  if (!params.appkey) params.appkey = TV_APPKEY;
  const keys = Object.keys(params).sort();
  let query = '';
  for (const k of keys) {
    if (query !== '') query += '&';
    query += `${k}=${encodeURIComponent(params[k])}`;
  }
  const sign = md5(query + TV_SECRET);
  return query + '&sign=' + sign;
}

export function generateTvLoginParams(): Record<string, string> {
  return {
    appkey: TV_APPKEY,
    build: '103800',
    device_id: 'C+0/T4mR2x/xTq/LqH+of6h/qH+of6h/qH+of6h/qH+o',
    mobi_app: 'android_tv_yst',
    platform: 'android',
    ts: Math.round(Date.now() / 1000).toString()
  };
}
