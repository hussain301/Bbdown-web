import { proxyFetch } from './proxy';
import { VideoInfo } from './types';
import { bv2av } from './converter';

export function parseInputUrl(input: string): { type: 'video' | 'bangumi' | 'cheese' | 'unknown'; id: string } {
  input = input.trim();
  
  if (input.includes('b23.tv')) {
      return { type: 'unknown', id: input };
  }

  const bvMatch = input.match(/[bB][vV]1[a-zA-Z0-9]{9}/);
  if (bvMatch) return { type: 'video', id: bvMatch[0] };
  
  const avMatch = input.match(/[aA][vV][0-9]+/);
  if (avMatch) return { type: 'video', id: avMatch[0] };

  const epMatch = input.match(/[eE][pP][0-9]+/);
  if (epMatch) return { type: 'bangumi', id: epMatch[0] };

  const ssMatch = input.match(/[sS][sS][0-9]+/);
  if (ssMatch) return { type: 'bangumi', id: ssMatch[0] };

  return { type: 'unknown', id: input };
}

export async function fetchVideoInfo(id: string, cookie?: string): Promise<VideoInfo> {
  let aid = id;
  if (id.toLowerCase().startsWith('bv')) {
    aid = 'av' + bv2av(id);
  } else if (id.toLowerCase().startsWith('av')) {
    aid = id;
  }

  const avidNum = parseInt(aid.replace(/[aA][vV]/, ''));
  const res = await proxyFetch(`https://api.bilibili.com/x/web-interface/view?aid=${avidNum}`, { cookie });
  
  if (res.code !== 0) {
    throw new Error(`API Error: ${res.message}`);
  }

  const data = res.data;
  return {
    aid: data.aid,
    bvid: data.bvid,
    title: data.title,
    desc: data.desc,
    pic: data.pic,
    pubDate: data.pubdate,
    duration: data.duration,
    ownerName: data.owner.name,
    ownerMid: data.owner.mid,
    isBangumi: false,
    isInteractive: false,
    pages: data.pages.map((p: any) => ({
      cid: p.cid,
      page: p.page,
      title: p.part,
      duration: p.duration
    }))
  };
}

export async function fetchBangumiInfo(epId: string, cookie?: string): Promise<VideoInfo> {
  const epIdNum = parseInt(epId.replace(/[eE][pP]/, ''));
  const res = await proxyFetch(`https://api.bilibili.com/pgc/view/web/season?ep_id=${epIdNum}`, { cookie });
  
  if (res.code !== 0) {
    throw new Error(`API Error: ${res.message}`);
  }

  const data = res.result;
  const targetEp = data.episodes.find((ep: any) => ep.ep_id === epIdNum) || data.episodes[0];
  
  return {
    aid: targetEp.aid,
    bvid: targetEp.bvid,
    title: data.title,
    desc: data.evaluate,
    pic: data.cover,
    pubDate: targetEp.pub_time || 0,
    duration: 0, 
    ownerName: data.up_info?.title || '',
    ownerMid: data.up_info?.mid || 0,
    isBangumi: true,
    isInteractive: false,
    pages: data.episodes.map((ep: any, idx: number) => ({
      cid: ep.cid,
      page: idx + 1,
      title: ep.title + (ep.long_title ? ' ' + ep.long_title : ''),
      duration: 0
    }))
  };
}
