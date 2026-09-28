export interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes per second
}

export type ProgressCallback = (progress: DownloadProgress) => void;

export async function downloadFile(
  url: string,
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  
  let loaded = 0;
  let startTime = Date.now();
  let lastTime = startTime;
  let lastLoaded = 0;
  
  if (!response.body) {
    const data = await response.arrayBuffer();
    return new Uint8Array(data);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) {
      break;
    }
    
    chunks.push(value);
    loaded += value.length;
    
    const now = Date.now();
    const timeDiff = now - lastTime;
    
    if (timeDiff >= 100) { // Update speed every 100ms
      const speed = ((loaded - lastLoaded) / timeDiff) * 1000;
      onProgress?.({
        loaded,
        total,
        percentage: total ? (loaded / total) * 100 : 0,
        speed
      });
      lastTime = now;
      lastLoaded = loaded;
    }
  }

  const result = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}

export async function downloadAndSave(
  url: string,
  filename: string,
  onProgress?: ProgressCallback
): Promise<void> {
  const data = await downloadFile(url, onProgress);
  const blob = new Blob([data as unknown as BlobPart]);
  const blobUrl = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatSpeed(bytesPerSec: number): string {
  return formatFileSize(bytesPerSec) + '/s';
}
