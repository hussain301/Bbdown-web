let PROXY_URL = localStorage.getItem('proxyUrl') || 'https://bbdown-proxy.workers.dev';

export function setProxyUrl(url: string) {
  PROXY_URL = url;
  localStorage.setItem('proxyUrl', url);
}

export function getProxyUrl(): string {
  return PROXY_URL;
}

export async function proxyFetch(biliUrl: string, options?: {
  method?: string;
  cookie?: string;
  accessToken?: string;
  body?: string;
}): Promise<any> {
  const url = `${PROXY_URL}/api/proxy?url=${encodeURIComponent(biliUrl)}`;
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
  return response.json();
}

export function getStreamUrl(cdnUrl: string): string {
  return `${PROXY_URL}/api/stream?url=${encodeURIComponent(cdnUrl)}`;
}
