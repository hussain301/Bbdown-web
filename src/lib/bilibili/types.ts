export interface VideoInfo {
  aid: number;
  bvid: string;
  title: string;
  desc: string;
  pic: string;
  pubDate: number;
  duration: number;
  ownerName: string;
  ownerMid: number;
  pages: PageInfo[];
  isBangumi: boolean;
  isInteractive: boolean;
}

export interface PageInfo {
  cid: number;
  page: number;
  title: string;
  duration: number;
}

export interface StreamInfo {
  id: number;
  quality: number;
  qualityName: string;
  codecId: number;
  codecName: string;
  width: number;
  height: number;
  frameRate: string;
  bandwidth: number;
  baseUrl: string;
  backupUrls: string[];
  size: number;
}

export interface AudioInfo {
  id: number;
  quality: number;
  qualityName: string;
  codecName: string;
  bandwidth: number;
  baseUrl: string;
  backupUrls: string[];
}

export interface DashResult {
  videoStreams: StreamInfo[];
  audioStreams: AudioInfo[];
  dolbyAudio: AudioInfo | null;
  flacAudio: AudioInfo | null;
  duration: number;
}

export interface QualityOption {
  qn: number;
  name: string;
  codec: string;
  resolution: string;
  fps: string;
  bandwidth: number;
  estimatedSize: string;
  videoUrl: string;
  audioUrl: string;
}

export const QUALITY_MAP: Record<number, string> = {
  127: '8K 超高清',
  126: '杜比视界',
  125: 'HDR 真彩',
  120: '4K 超清',
  116: '1080P 高帧率',
  112: '1080P 高码率',
  80: '1080P 高清',
  74: '720P 高帧率',
  64: '720P 高清',
  32: '480P 清晰',
  16: '360P 流畅',
};

export interface SubtitleInfo {
  id: number;
  lan: string;
  lanDoc: string;
  isMachine: boolean;
  url: string;
}
