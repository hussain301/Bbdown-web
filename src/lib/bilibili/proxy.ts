

const DEFAULT_PROXY = 'https://bbdown-api.vercel.app';

function getProxy(): string {
  return localStorage.getItem('proxyUrl') || DEFAULT_PROXY;
}

export function setProxyUrl(url: string) {
  localStorage.setItem('proxyUrl', url);
}

export function getProxyUrl(): string {
  return getProxy();
}

export async function proxyFetch(biliUrl: string, options?: {
  method?: string;
  cookie?: string;
  accessToken?: string;
  body?: string;
}): Promise<any> {
  const proxy = getProxy();
  const url = `${proxy}/api/proxy?url=${encodeURIComponent(biliUrl)}`;
  const headers: Record<string, string> = {};
  if (options?.cookie) headers['X-Cookie'] = options.cookie;
  if (options?.accessToken) headers['X-Access-Token'] = options.accessToken;
  
  const response = await fetch(url, {
    method: options?.method || 'GET',
    headers,
    body: options?.body,
  });
  return response.json();
}

// Fetch video info via HTML scraping (bypasses 412!)
export async function fetchVideoInfoDirect(bvid: string): Promise<any> {
  const proxy = getProxy();
  const response = await fetch(`${proxy}/api/video/info?bvid=${encodeURIComponent(bvid)}`);
  const json = await response.json();
  if (json.code !== 0) throw new Error(json.error || 'Failed to fetch video info');
  return json.data;
}

// Fetch play URL via TV API (bypasses 412!)
export async function fetchPlayUrlDirect(aid: string, cid: string, qn?: string): Promise<any> {
  const proxy = getProxy();
  const response = await fetch(`${proxy}/api/video/playurl?aid=${aid}&cid=${cid}&qn=${qn || '120'}`);
  return response.json();
}

export function getStreamUrl(cdnUrl: string): string {
  return `${getProxy()}/api/stream?url=${encodeURIComponent(cdnUrl)}`;
}
