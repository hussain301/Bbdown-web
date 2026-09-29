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

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setInfo(null);
    try {
      const parsed = parseInputUrl(url);
      const cookie = localStorage.getItem('BILI_SESSDATA') || undefined;
      const accessToken = localStorage.getItem('BILI_ACCESS_TOKEN') || undefined;
      
      let videoInfo;
      if (parsed.type === 'bangumi') {
        videoInfo = await fetchBangumiInfo(parsed.id, cookie);
      } else {
        videoInfo = await fetchVideoInfo(parsed.id, cookie);
      }
      
      // Get play URLs for first page
      const cid = videoInfo.pages[0]?.cid;
      if (cid) {
        const dash = await getPlayUrl(String(videoInfo.aid), String(cid), {
          useTvApi: apiMode === 'tv',
          cookie,
          accessToken,
        });
        const qualities = buildQualityOptions(dash);
        
        setInfo({
          title: videoInfo.title,
          author: videoInfo.ownerName,
          pic: videoInfo.pic,
          desc: videoInfo.desc,
          duration: formatDuration(videoInfo.duration),
          bvid: videoInfo.bvid,
          avid: 'av' + videoInfo.aid,
          pages: videoInfo.pages.map((p: any) => ({
            id: p.page,
            title: p.title,
            duration: formatDuration(p.duration),
            cid: p.cid,
          })),
          qualities: qualities.map((q: any) => ({
            id: String(q.qn),
            name: q.name,
            resolution: q.resolution,
            codec: q.codec,
            fps: parseInt(q.fps as any) || 30,
            size: q.estimatedSize,
            videoUrl: q.videoUrl,
            audioUrl: q.audioUrl,
          })),
          audioQualities: [],  // from dash.audioStreams if available
          dash,
        });
        if (qualities.length > 0) {
          setSelectedQuality(String(qualities[0].qn));
        }
        setSelectedPages([1]);
      }
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Failed to fetch video info'));
    } finally {
      setLoading(false);
    }
  };

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  const handleDownload = async () => {
    if (!info || !selectedQuality) return;
    setIsDownloading(true);
    
    try {
      const quality = info.qualities.find((q: any) => q.id === selectedQuality);
      if (!quality) throw new Error('Quality not found');
      
      const videoStreamUrl = getStreamUrl(quality.videoUrl);
      const audioStreamUrl = quality.audioUrl ? getStreamUrl(quality.audioUrl) : null;
      
      setProgress(p => ({ ...p, step: 'Downloading Video...', videoPercent: 0 }));
      
      const videoData = await downloadFile(videoStreamUrl, (prog: any) => {
        setProgress(p => ({ ...p, videoPercent: prog.percentage, speed: formatSpeed(prog.speed) }));
      });
      
      if (audioStreamUrl && !options.videoOnly) {
        setProgress(p => ({ ...p, step: 'Downloading Audio...', videoPercent: 100, audioPercent: 0 }));
        const audioData = await downloadFile(audioStreamUrl, (prog: any) => {
          setProgress(p => ({ ...p, audioPercent: prog.percentage, speed: formatSpeed(prog.speed) }));
        });
        
        setProgress(p => ({ ...p, step: 'Merging...', audioPercent: 100, mergePercent: 0 }));
        try {
          await loadFFmpeg((p: any) => setProgress(prev => ({ ...prev, mergePercent: p * 50 })));
          const merged = await mergeVideoAudio(videoData, audioData, `${info.title}.mp4`, (p: any) => {
            setProgress(prev => ({ ...prev, mergePercent: 50 + p * 50 }));
          });
          saveFileToPC(merged, `${info.title}.mp4`);
        } catch (ffmpegErr) {
          // ffmpeg failed (e.g., no SharedArrayBuffer on GitHub Pages)
          // Save video and audio separately
          console.warn('FFmpeg merge failed, saving separately:', ffmpegErr);
          saveFileToPC(videoData, `${info.title}_video.mp4`);
          saveFileToPC(audioData, `${info.title}_audio.m4a`, 'audio/mp4');
        }
      } else {
        // Video only or no audio
        saveFileToPC(videoData, `${info.title}.mp4`);
      }
      
      setProgress(p => ({ ...p, step: 'Done!', mergePercent: 100 }));
    } catch (err: any) {
      alert('Download failed: ' + (err.message || 'Unknown error'));
      setProgress(p => ({ ...p, step: 'Failed' }));
    } finally {
      setIsDownloading(false);
    }
  };

  function formatSpeed(bytesPerSec: number): string {
    if (bytesPerSec < 1024) return bytesPerSec.toFixed(0) + ' B/s';
    if (bytesPerSec < 1048576) return (bytesPerSec / 1024).toFixed(1) + ' KB/s';
    return (bytesPerSec / 1048576).toFixed(1) + ' MB/s';
  }

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
