import { motion } from 'framer-motion';
import { Crown, Tv, Speaker } from 'lucide-react';

export interface QualityOption {
  id: string;
  name: string;
  resolution?: string;
  codec?: string;
  fps?: number;
  bitrate?: string;
  size?: string;
  isVip?: boolean;
  tags?: string[]; // e.g. ['HDR', 'Dolby Vision']
  type: 'video' | 'audio';
}

interface QualityCardProps {
  videoQualities: QualityOption[];
  audioQualities: QualityOption[];
  selectedVideoId: string;
  selectedAudioId: string;
  onSelectVideo: (id: string) => void;
  onSelectAudio: (id: string) => void;
  disabledVideo?: boolean;
  disabledAudio?: boolean;
}

export default function QualityCard({
  videoQualities,
  audioQualities,
  selectedVideoId,
  selectedAudioId,
  onSelectVideo,
  onSelectAudio,
  disabledVideo = false,
  disabledAudio = false
}: QualityCardProps) {

  const getCodecColor = (codec?: string) => {
    if (!codec) return 'bg-gray-800 text-gray-400';
    if (codec.includes('AVC')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (codec.includes('HEVC')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (codec.includes('AV1')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (codec.includes('Dolby')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (codec.includes('FLAC')) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    return 'bg-gray-800 text-gray-300 border-gray-700';
  };

  const QualityRow = ({ option, isSelected, onSelect, disabled }: { option: QualityOption, isSelected: boolean, onSelect: () => void, disabled: boolean }) => (
    <motion.div
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      onClick={() => !disabled && onSelect()}
      className={`relative p-4 rounded-xl border flex items-center justify-between transition-all ${
        disabled 
          ? 'opacity-40 cursor-not-allowed border-gray-800 bg-gray-950 grayscale'
          : isSelected 
            ? 'border-[#fb7299] bg-[#fb7299]/5 shadow-[0_0_15px_rgba(251,114,153,0.1)] cursor-pointer' 
            : 'border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800/50 cursor-pointer'
      }`}
    >
      <div className="flex items-center space-x-4 flex-1">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#fb7299]' : 'border-gray-600'}`}>
          {isSelected && <div className="w-2.5 h-2.5 bg-[#fb7299] rounded-full" />}
        </div>
        
        <div className="flex flex-col flex-1">
          <div className="flex items-center space-x-2">
            <span className={`font-medium ${isSelected ? 'text-[#fb7299]' : 'text-gray-200'}`}>
              {option.name}
            </span>
            {option.isVip && (
              <Crown size={14} className="text-yellow-500" />
            )}
            {option.tags?.map(tag => (
              <span key={tag} className="text-[10px] uppercase font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {option.resolution && (
              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700 flex items-center gap-1">
                <Tv size={12}/> {option.resolution}
              </span>
            )}
            {option.codec && (
              <span className={`text-xs px-2 py-0.5 rounded border ${getCodecColor(option.codec)}`}>
                {option.codec}
              </span>
            )}
            {option.fps === 60 && (
              <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded">
                60FPS
              </span>
            )}
            {option.type === 'audio' && (
              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700 flex items-center gap-1">
                <Speaker size={12}/> Audio
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end text-xs text-gray-500 ml-4">
        {option.size && <span className="font-medium text-gray-400">{option.size}</span>}
        {option.bitrate && <span>{option.bitrate}</span>}
      </div>

      {/* Disabled Overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-gray-950/20 rounded-xl" />
      )}
    </motion.div>
  );

  return (
    <div className="bg-gray-950 rounded-2xl p-6 border border-gray-800 shadow-xl space-y-8">
      
      {/* Video Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
          <h3 className={`text-lg font-semibold flex items-center gap-2 ${disabledVideo ? 'text-gray-600' : 'text-white'}`}>
            <Tv className={disabledVideo ? 'text-gray-600' : 'text-[#fb7299]'} size={20} />
            Video Quality
          </h3>
          {disabledVideo && <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">Disabled (Audio Only)</span>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {videoQualities.map(q => (
            <QualityRow 
              key={q.id} 
              option={q} 
              isSelected={selectedVideoId === q.id} 
              onSelect={() => onSelectVideo(q.id)} 
              disabled={disabledVideo}
            />
          ))}
          {videoQualities.length === 0 && !disabledVideo && (
            <div className="col-span-full py-8 text-center text-gray-500 text-sm">No video qualities found.</div>
          )}
        </div>
      </div>

      {/* Audio Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
          <h3 className={`text-lg font-semibold flex items-center gap-2 ${disabledAudio ? 'text-gray-600' : 'text-white'}`}>
            <Speaker className={disabledAudio ? 'text-gray-600' : 'text-[#fb7299]'} size={20} />
            Audio Quality
          </h3>
          {disabledAudio && <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">Disabled (Video Only)</span>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {audioQualities.map(q => (
            <QualityRow 
              key={q.id} 
              option={q} 
              isSelected={selectedAudioId === q.id} 
              onSelect={() => onSelectAudio(q.id)} 
              disabled={disabledAudio}
            />
          ))}
          {audioQualities.length === 0 && !disabledAudio && (
            <div className="col-span-full py-8 text-center text-gray-500 text-sm">No audio qualities found.</div>
          )}
        </div>
      </div>

    </div>
  );
}
