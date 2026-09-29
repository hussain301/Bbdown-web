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
  if (options?.method && options.method.toUpperCase() !== 'GET' && options.body) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  const response = await fetch(url, {
    method: options?.method || 'GET',
    headers,
    body: options?.body,
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export function getStreamUrl(cdnUrl: string): string {
  const proxy = getProxy();
  return `${proxy}/api/stream?url=${encodeURIComponent(cdnUrl)}`;
}
