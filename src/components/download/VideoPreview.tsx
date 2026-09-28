
import { Play, Calendar, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

export interface VideoInfo {
  title: string;
  pic?: string;
  pubTime?: number;
  duration?: number;
  desc?: string;
  bvid?: string;
  author?: string;
  parts?: number;
}

export default function VideoPreview({ info }: { info: VideoInfo | null }) {
  if (!info) {
    return (
      <div className="w-full h-48 bg-slate-800/30 border-2 border-slate-700/50 border-dashed rounded-xl flex items-center justify-center text-slate-500 shadow-inner">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Play className="w-6 h-6 text-slate-500 ml-1" />
          </div>
          <p className="text-sm font-medium">Enter URL to preview video info</p>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm flex flex-col sm:flex-row shadow-xl"
    >
      <div className="relative sm:w-72 h-48 sm:h-auto bg-slate-900 shrink-0">
        {info.pic ? (
          <img src={info.pic} alt="Thumbnail" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-12 h-12 text-slate-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
          <Play className="w-14 h-14 text-white/90 drop-shadow-lg" />
        </div>
        {info.duration && (
          <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded shadow-lg">
            {formatDuration(info.duration)}
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow min-w-0">
        <h3 className="text-xl font-bold text-slate-100 truncate mb-1 shadow-sm" title={info.title}>{info.title}</h3>
        <p className="text-sm font-medium text-pink-400 mb-4">{info.author || 'Unknown Author'}</p>
        
        <div className="flex flex-wrap gap-2 text-xs text-slate-300 mb-4">
          {info.bvid && (
            <div className="flex items-center space-x-1.5 bg-slate-700/50 px-2.5 py-1.5 rounded-md border border-slate-600/50">
              <Hash className="w-3.5 h-3.5 text-pink-500" />
              <span>{info.bvid}</span>
            </div>
          )}
          {info.pubTime && (
            <div className="flex items-center space-x-1.5 bg-slate-700/50 px-2.5 py-1.5 rounded-md border border-slate-600/50">
              <Calendar className="w-3.5 h-3.5 text-pink-500" />
              <span>{new Date(info.pubTime * 1000).toLocaleDateString()}</span>
            </div>
          )}
          {info.parts && info.parts > 1 && (
            <div className="flex items-center space-x-1.5 bg-pink-500/20 text-pink-300 px-2.5 py-1.5 rounded-md border border-pink-500/30">
              <Hash className="w-3.5 h-3.5" />
              <span>{info.parts} Parts</span>
            </div>
          )}
        </div>
        
        {info.desc && (
          <p className="text-sm text-slate-400 line-clamp-3 mt-auto leading-relaxed">
            {info.desc}
          </p>
        )}
      </div>
    </motion.div>
  );
}
