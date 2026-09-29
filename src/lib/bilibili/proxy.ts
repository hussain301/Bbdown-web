const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.org/?',
];

let currentProxyIndex = 0;

function getProxy(): string {
  const custom = localStorage.getItem('proxyUrl');
  if (custom) return custom;
  return CORS_PROXIES[currentProxyIndex];
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
  const url = proxy.includes('/api/proxy')
    ? `${proxy}?url=${encodeURIComponent(biliUrl)}`
    : `${proxy}${encodeURIComponent(biliUrl)}`;

  const headers: Record<string, string> = {};
  if (options?.cookie) headers['X-Cookie'] = options.cookie;
  if (options?.accessToken) headers['X-Access-Token'] = options.accessToken;
  if (options?.method && options.method.toUpperCase() !== 'GET' && options.body) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  try {
    const response = await fetch(url, {
      method: options?.method || 'GET',
      headers,
      body: options?.body,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (err) {
    // Try next proxy on failure
    if (!localStorage.getItem('proxyUrl') && currentProxyIndex < CORS_PROXIES.length - 1) {
      currentProxyIndex++;
      return proxyFetch(biliUrl, options);
    }
    throw err;
  }
}

export function getStreamUrl(cdnUrl: string): string {
  const proxy = getProxy();
  if (proxy.includes('/api/stream')) {
    return `${proxy}?url=${encodeURIComponent(cdnUrl)}`;
  }
  return `${proxy}${encodeURIComponent(cdnUrl)}`;
}
