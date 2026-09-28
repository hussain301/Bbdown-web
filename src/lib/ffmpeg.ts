import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let loaded = false;

export async function loadFFmpeg(
  onProgress?: (progress: number) => void
): Promise<void> {
  if (loaded) return;
  
  ffmpeg = new FFmpeg();
  
  ffmpeg.on('progress', ({ progress }) => {
    onProgress?.(progress);
  });
  
  // Load ffmpeg core from CDN
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  loaded = true;
}

export async function mergeVideoAudio(
  videoData: Uint8Array,
  audioData: Uint8Array,
  outputFilename: string,
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  if (!ffmpeg || !loaded) {
    await loadFFmpeg(onProgress);
  }
  
  // Write input files
  await ffmpeg!.writeFile('video.mp4', videoData);
  await ffmpeg!.writeFile('audio.m4a', audioData);
  
  // Merge without re-encoding (just copy streams)
  await ffmpeg!.exec([
    '-i', 'video.mp4',
    '-i', 'audio.m4a',
    '-c', 'copy',
    '-movflags', 'faststart',
    outputFilename
  ]);
  
  // Read output
  const data = await ffmpeg!.readFile(outputFilename);
  
  // Cleanup
  await ffmpeg!.deleteFile('video.mp4');
  await ffmpeg!.deleteFile('audio.m4a');
  await ffmpeg!.deleteFile(outputFilename);
  
  return data as Uint8Array;
}

export async function addSubtitleToVideo(
  videoData: Uint8Array,
  subtitleData: string,
  outputFilename: string
): Promise<Uint8Array> {
  if (!ffmpeg || !loaded) await loadFFmpeg();
  
  await ffmpeg!.writeFile('input.mp4', videoData);
  await ffmpeg!.writeFile('sub.srt', new TextEncoder().encode(subtitleData));
  
  await ffmpeg!.exec([
    '-i', 'input.mp4',
    '-i', 'sub.srt',
    '-c', 'copy',
    '-c:s', 'mov_text',
    outputFilename
  ]);
  
  const data = await ffmpeg!.readFile(outputFilename);
  await ffmpeg!.deleteFile('input.mp4');
  await ffmpeg!.deleteFile('sub.srt');
  await ffmpeg!.deleteFile(outputFilename);
  
  return data as Uint8Array;
}

export function isFFmpegLoaded(): boolean {
  return loaded;
}

export function saveFileToPC(data: Uint8Array, filename: string, mimeType = 'video/mp4') {
  const blob = new Blob([data as unknown as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
