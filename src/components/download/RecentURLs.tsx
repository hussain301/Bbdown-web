import { useEffect, useState } from 'react';
import { Clock, Trash2, ArrowRight } from 'lucide-react';

export interface RecentURL {
  url: string;
  type: string;
  timestamp: number;
}

export default function RecentURLs({ onSelect }: { onSelect: (url: string) => void }) {
  const [urls, setUrls] = useState<RecentURL[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('bbdown_recent_urls');
    if (stored) {
      try {
        setUrls(JSON.parse(stored));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const clearAll = () => {
    setUrls([]);
    localStorage.removeItem('bbdown_recent_urls');
  };

  const removeUrl = (timestamp: number) => {
    const updated = urls.filter(u => u.timestamp !== timestamp);
    setUrls(updated);
    localStorage.setItem('bbdown_recent_urls', JSON.stringify(updated));
  };

  if (urls.length === 0) {
    return (
      <div className="bg-slate-800/30 rounded-xl p-8 text-center border border-slate-700/50 shadow-inner">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Clock className="w-6 h-6 text-slate-500" />
        </div>
        <p className="text-sm text-slate-400">No recent downloads</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm flex flex-col h-full max-h-[600px] shadow-xl">
      <div className="p-5 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/80">
        <h3 className="font-bold text-slate-100 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-pink-500" />
          <span>Recent URLs</span>
        </h3>
        <button onClick={clearAll} className="text-xs text-slate-400 hover:text-red-400 transition-colors bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded">
          Clear All
        </button>
      </div>
      
      <div className="overflow-y-auto p-3 space-y-2">
        {urls.map((item) => (
          <div 
            key={item.timestamp} 
            className="group relative flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/60 transition-all cursor-pointer border border-transparent hover:border-slate-600/50" 
            onClick={() => onSelect(item.url)}
          >
            <div className="flex flex-col min-w-0 pr-10">
              <span className="text-sm text-slate-200 truncate mb-1.5">{item.url}</span>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30 px-1.5 py-0.5 rounded shadow-sm">{item.type || 'URL'}</span>
                <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="absolute right-3 opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); removeUrl(item.timestamp); }}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                className="p-1.5 text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 rounded transition-colors"
                title="Use URL"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
