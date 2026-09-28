import { useState } from 'react';
import { DownloadCloud, QrCode, Monitor, Film, Shield, Settings, FileText, CheckCircle2, Zap, Radio, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleQuickDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      navigate(`/download?url=${encodeURIComponent(url)}`);
    }
  };

  const featureCards = [
    {
      title: 'All Content Types',
      desc: 'Download Videos, Bangumi, Cheese courses, Collections, and Series with ease.',
      icon: Film,
      color: 'text-pink-400',
      bg: 'bg-pink-400/10'
    },
    {
      title: 'QR Code Login',
      desc: 'Securely scan with the Bilibili app. Supports Web & TV login APIs.',
      icon: QrCode,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      title: 'Quality Selection',
      desc: 'Grab the highest quality up to 8K, 4K, HDR, Dolby Vision, and Dolby Atmos.',
      icon: Monitor,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    {
      title: 'Multiple APIs',
      desc: 'Seamlessly switch between Web, TV, App, and International endpoints.',
      icon: Settings,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    {
      title: 'Subtitles & Danmaku',
      desc: 'Automatically download subtitles and bullet comments (Danmaku) for any video.',
      icon: FileText,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    },
    {
      title: 'Privacy First',
      desc: 'Everything runs and stays locally on your machine. No tracking, purely private.',
      icon: Shield,
      color: 'text-rose-400',
      bg: 'bg-rose-400/10'
    }
  ];

  const contentTypes = [
    '普通视频 (Normal Video)',
    '番剧 (Bangumi/Anime)',
    '电影 (Movies)',
    '课程 (Cheese Courses)',
    '收藏夹 (Favorites)',
    '合集 (Collections)',
    '系列 (Series)',
    '用户空间 (User Space)',
    '互动视频 (Interactive Video)'
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#12121a]/80 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-pink-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="relative z-10 px-8 py-16 md:py-24 text-center space-y-8 flex flex-col items-center">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fb7299] to-purple-500">
                BBDown Web
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 font-medium">
              Download Bilibili videos right in your browser
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              No server needed. No installation. Just paste and download.
            </p>
          </div>

          <form onSubmit={handleQuickDownload} className="w-full max-w-3xl flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#fb7299] transition-colors">
                <LinkIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.bilibili.com/video/BV..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-lg focus:outline-none focus:border-[#fb7299]/50 focus:ring-2 focus:ring-[#fb7299]/20 transition-all placeholder-gray-600 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#fb7299] to-pink-600 hover:from-pink-500 hover:to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_-5px_#fb7299] hover:shadow-[0_0_40px_-5px_#fb7299] flex items-center justify-center gap-2 group whitespace-nowrap"
            >
              <DownloadCloud size={24} className="group-hover:-translate-y-1 transition-transform" />
              Download
            </button>
          </form>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureCards.map((feature, i) => (
          <div key={i} className="group bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-3xl p-8 transition-all hover:bg-white/[0.05] hover:-translate-y-1">
            <div className={`${feature.bg} ${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
              <feature.icon size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-[#fb7299] transition-colors">
              {feature.title}
            </h3>
            <p className="text-gray-400 leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* How It Works */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px]"></div>
          <h2 className="text-2xl font-bold text-gray-100 mb-8 flex items-center gap-3">
            <Zap className="text-yellow-400" /> How It Works
          </h2>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#12121a] bg-[#fb7299] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <QrCode size={20} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white/5 p-4 rounded-2xl border border-white/5">
                <h4 className="font-bold text-gray-200 mb-1">1. Login</h4>
                <p className="text-sm text-gray-400">Scan QR code securely.</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#12121a] bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <FileText size={20} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white/5 p-4 rounded-2xl border border-white/5">
                <h4 className="font-bold text-gray-200 mb-1">2. Paste URL</h4>
                <p className="text-sm text-gray-400">Enter any Bilibili link.</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#12121a] bg-purple-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <DownloadCloud size={20} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white/5 p-4 rounded-2xl border border-white/5">
                <h4 className="font-bold text-gray-200 mb-1">3. Download</h4>
                <p className="text-sm text-gray-400">Select quality and save.</p>
              </div>
            </div>

          </div>
        </div>

        <div className="space-y-8">
          {/* Supported Content Types */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-3">
              <CheckCircle2 className="text-emerald-400" /> Supported Content Types
            </h2>
            <div className="flex flex-wrap gap-3">
              {contentTypes.map((type, i) => (
                <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-default">
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Supported Qualities */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-3">
              <Monitor className="text-blue-400" /> Supported Qualities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Visual Tiers</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2"><span className="text-yellow-400">🏆</span> 8K 超高清 (Ultra HD)</li>
                  <li className="flex items-center gap-2"><span className="text-cyan-400">💎</span> 杜比视界 (Dolby Vision)</li>
                  <li className="flex items-center gap-2"><span className="text-purple-400">🌈</span> HDR 真彩</li>
                  <li className="flex items-center gap-2"><span className="text-amber-400">⭐</span> 4K 超清</li>
                  <li className="flex items-center gap-2"><span className="text-gray-400">🎬</span> 1080P 高帧率 (60fps)</li>
                  <li className="flex items-center gap-2"><span className="text-gray-400">📺</span> 1080P 高码率</li>
                  <li className="flex items-center gap-2"><span className="text-gray-500">📱</span> 1080P / 720P / 480P / 360P</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Audio Tiers</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2"><span className="text-emerald-400">💿</span> Hi-Res FLAC (Lossless)</li>
                  <li className="flex items-center gap-2"><span className="text-blue-400">🎧</span> Dolby Atmos (EC-3)</li>
                  <li className="flex items-center gap-2"><span className="text-gray-400">🎵</span> Standard (AAC)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#12121a]/80 backdrop-blur-md border border-white/5 rounded-2xl text-xs text-gray-400 mt-12">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Backend Connected
          </div>
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-blue-400" />
            Proxy: Default
          </div>
        </div>
        <div className="flex items-center gap-6 mt-4 sm:mt-0">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-purple-400" />
            Status: Ready
          </div>
          <div className="font-mono bg-white/5 px-2 py-1 rounded">v1.0.0</div>
        </div>
      </div>
    </div>
  );
}
