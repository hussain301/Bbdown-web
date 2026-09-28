import { proxyFetch } from './proxy';
import { SubtitleInfo } from './types';

export async function getSubtitles(aid: string, cid: string, cookie?: string): Promise<SubtitleInfo[]> {
  const avid = aid.replace(/[aA][vV]/, '');
  const res = await proxyFetch(`https://api.bilibili.com/x/player/wbi/v2?aid=${avid}&cid=${cid}`, { cookie });
  
  if (res.code !== 0) return [];
  
  const subs = res.data?.subtitle?.subtitles;
  if (!subs || !Array.isArray(subs)) return [];

  return subs.map((s: any) => ({
      id: s.id,
      lan: s.lan,
      lanDoc: s.lan_doc,
      isMachine: s.is_machine,
      url: s.subtitle_url.startsWith('//') ? 'https:' + s.subtitle_url : s.subtitle_url
  }));
}

function formatSrtTime(seconds: number): string {
    const d = new Date(seconds * 1000);
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = d.getUTCMinutes().toString().padStart(2, '0');
    const s = d.getUTCSeconds().toString().padStart(2, '0');
    const ms = d.getUTCMilliseconds().toString().padStart(3, '0');
    return `${h}:${m}:${s},${ms}`;
}

export function convertJsonToSrt(jsonString: string): string {
  try {
      const data = JSON.parse(jsonString);
      if (!data.body || !Array.isArray(data.body)) return '';
      
      let srt = '';
      for (let i = 0; i < data.body.length; i++) {
          const item = data.body[i];
          srt += `${i + 1}\n`;
          srt += `${formatSrtTime(item.from)} --> ${formatSrtTime(item.to)}\n`;
          srt += `${item.content}\n\n`;
      }
      return srt;
  } catch (e) {
      console.error('Failed to parse subtitle JSON', e);
      return '';
  }
}
