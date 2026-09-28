import { DashResult, QualityOption, QUALITY_MAP } from './types';
import { proxyFetch } from './proxy';
import { getWbiKeys, getMixinKey, wbiSign, tvSign } from './signing';

export async function getPlayUrl(
  aid: string, cid: string, options: {
    useTvApi?: boolean;
    cookie?: string;
    accessToken?: string;
    qn?: string;
    encodingPreference?: string;
  }
): Promise<DashResult> {
  const avid = aid.replace(/[aA][vV]/, '');
  let jsonRes: any = null;

  if (options.useTvApi) {
    let params: Record<string, string> = {
      avid,
      cid,
      qn: options.qn || '120',
      fourk: '1',
      fnval: '4048', // dash
      build: '103800',
      device_id: 'C+0/T4mR2x/xTq/LqH+of6h/qH+of6h/qH+of6h/qH+o',
      mobi_app: 'android_tv_yst',
      platform: 'android',
    };
    if (options.accessToken) params['access_key'] = options.accessToken;
    const query = tvSign(params);
    jsonRes = await proxyFetch(`https://api.snm0516.aisee.tv/x/tv/playurl?${query}`, {
        cookie: options.cookie
    });
  } else {
    const keys = await getWbiKeys(options.cookie);
    let params: Record<string, string> = {
      avid,
      cid,
      qn: options.qn || '120',
      fourk: '1',
      fnval: '4048', // dash
    };
    let query = '';
    if (keys.imgKey && keys.subKey) {
        const mixin = getMixinKey(keys.imgKey, keys.subKey);
        query = wbiSign(params, mixin);
    } else {
        const sp = new URLSearchParams(params);
        query = sp.toString();
    }
    jsonRes = await proxyFetch(`https://api.bilibili.com/x/player/wbi/playurl?${query}`, { cookie: options.cookie });
  }

  if (jsonRes.code !== 0) {
      throw new Error(`PlayUrl Error: ${jsonRes.message}`);
  }

  const dashInfo = jsonRes.data?.dash || jsonRes.result?.dash;
  if (!dashInfo) {
      throw new Error('No DASH info found in response');
  }

  return parseDashJson(dashInfo);
}

export function parseDashJson(json: any): DashResult {
  const dash: DashResult = {
    videoStreams: [],
    audioStreams: [],
    dolbyAudio: null,
    flacAudio: null,
    duration: json.duration || 0
  };

  if (json.video) {
    dash.videoStreams = json.video.map((v: any) => ({
      id: v.id,
      quality: v.id,
      qualityName: QUALITY_MAP[v.id] || `Q${v.id}`,
      codecId: v.codecid,
      codecName: v.codecid === 12 ? 'HEVC' : (v.codecid === 13 ? 'AV1' : 'AVC'),
      width: v.width,
      height: v.height,
      frameRate: v.frameRate,
      bandwidth: v.bandwidth,
      baseUrl: v.baseUrl || v.base_url,
      backupUrls: v.backupUrl || v.backup_url || [],
      size: v.size || 0
    }));
  }

  if (json.audio) {
    dash.audioStreams = json.audio.map((a: any) => ({
      id: a.id,
      quality: a.id,
      qualityName: `Audio ${a.id}`,
      codecName: 'AAC',
      bandwidth: a.bandwidth,
      baseUrl: a.baseUrl || a.base_url,
      backupUrls: a.backupUrl || a.backup_url || []
    }));
  }
  
  if (json.dolby?.audio?.length > 0) {
      dash.dolbyAudio = {
          id: json.dolby.audio[0].id,
          quality: json.dolby.audio[0].id,
          qualityName: 'Dolby Atmos',
          codecName: 'E-AC-3',
          bandwidth: json.dolby.audio[0].bandwidth,
          baseUrl: json.dolby.audio[0].baseUrl || json.dolby.audio[0].base_url,
          backupUrls: json.dolby.audio[0].backupUrl || json.dolby.audio[0].backup_url || []
      };
  }

  if (json.flac?.audio) {
      dash.flacAudio = {
          id: json.flac.audio.id,
          quality: json.flac.audio.id,
          qualityName: 'FLAC',
          codecName: 'FLAC',
          bandwidth: json.flac.audio.bandwidth,
          baseUrl: json.flac.audio.baseUrl || json.flac.audio.base_url,
          backupUrls: json.flac.audio.backupUrl || json.flac.audio.backup_url || []
      };
  }

  return dash;
}

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function buildQualityOptions(dash: DashResult): QualityOption[] {
  const options: QualityOption[] = [];
  const bestAudio = dash.flacAudio || dash.dolbyAudio || (dash.audioStreams.length > 0 ? dash.audioStreams.reduce((prev, curr) => (prev.bandwidth > curr.bandwidth ? prev : curr)) : null);
  
  const durationInSeconds = dash.duration || 0;

  for (const v of dash.videoStreams) {
      let totalBandwidth = v.bandwidth + (bestAudio ? bestAudio.bandwidth : 0);
      let estimatedSize = durationInSeconds > 0 ? formatBytes((totalBandwidth / 8) * durationInSeconds) : 'Unknown';

      options.push({
          qn: v.quality,
          name: v.qualityName,
          codec: v.codecName,
          resolution: `${v.width}x${v.height}`,
          fps: v.frameRate,
          bandwidth: v.bandwidth,
          estimatedSize: estimatedSize,
          videoUrl: v.baseUrl,
          audioUrl: bestAudio ? bestAudio.baseUrl : ''
      });
  }

  options.sort((a, b) => b.qn - a.qn || b.bandwidth - a.bandwidth);
  return options;
}
