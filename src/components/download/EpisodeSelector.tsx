import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckSquare, Square, Filter } from 'lucide-react';

export interface Episode {
  id: string;
  epNumber: number | string;
  title: string;
  duration?: string;
  badge?: string;
}

interface EpisodeSelectorProps {
  episodes: Episode[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
}

export default function EpisodeSelector({ episodes, selectedIds, onChange }: EpisodeSelectorProps) {
  const [rangeInput, setRangeInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const allSelected = episodes.length > 0 && selectedIds.length === episodes.length;

  const handleToggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(episodes.map(e => e.id));
    }
  };

  const handleToggleEpisode = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleSelectRange = () => {
    if (!rangeInput) return;
    const parts = rangeInput.split(',');
    const newSelected = new Set(selectedIds);

    parts.forEach(part => {
      part = part.trim();
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.min(start, end);
          const max = Math.max(start, end);
          episodes.forEach((ep, index) => {
            const num = index + 1; // 1-based index for range
            if (num >= min && num <= max) {
              newSelected.add(ep.id);
            }
          });
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num > 0 && num <= episodes.length) {
          newSelected.add(episodes[num - 1].id);
        }
      }
    });

    onChange(Array.from(newSelected));
    setRangeInput('');
  };

  const handleSelectLatest = () => {
    if (episodes.length > 0) {
      const latest = episodes[episodes.length - 1];
      if (!selectedIds.includes(latest.id)) {
        onChange([...selectedIds, latest.id]);
      }
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden text-gray-200 shadow-xl">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-white">Episodes</h3>
          <span className="bg-[#fb7299]/20 text-[#fb7299] text-xs px-2 py-1 rounded-full font-medium">
            {selectedIds.length} / {episodes.length} Selected
          </span>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
          <Filter size={18} className="text-gray-400" />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-800"
          >
            <div className="p-4 space-y-4">
              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleToggleAll}
                  className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  {allSelected ? <CheckSquare size={16} className="text-[#fb7299]" /> : <Square size={16} />}
                  <span>Select All</span>
                </button>
                <button
                  onClick={handleSelectLatest}
                  className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  Latest
                </button>
                
                <div className="flex-1 flex items-center space-x-2 min-w-[200px]">
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="e.g., 1-5, 8, 11-15"
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#fb7299] transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && handleSelectRange()}
                  />
                  <button
                    onClick={handleSelectRange}
                    className="bg-[#fb7299] hover:bg-[#fb7299]/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Select Range
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {episodes.map((ep) => {
                    const isSelected = selectedIds.includes(ep.id);
                    return (
                      <motion.div
                        key={ep.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleToggleEpisode(ep.id)}
                        className={`relative p-3 rounded-xl border cursor-pointer flex flex-col justify-between h-24 transition-all duration-200 ${
                          isSelected 
                            ? 'bg-[#fb7299]/10 border-[#fb7299] text-white shadow-[0_0_15px_rgba(251,114,153,0.15)]' 
                            : 'bg-gray-950 border-gray-800 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-medium text-gray-400">EP {ep.epNumber}</span>
                          {ep.duration && (
                            <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-gray-300">
                              {ep.duration}
                            </span>
                          )}
                        </div>
                        <div className={`text-sm font-medium line-clamp-2 mt-1 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {ep.title}
                        </div>
                        
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-[#fb7299] rounded-full p-0.5">
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                        
                        {ep.badge && !isSelected && (
                          <div className="absolute top-2 right-2 text-[9px] bg-blue-500/20 text-blue-400 px-1 rounded">
                            {ep.badge}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
