import React, { useState, useEffect } from 'react';
import { ClipboardPaste, X, Search } from 'lucide-react';

export interface URLInputProps {
  url: string;
  onChange: (url: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function URLInput({ url, onChange, onSubmit, loading }: URLInputProps) {
  const [detectedType, setDetectedType] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setDetectedType(null);
      return;
    }
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('ep') || lowerUrl.includes('ss') || lowerUrl.includes('bangumi')) {
      setDetectedType('Bangumi');
    } else if (lowerUrl.includes('cheese')) {
      setDetectedType('Cheese');
    } else if (lowerUrl.includes('fav')) {
      setDetectedType('Favorite');
    } else if (lowerUrl.includes('collection') || lowerUrl.includes('series')) {
      setDetectedType('Collection');
    } else if (lowerUrl.includes('av') || lowerUrl.includes('bv') || lowerUrl.includes('b23.tv') || lowerUrl.includes('video')) {
      setDetectedType('Video');
    } else {
      setDetectedType(null);
    }
  }, [url]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="w-full relative">
      <div className="relative flex items-center w-full">
        <input
          type="text"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste Bilibili URL, av/bv/ep/ss ID here..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-4 pl-12 pr-24 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all shadow-lg backdrop-blur-sm"
          disabled={loading}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {url && (
            <button
              onClick={() => onChange('')}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handlePaste}
            className="p-2 text-slate-400 hover:text-pink-400 transition-colors rounded-lg hover:bg-slate-700/50"
            title="Paste"
          >
            <ClipboardPaste className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {detectedType && (
        <div className="absolute -top-3 left-4 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 tracking-wide">
          {detectedType}
        </div>
      )}
    </div>
  );
}
