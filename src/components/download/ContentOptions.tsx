import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Video, Headphones, Type, MessageSquare, Image as ImageIcon, Sparkles } from 'lucide-react';

export interface ContentOptionsData {
  downloadVideo: boolean;
  downloadAudio: boolean;
  videoOnly: boolean;
  audioOnly: boolean;
  downloadSubtitles: boolean;
  downloadDanmaku: boolean;
  downloadCover: boolean;
  skipAiSubtitles: boolean;
}

interface ContentOptionsProps {
  options: ContentOptionsData;
  onChange: (options: ContentOptionsData) => void;
}

export default function ContentOptions({ options, onChange }: ContentOptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (key: keyof ContentOptionsData) => {
    const newOptions = { ...options, [key]: !options[key] };

    // Handle mutual exclusions
    if (key === 'videoOnly' && newOptions.videoOnly) {
      newOptions.audioOnly = false;
      newOptions.downloadAudio = false;
      newOptions.downloadVideo = true;
    }
    if (key === 'audioOnly' && newOptions.audioOnly) {
      newOptions.videoOnly = false;
      newOptions.downloadVideo = false;
      newOptions.downloadAudio = true;
    }
    
    // Normal audio/video toggles logic
    if (key === 'downloadVideo' && !newOptions.downloadVideo && !newOptions.downloadAudio) {
      newOptions.downloadAudio = true; // prevent both off
    }
    if (key === 'downloadAudio' && !newOptions.downloadAudio && !newOptions.downloadVideo) {
      newOptions.downloadVideo = true; // prevent both off
    }

    if (newOptions.downloadVideo && newOptions.downloadAudio) {
      newOptions.videoOnly = false;
      newOptions.audioOnly = false;
    }

    onChange(newOptions);
  };

  const ToggleSwitch = ({ 
    label, 
    checked, 
    disabled = false, 
    icon: Icon,
    onChange 
  }: { 
    label: string; 
    checked: boolean; 
    disabled?: boolean;
    icon: any;
    onChange: () => void;
  }) => (
    <div 
      className={`flex items-center justify-between p-3 rounded-xl border ${disabled ? 'opacity-50 cursor-not-allowed border-gray-800 bg-gray-900' : 'cursor-pointer hover:bg-gray-800/50 border-gray-800 bg-gray-950'} transition-all`}
      onClick={() => !disabled && onChange()}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${checked ? 'bg-[#fb7299]/20 text-[#fb7299]' : 'bg-gray-800 text-gray-400'}`}>
          <Icon size={18} />
        </div>
        <span className="text-sm font-medium text-gray-200">{label}</span>
      </div>
      <div className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-[#fb7299]' : 'bg-gray-700'}`}>
        <motion.div 
          className="absolute top-1 left-1 bg-white w-3 h-3 rounded-full shadow-sm"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <Settings2 size={20} className="text-[#fb7299]" />
          <h3 className="text-lg font-semibold text-white">Content Options</h3>
        </div>
        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
          {isExpanded ? 'Collapse' : 'Expand'}
        </span>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-800"
          >
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Media Streams</h4>
                <ToggleSwitch 
                  label="Download Video" 
                  checked={options.downloadVideo} 
                  onChange={() => handleToggle('downloadVideo')}
                  icon={Video}
                  disabled={options.videoOnly || options.audioOnly}
                />
                <ToggleSwitch 
                  label="Download Audio" 
                  checked={options.downloadAudio} 
                  onChange={() => handleToggle('downloadAudio')}
                  icon={Headphones}
                  disabled={options.videoOnly || options.audioOnly}
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div 
                    onClick={() => handleToggle('videoOnly')}
                    className={`text-center py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${options.videoOnly ? 'bg-[#fb7299] text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    Video Only
                  </div>
                  <div 
                    onClick={() => handleToggle('audioOnly')}
                    className={`text-center py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${options.audioOnly ? 'bg-[#fb7299] text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    Audio Only
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Extras</h4>
                <ToggleSwitch 
                  label="Download Subtitles" 
                  checked={options.downloadSubtitles} 
                  onChange={() => handleToggle('downloadSubtitles')}
                  icon={Type}
                />
                <AnimatePresence>
                  {options.downloadSubtitles && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-8"
                    >
                      <ToggleSwitch 
                        label="Skip AI Subtitles" 
                        checked={options.skipAiSubtitles} 
                        onChange={() => handleToggle('skipAiSubtitles')}
                        icon={Sparkles}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <ToggleSwitch 
                  label="Download Danmaku" 
                  checked={options.downloadDanmaku} 
                  onChange={() => handleToggle('downloadDanmaku')}
                  icon={MessageSquare}
                />
                <ToggleSwitch 
                  label="Download Cover" 
                  checked={options.downloadCover} 
                  onChange={() => handleToggle('downloadCover')}
                  icon={ImageIcon}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
