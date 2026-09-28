export interface DownloadTask {
  Aid: string;
  Url: string;
  TaskCreateTime: number;
  Title: string | null;
  Pic: string | null;
  VideoPubTime: number | null;
  TaskFinishTime: number | null;
  Progress: number;
  DownloadSpeed: number;
  TotalDownloadedBytes: number;
  IsSuccessful: boolean;
}

export interface DownloadTaskCollection {
  Running: DownloadTask[];
  Finished: DownloadTask[];
}

export interface AddTaskOptions {
  Url: string;
  UseTvApi?: boolean;
  UseAppApi?: boolean;
  UseIntlApi?: boolean;
  EncodingPriority?: string;
  DfnPriority?: string;
  VideoOnly?: boolean;
  AudioOnly?: boolean;
  DownloadDanmaku?: boolean;
  SkipSubtitle?: boolean;
  SkipCover?: boolean;
  MultiThread?: boolean;
  ForceHttp?: boolean;
  FilePattern?: string;
  MultiFilePattern?: string;
  SelectPage?: string;
  Cookie?: string;
  AccessToken?: string;
  WorkDir?: string;
  OnlyShowInfo?: boolean;
}

export interface AppSettings {
  apiUrl: string;
  cookie: string;
  accessToken: string;
  defaultWorkDir: string;
  defaultQuality: string;
  defaultCodec: string;
  autoMultiThread: boolean;
  theme: 'dark' | 'light';
}
