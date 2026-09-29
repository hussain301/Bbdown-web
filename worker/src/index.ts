export interface Env {
  ALLOWED_ORIGINS: string;
}

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com/',
};

const TV_APP_KEY = '4409e2ce8ffd12b8';
const TV_APP_SEC = '59b43e04ad6965f34319062b478f83dd';

function md5(str: string): string {
  // Pure JS MD5 implementation for Cloudflare Workers
  function safeAdd(x: number, y: number) { const lsw = (x & 0xffff) + (y & 0xffff); return ((x >> 16) + (y >> 16) + (lsw >> 16)) << 16 | lsw & 0xffff; }
  function bitRotateLeft(num: number, cnt: number) { return num << cnt | num >>> 32 - cnt; }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b & c | ~b & d, a, b, x, s, t); }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b & d | c & ~d, a, b, x, s, t); }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }

  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) bytes.push(str.charCodeAt(i));
  bytes.push(0x80);
  const bitLen = str.length * 8;
  while (bytes.length % 64 !== 56) bytes.push(0);
  bytes.push(bitLen & 0xff, (bitLen >> 8) & 0xff, (bitLen >> 16) & 0xff, (bitLen >> 24) & 0xff, 0, 0, 0, 0);

  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  for (let i = 0; i < bytes.length; i += 64) {
    const x: number[] = [];
    for (let j = 0; j < 64; j += 4) x.push(bytes[i+j] | bytes[i+j+1] << 8 | bytes[i+j+2] << 16 | bytes[i+j+3] << 24);
    let aa = a, bb = b, cc = c, dd = d;
    a=md5ff(a,b,c,d,x[0],7,-680876936);d=md5ff(d,a,b,c,x[1],12,-389564586);c=md5ff(c,d,a,b,x[2],17,606105819);b=md5ff(b,c,d,a,x[3],22,-1044525330);
    a=md5ff(a,b,c,d,x[4],7,-176418897);d=md5ff(d,a,b,c,x[5],12,1200080426);c=md5ff(c,d,a,b,x[6],17,-1473231341);b=md5ff(b,c,d,a,x[7],22,-45705983);
    a=md5ff(a,b,c,d,x[8],7,1770035416);d=md5ff(d,a,b,c,x[9],12,-1958414417);c=md5ff(c,d,a,b,x[10],17,-42063);b=md5ff(b,c,d,a,x[11],22,-1990404162);
    a=md5ff(a,b,c,d,x[12],7,1804603682);d=md5ff(d,a,b,c,x[13],12,-40341101);c=md5ff(c,d,a,b,x[14],17,-1502002290);b=md5ff(b,c,d,a,x[15],22,1236535329);
    a=md5gg(a,b,c,d,x[1],5,-165796510);d=md5gg(d,a,b,c,x[6],9,-1069501632);c=md5gg(c,d,a,b,x[11],14,643717713);b=md5gg(b,c,d,a,x[0],20,-373897302);
    a=md5gg(a,b,c,d,x[5],5,-701558691);d=md5gg(d,a,b,c,x[10],9,38016083);c=md5gg(c,d,a,b,x[15],14,-660478335);b=md5gg(b,c,d,a,x[4],20,-405537848);
    a=md5gg(a,b,c,d,x[9],5,568446438);d=md5gg(d,a,b,c,x[14],9,-1019803690);c=md5gg(c,d,a,b,x[3],14,-187363961);b=md5gg(b,c,d,a,x[8],20,1163531501);
    a=md5gg(a,b,c,d,x[13],5,-1444681467);d=md5gg(d,a,b,c,x[2],9,-51403784);c=md5gg(c,d,a,b,x[7],14,1735328473);b=md5gg(b,c,d,a,x[12],20,-1926607734);
    a=md5hh(a,b,c,d,x[5],4,-378558);d=md5hh(d,a,b,c,x[8],11,-2022574463);c=md5hh(c,d,a,b,x[11],16,1839030562);b=md5hh(b,c,d,a,x[14],23,-35309556);
    a=md5hh(a,b,c,d,x[1],4,-1530992060);d=md5hh(d,a,b,c,x[4],11,1272893353);c=md5hh(c,d,a,b,x[7],16,-155497632);b=md5hh(b,c,d,a,x[10],23,-1094730640);
    a=md5hh(a,b,c,d,x[13],4,681279174);d=md5hh(d,a,b,c,x[0],11,-358537222);c=md5hh(c,d,a,b,x[3],16,-722521979);b=md5hh(b,c,d,a,x[6],23,76029189);
    a=md5hh(a,b,c,d,x[9],4,-640364487);d=md5hh(d,a,b,c,x[12],11,-421815835);c=md5hh(c,d,a,b,x[15],16,530742520);b=md5hh(b,c,d,a,x[2],23,-995338651);
    a=md5ii(a,b,c,d,x[0],6,-198630844);d=md5ii(d,a,b,c,x[7],10,1126891415);c=md5ii(c,d,a,b,x[14],15,-1416354905);b=md5ii(b,c,d,a,x[5],21,-57434055);
    a=md5ii(a,b,c,d,x[12],6,1700485571);d=md5ii(d,a,b,c,x[3],10,-1894986606);c=md5ii(c,d,a,b,x[10],15,-1051523);b=md5ii(b,c,d,a,x[1],21,-2054922799);
    a=md5ii(a,b,c,d,x[8],6,1873313359);d=md5ii(d,a,b,c,x[15],10,-30611744);c=md5ii(c,d,a,b,x[6],15,-1560198380);b=md5ii(b,c,d,a,x[13],21,1309151649);
    a=md5ii(a,b,c,d,x[4],6,-145523070);d=md5ii(d,a,b,c,x[11],10,-1120210379);c=md5ii(c,d,a,b,x[2],15,718787259);b=md5ii(b,c,d,a,x[9],21,-343485551);
    a=safeAdd(a,aa);b=safeAdd(b,bb);c=safeAdd(c,cc);d=safeAdd(d,dd);
  }
  const hex = (n: number) => Array.from({length:4},(_,i)=>((n>>>(i*8))&0xff).toString(16).padStart(2,'0')).join('');
  return hex(a)+hex(b)+hex(c)+hex(d);
}

function signParams(params: Record<string, string>): string {
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

      // Generate buvid3 to bypass 412 anti-bot
      const buvid3 = crypto.randomUUID() + 'infoc';
      headers.set('Cookie', `buvid3=${buvid3}`);

      // Forward client cookie (X-Cookie header from frontend)
      const clientCookie = request.headers.get('X-Cookie');
      if (clientCookie) headers.set('Cookie', `${clientCookie}; buvid3=${buvid3}`);
      
      // Forward access token
      const token = request.headers.get('X-Access-Token');
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
        const sign = signParams(params);
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
        const sign = signParams(params);
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
