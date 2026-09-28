import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Image as ImageIcon, CheckCircle, Settings2, Download, Play, 
  Tv, Smartphone, Globe, Monitor, ListVideo, Film, Music, FileText, 
  MessageSquare, Image as ImagePic, Code, Info, HardDrive, Clock, Eye, ThumbsUp
} from 'lucide-react';
// @ts-ignore
import { parseInputUrl, fetchVideoInfo, fetchBangumiInfo } from '../lib/bilibili';
// @ts-ignore
import { getPlayUrl, buildQualityOptions } from '../lib/bilibili/parser';
// @ts-ignore
import { getSubtitles, convertJsonToSrt } from '../lib/bilibili/subtitle';
// @ts-ignore
import { downloadFile } from '../lib/download';
// @ts-ignore
import { loadFFmpeg, mergeVideoAudio, saveFileToPC } from '../lib/ffmpeg';
// @ts-ignore
import { getStreamUrl } from '../lib/bilibili/proxy';
// @ts-ignore
import type { VideoInfo, QualityOption } from '../lib/bilibili/types';

export default function DownloadPage() {
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState(searchParams.get('url') || '');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<any>(null);
  const [selectedQuality, setSelectedQuality] = useState('');
  const [selectedAudioQuality, setSelectedAudioQuality] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // API Mode State
  const [apiMode, setApiMode] = useState<'web' | 'tv' | 'app' | 'intl'>('web');

  // Content Type State
  const [options, setOptions] = useState({
    video: true,
    audio: true,
    videoOnly: false,
    audioOnly: false,
    subtitles: true,
    danmaku: true,
    cover: false,
    onlyInfo: false,
  });

  // Pages / Episodes State
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  // Filename Pattern State
  const [filenamePattern, setFilenamePattern] = useState('<videoTitle>');

  // Progress State
  const [progress, setProgress] = useState({
    step: '',
    videoPercent: 0,
    audioPercent: 0,
    mergePercent: 0,
    speed: '0 MB/s',
    eta: '00:00'
  });

  const handleFetch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock fetch for demonstration
    setTimeout(() => {
      setInfo({
        title: '【Bilibili】Mock Video Full Features',
        author: 'BiliCreator',
        pic: 'https://archive.biliapi.net/bvid/BV1xx411c7mD',
        desc: 'This is a mock description containing lots of details about the video.',
        duration: '12:34',
        bvid: 'BV1xx411c7mD',
        avid: 'av12345678',
        pubDate: '2023-10-01',
        viewCount: '1.2M',
        likeCount: '256K',
        pages: [
          { id: 1, title: 'Part 1: Introduction', duration: '05:00', pic: '' },
          { id: 2, title: 'Part 2: Main Content', duration: '05:00', pic: '' },
          { id: 3, title: 'Part 3: Conclusion', duration: '02:34', pic: '' }
        ],
        qualities: [
          { id: '120', name: '4K 超清', resolution: '3840x2160', codec: 'HEVC', fps: 60, size: '850MB', isVip: true },
          { id: '116', name: '1080P 60帧', resolution: '1920x1080', codec: 'HEVC', fps: 60, size: '150MB', isVip: true },
          { id: '80', name: '1080P 高清', resolution: '1920x1080', codec: 'AVC', fps: 30, size: '120MB' },
          { id: '64', name: '720P 高清', resolution: '1280x720', codec: 'AVC', fps: 30, size: '80MB' },
        ],
        audioQualities: [
          { id: '30280', name: 'Hi-Res FLAC', codec: 'FLAC', size: '45MB', badge: 'platinum' },
          { id: '30250', name: 'Dolby Atmos', codec: 'EC-3', size: '30MB', badge: 'golden' },
          { id: '30232', name: 'Standard', codec: 'AAC', size: '15MB', badge: 'none' },
        ]
      });
      setSelectedQuality('80');
      setSelectedAudioQuality('30232');
      setSelectedPages([1]);
      setLoading(false);
    }, 1500);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setProgress({ step: 'Fetching Info', videoPercent: 0, audioPercent: 0, mergePercent: 0, speed: '0 MB/s', eta: '--:--' });
    
    setTimeout(() => setProgress(p => ({ ...p, step: 'Downloading Video', videoPercent: 45, speed: '5.2 MB/s', eta: '00:45' })), 2000);
    setTimeout(() => setProgress(p => ({ ...p, step: 'Downloading Audio', videoPercent: 100, audioPercent: 60, speed: '3.1 MB/s', eta: '00:10' })), 4000);
    setTimeout(() => setProgress(p => ({ ...p, step: 'Merging', audioPercent: 100, mergePercent: 50, speed: '-', eta: '-' })), 6000);
    setTimeout(() => setProgress(p => ({ ...p, step: 'Done!', mergePercent: 100 })), 8000);
  };

  const togglePage = (id: number) => {
    setSelectedPages(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const selectAllPages = () => setSelectedPages(info?.pages?.map((p: any) => p.id) || []);
  const selectLatestPage = () => {
    if (info?.pages?.length > 0) {
      setSelectedPages([info.pages[info.pages.length - 1].id]);
    }
  };

  const addVariable = (v: string) => {
    setFilenamePattern(prev => prev + v);
  };

  const handleOptionChange = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Search Header */}
      <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleFetch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter Bilibili video URL (e.g., https://www.bilibili.com/video/BV...)"
              className="w-full bg-black/40 border border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-gray-100 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder-gray-500"
            />
          </div>
          <button
            type="submit"
            disabled={!url || loading}
            className="bg-[#fb7299] hover:bg-[#fc8bab] disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Fetch Info'}
          </button>
        </form>
      </div>

      {info && !isDownloading && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
          
          {/* Video Preview Card */}
          <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 shadow-xl">
            <div className="w-full md:w-80 aspect-video bg-black/60 rounded-xl flex items-center justify-center border border-gray-800 overflow-hidden relative group">
              {info.pic ? (
                <img src={info.pic} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                <ImageIcon size={48} className="text-gray-700" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play size={48} className="text-white/90 drop-shadow-lg" />
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 text-xs text-white rounded">
                {info.duration}
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold text-gray-100 leading-tight">{info.title}</h2>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-bold">
                    {info.author.charAt(0)}
                  </div>
                  <span className="text-gray-300 font-medium">{info.author}</span>
                </div>
                <span className="flex items-center gap-1"><Clock size={14} /> {info.pubDate}</span>
                <span className="flex items-center gap-1"><Eye size={14} /> {info.viewCount}</span>
                <span className="flex items-center gap-1"><ThumbsUp size={14} /> {info.likeCount}</span>
              </div>

              <div className="flex gap-2">
                <span className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300 hover:bg-gray-700 cursor-pointer transition-colors">
                  {info.bvid}
                </span>
                <span className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300 hover:bg-gray-700 cursor-pointer transition-colors">
                  {info.avid}
                </span>
                <span className="px-2 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded text-xs">
                  {info.pages?.length} Pages/Episodes
                </span>
              </div>

              <p className="text-sm text-gray-500 line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                {info.desc}
              </p>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: API & Content Options */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* API Mode */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
                  <Globe size={18} className="text-[#fb7299]" />
                  API Mode
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'web', icon: Monitor, label: 'Web API', tooltip: 'Standard, needs cookie for HD' },
                    { id: 'tv', icon: Tv, label: 'TV API', tooltip: 'Often watermark-free' },
                    { id: 'app', icon: Smartphone, label: 'App API', tooltip: 'Mobile API' },
                    { id: 'intl', icon: Globe, label: 'Intl API', tooltip: 'Southeast Asia content' },
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setApiMode(mode.id as any)}
                      title={mode.tooltip}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        apiMode === mode.id 
                          ? 'bg-pink-500/20 border-pink-500/50 text-pink-400' 
                          : 'bg-black/20 border-gray-800 text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      <mode.icon size={20} className="mb-1" />
                      <span className="text-xs font-medium">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Options */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
                  <Settings2 size={18} className="text-[#fb7299]" />
                  Download Options
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 'video', label: 'Download Video', icon: Film },
                    { id: 'audio', label: 'Download Audio', icon: Music },
                    { id: 'videoOnly', label: 'Video Only (No Audio)', icon: Film },
                    { id: 'audioOnly', label: 'Audio Only (No Video)', icon: Music },
                    { id: 'subtitles', label: 'Download Subtitles', icon: FileText },
                    { id: 'danmaku', label: 'Download Danmaku', icon: MessageSquare },
                    { id: 'cover', label: 'Download Cover', icon: ImagePic },
                    { id: 'onlyInfo', label: 'Only Show Info', icon: Info },
                  ].map(opt => (
                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        options[opt.id as keyof typeof options]
                          ? 'bg-pink-500 border-pink-500'
                          : 'bg-black/40 border-gray-600 group-hover:border-gray-500'
                      }`}>
                        {options[opt.id as keyof typeof options] && <CheckCircle size={14} className="text-white" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={options[opt.id as keyof typeof options]}
                        onChange={() => handleOptionChange(opt.id as keyof typeof options)} 
                      />
                      <opt.icon size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-300">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Qualities & Pages */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Quality Selection */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
                  <Monitor size={18} className="text-[#fb7299]" />
                  Video Quality
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {info.qualities.map((q: any) => (
                    <div 
                      key={q.id}
                      onClick={() => setSelectedQuality(q.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedQuality === q.id 
                          ? 'bg-pink-500/10 border-pink-500/50' 
                          : 'bg-black/20 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`font-medium ${selectedQuality === q.id ? 'text-pink-400' : 'text-gray-200'}`}>
                          {q.name}
                        </span>
                        {q.isVip && <span className="bg-orange-500/20 text-orange-400 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold border border-orange-500/30">VIP</span>}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <span className="bg-gray-800 px-1.5 py-0.5 rounded">{q.resolution}</span>
                        <span className="bg-gray-800 px-1.5 py-0.5 rounded text-blue-400">{q.codec}</span>
                        <span className="bg-gray-800 px-1.5 py-0.5 rounded">{q.fps}fps</span>
                        <span className="bg-gray-800 px-1.5 py-0.5 rounded flex items-center gap-1"><HardDrive size={10}/> {q.size}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
                  <Music size={18} className="text-[#fb7299]" />
                  Audio Quality
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {info.audioQualities.map((q: any) => (
                    <div 
                      key={q.id}
                      onClick={() => setSelectedAudioQuality(q.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedAudioQuality === q.id 
                          ? 'bg-pink-500/10 border-pink-500/50' 
                          : 'bg-black/20 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium text-sm ${selectedAudioQuality === q.id ? 'text-pink-400' : 'text-gray-200'}`}>
                          {q.name}
                        </span>
                        {q.badge === 'platinum' && <span className="w-2 h-2 rounded-full bg-blue-300 shadow-[0_0_8px_rgba(147,197,253,0.8)]"></span>}
                        {q.badge === 'golden' && <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]"></span>}
                      </div>
                      <div className="text-xs text-gray-500 flex gap-2">
                        <span>{q.codec}</span>
                        <span>{q.size}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pages / Episodes */}
              {info.pages && info.pages.length > 1 && (
                <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2">
                      <ListVideo size={18} className="text-[#fb7299]" />
                      Episodes ({info.pages.length})
                    </h3>
                    <div className="flex gap-2">
                      <button onClick={selectAllPages} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded transition-colors">ALL</button>
                      <button onClick={selectLatestPage} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded transition-colors">LATEST</button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {info.pages.map((p: any) => (
                      <div 
                        key={p.id}
                        onClick={() => togglePage(p.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
                          selectedPages.includes(p.id)
                            ? 'bg-pink-500/20 border-pink-500/50' 
                            : 'bg-black/20 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <span className={`text-sm line-clamp-2 ${selectedPages.includes(p.id) ? 'text-pink-300' : 'text-gray-300'}`}>
                          P{p.id} {p.title}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} /> {p.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filename Pattern */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
                  <Code size={18} className="text-[#fb7299]" />
                  Filename Pattern
                </h3>
                <input
                  type="text"
                  value={filenamePattern}
                  onChange={(e) => setFilenamePattern(e.target.value)}
                  className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2.5 text-gray-200 focus:outline-none focus:border-pink-500/50 mb-3 text-sm font-mono"
                />
                <div className="flex flex-wrap gap-2">
                  {['<videoTitle>', '<pageNumber>', '<pageTitle>', '<bvid>', '<res>', '<fps>'].map(v => (
                    <button
                      key={v}
                      onClick={() => addVariable(v)}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-2 py-1 rounded transition-colors border border-gray-700"
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Preview: <span className="text-gray-400 font-mono italic">{filenamePattern.replace('<videoTitle>', info.title).replace('<bvid>', info.bvid).replace('<pageNumber>', '1')}</span>.mp4
                </div>
              </div>

            </div>
          </div>

          {/* Download Action */}
          <div className="flex justify-end pt-4 sticky bottom-6 z-10">
            <button
              onClick={handleDownload}
              className="bg-[#fb7299] hover:bg-[#fc8bab] text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-[0_8px_30px_rgb(251,114,153,0.3)] flex items-center gap-3 hover:scale-105 active:scale-95 text-lg"
            >
              <Download size={24} />
              Start Download ({selectedPages.length} items)
            </button>
          </div>
        </div>
      )}

      {/* Progress Modal Overlay */}
      {isDownloading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Download className="text-pink-500" /> Downloading...
              </h3>
              <span className="text-pink-400 font-medium">{progress.step}</span>
            </div>

            {/* Video Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Video</span>
                <span className="text-gray-300">{progress.videoPercent}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300" style={{ width: `${progress.videoPercent}%` }} />
              </div>
            </div>

            {/* Audio Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Audio</span>
                <span className="text-gray-300">{progress.audioPercent}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300" style={{ width: `${progress.audioPercent}%` }} />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Speed</div>
                <div className="text-lg font-mono text-gray-200">{progress.speed}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">ETA</div>
                <div className="text-lg font-mono text-gray-200">{progress.eta}</div>
              </div>
            </div>

            {progress.step === 'Done!' && (
              <div className="pt-4 flex gap-3 animate-in slide-in-from-bottom-2">
                <button 
                  onClick={() => setIsDownloading(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
                <button 
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-medium transition-colors shadow-lg shadow-pink-500/20"
                >
                  Save to PC
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Styles for Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4B5563; }
      `}</style>
    </div>
  );
}
