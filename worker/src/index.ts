export interface Env {
  ALLOWED_ORIGINS: string;
}

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com/',
};

const TV_APP_KEY = '4409e2ce8ffd12b8';
const TV_APP_SEC = '59b43e04ad6965f34319062b478f83dd';

async function md5(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('MD5', buffer);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function signParams(params: Record<string, string>): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  let signStr = '';
  for (const key of sortedKeys) {
    if (params[key] !== undefined && params[key] !== null) {
      signStr += `${key}=${params[key]}&`;
    }
  }
  signStr = signStr.slice(0, -1) + TV_APP_SEC;
  return md5(signStr);
}

function getCorsHeaders(env: Env, request: Request): Headers {
  const origin = request.headers.get('Origin') || '*';
  return new Headers({
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS === '*' ? origin : env.ALLOWED_ORIGINS,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Max-Age': '86400',
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const corsHeaders = getCorsHeaders(env, request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      let targetUrl = '';
      let method = request.method;
      let body: any = undefined;
      const headers = new Headers(DEFAULT_HEADERS);
      let isStreaming = false;

      // Forward relevant client headers
      const cookie = request.headers.get('Cookie');
      if (cookie) headers.set('Cookie', cookie);
      const token = request.headers.get('Access-Token');
      if (token) headers.set('Authorization', `Bearer ${token}`); 

      // Route handling
      if (path === '/api/proxy') {
        targetUrl = url.searchParams.get('url') || '';
        if (!targetUrl) throw new Error('Missing url parameter');
      } 
      else if (path === '/api/login/web/qr/generate') {
        targetUrl = 'https://passport.bilibili.com/x/passport-login/web/qrcode/generate';
      } 
      else if (path === '/api/login/web/qr/poll') {
        const key = url.searchParams.get('qrcode_key');
        if (!key) throw new Error('Missing qrcode_key parameter');
        targetUrl = `https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${key}`;
      } 
      else if (path === '/api/login/tv/qr/generate') {
        targetUrl = 'https://passport.snm0516.aisee.tv/x/passport-tv-login/qrcode/auth_code';
        method = 'POST';
        const params: Record<string, string> = {
          appkey: TV_APP_KEY,
          local_id: '0',
          ts: Math.floor(Date.now() / 1000).toString(),
        };
        const sign = await signParams(params);
        body = new URLSearchParams({ ...params, sign }).toString();
        headers.set('Content-Type', 'application/x-www-form-urlencoded');
      } 
      else if (path === '/api/login/tv/qr/poll') {
        targetUrl = 'https://passport.bilibili.com/x/passport-tv-login/qrcode/poll';
        method = 'POST';
        const auth_code = url.searchParams.get('auth_code');
        if (!auth_code) throw new Error('Missing auth_code parameter');
        const params: Record<string, string> = {
          appkey: TV_APP_KEY,
          auth_code,
          local_id: '0',
          ts: Math.floor(Date.now() / 1000).toString(),
        };
        const sign = await signParams(params);
        body = new URLSearchParams({ ...params, sign }).toString();
        headers.set('Content-Type', 'application/x-www-form-urlencoded');
      } 
      else if (path === '/api/video/info') {
        const aid = url.searchParams.get('aid');
        const bvid = url.searchParams.get('bvid');
        if (aid) {
            targetUrl = `https://api.bilibili.com/x/web-interface/view?aid=${aid}`;
        } else if (bvid) {
            targetUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
        } else {
            throw new Error('Missing aid or bvid parameter');
        }
      } 
      else if (path === '/api/video/playurl') {
        const targetPath = url.searchParams.get('tv') === '1' 
          ? 'https://api.bilibili.com/pgc/player/api/playurltv'
          : 'https://api.bilibili.com/x/player/wbi/playurl';
        
        const params = new URLSearchParams(url.search);
        params.delete('tv');
        targetUrl = `${targetPath}?${params.toString()}`;
      } 
      else if (path === '/api/bangumi/info') {
        const ep_id = url.searchParams.get('ep_id');
        if (!ep_id) throw new Error('Missing ep_id parameter');
        targetUrl = `https://api.bilibili.com/pgc/view/web/season?ep_id=${ep_id}`;
      } 
      else if (path === '/api/user/nav') {
        targetUrl = 'https://api.bilibili.com/x/web-interface/nav';
      } 
      else if (path === '/api/subtitle') {
        const params = new URLSearchParams(url.search);
        targetUrl = `https://api.bilibili.com/x/player/wbi/v2?${params.toString()}`;
      } 
      else if (path === '/api/stream') {
        targetUrl = url.searchParams.get('url') || '';
        if (!targetUrl) throw new Error('Missing url parameter');
        isStreaming = true;
        const range = request.headers.get('Range');
        if (range) headers.set('Range', range);
      } 
      else {
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { ...Object.fromEntries(corsHeaders.entries()), 'Content-Type': 'application/json' },
        });
      }

      const fetchOptions: RequestInit = {
        method,
        headers,
        body: (method === 'POST' || method === 'PUT') ? (body || request.body) : undefined,
      };

      if (!isStreaming) {
        const response = await fetch(targetUrl, fetchOptions);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limited by upstream' }), {
            status: 429,
            headers: { ...Object.fromEntries(corsHeaders.entries()), 'Content-Type': 'application/json' },
          });
        }

        const data = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/json';
        corsHeaders.set('Content-Type', contentType);
        
        return new Response(data, {
          status: response.status,
          headers: corsHeaders,
        });
      } else {
        const response = await fetch(targetUrl, fetchOptions);
        
        if (response.status === 429) {
          return new Response('Rate limited', { status: 429, headers: corsHeaders });
        }

        const newHeaders = new Headers(corsHeaders);
        const copyHeaders = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'content-disposition'];
        copyHeaders.forEach(h => {
          const val = response.headers.get(h);
          if (val) newHeaders.set(h, val);
        });

        return new Response(response.body, {
          status: response.status,
          headers: newHeaders,
        });
      }

    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...Object.fromEntries(corsHeaders.entries()), 'Content-Type': 'application/json' },
      });
    }
  },
};
