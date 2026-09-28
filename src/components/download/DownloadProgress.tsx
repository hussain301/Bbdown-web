import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Film, Music, Type, CheckCircle, AlertTriangle, ArrowLeft, Loader2, Sparkles, FolderDown } from 'lucide-react';
import StepIndicator, { Step } from '../common/StepIndicator';

interface DownloadProgressProps {
  status: 'fetching' | 'selecting' | 'downloading_video' | 'downloading_audio' | 'downloading_subtitles' | 'merging' | 'completed' | 'error';
  progressData: {
    videoProgress: number;
    videoSpeed: string;
    videoDownloaded: string;
    videoTotal: string;
    audioProgress: number;
    audioSpeed: string;
    audioDownloaded: string;
    audioTotal: string;
    subtitlesProgress: number;
    mergeProgress: number;
    fileName: string;
    errorMsg?: string;
  };
  onRetry?: () => void;
  onBack?: () => void;
  onSave?: () => void;
}

export default function DownloadProgress({ status, progressData, onRetry, onBack, onSave }: DownloadProgressProps) {
  
  const steps: Step[] = useMemo(() => [
    { id: 'fetch', label: 'Fetch Info', status: status === 'fetching' ? 'active' : 'completed' },
    { id: 'select', label: 'Select Quality', status: status === 'selecting' ? 'active' : (status === 'fetching' ? 'idle' : 'completed') },
    { id: 'dl_video', label: 'Video', status: status === 'downloading_video' ? 'active' : (['fetching', 'selecting'].includes(status) ? 'idle' : 'completed') },
    { id: 'dl_audio', label: 'Audio', status: status === 'downloading_audio' ? 'active' : (['downloading_subtitles', 'merging', 'completed'].includes(status) ? 'completed' : 'idle') },
    { id: 'dl_sub', label: 'Subtitles', status: status === 'downloading_subtitles' ? 'active' : (['merging', 'completed'].includes(status) ? 'completed' : 'idle') },
    { id: 'merge', label: 'Merge', status: status === 'merging' ? 'active' : (status === 'completed' ? 'completed' : 'idle') },
    { id: 'done', label: 'Done', status: status === 'error' ? 'error' : status === 'completed' ? 'completed' : 'idle' }
  ], [status]);

  const ProgressBar = ({ progress, colorClass, gradientClass, label, icon: Icon, speed, downloaded, total }: any) => (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <Icon size={18} className={colorClass} />
          <span className="font-medium text-gray-200">{label}</span>
        </div>
        <span className="text-sm font-medium text-white">{Math.round(progress * 100)}%</span>
      </div>
      
      <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden mb-2">
        <motion.div 
          className={`h-full rounded-full bg-gradient-to-r ${gradientClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ ease: "linear" }}
        />
      </div>
      
      {(speed || downloaded) && (
        <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
          <span>{speed}</span>
          <span>{downloaded} {total ? `/ ${total}` : ''}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Stepper */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl mb-8">
        <StepIndicator steps={steps} />
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4"
        >
          {status === 'error' && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 flex flex-col items-center text-center">
              <AlertTriangle size={48} className="text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Download Failed</h3>
              <p className="text-red-400 mb-6">{progressData.errorMsg || 'An unknown error occurred during download.'}</p>
              <div className="flex space-x-4">
                <button onClick={onRetry} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Retry Download
                </button>
                <button onClick={onBack} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Go Back
                </button>
              </div>
            </div>
          )}

          {['downloading_video', 'downloading_audio', 'downloading_subtitles', 'merging'].includes(status) && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-white break-all">{progressData.fileName}</h2>
                <p className="text-sm text-gray-400 mt-1">Downloading in progress...</p>
              </div>

              {['downloading_video', 'downloading_audio', 'downloading_subtitles', 'merging'].includes(status) && (
                 <ProgressBar 
                   progress={progressData.videoProgress} 
                   colorClass="text-blue-400"
                   gradientClass="from-blue-600 to-[#fb7299]"
                   label="Video Stream"
                   icon={Film}
                   speed={progressData.videoSpeed}
                   downloaded={progressData.videoDownloaded}
                   total={progressData.videoTotal}
                 />
              )}

              {['downloading_audio', 'downloading_subtitles', 'merging'].includes(status) && (
                 <ProgressBar 
                   progress={progressData.audioProgress} 
                   colorClass="text-green-400"
                   gradientClass="from-green-600 to-emerald-400"
                   label="Audio Stream"
                   icon={Music}
                   speed={progressData.audioSpeed}
                   downloaded={progressData.audioDownloaded}
                   total={progressData.audioTotal}
                 />
              )}

              {['downloading_subtitles', 'merging'].includes(status) && (
                 <ProgressBar 
                   progress={progressData.subtitlesProgress} 
                   colorClass="text-purple-400"
                   gradientClass="from-purple-600 to-purple-400"
                   label="Subtitles & Extras"
                   icon={Type}
                 />
              )}

              {status === 'merging' && (
                <div className="bg-[#fb7299]/10 border border-[#fb7299]/30 rounded-xl p-6 text-center mt-6">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="inline-block mb-3">
                    <Loader2 size={32} className="text-[#fb7299]" />
                  </motion.div>
                  <h3 className="text-lg font-medium text-white">Merging Video and Audio...</h3>
                  <p className="text-sm text-gray-400 mt-2">This may take a moment depending on your device performance.</p>
                  <div className="w-full max-w-md mx-auto mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#fb7299]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressData.mergeProgress * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'completed' && (
            <div className="bg-gradient-to-b from-[#fb7299]/20 to-gray-900 border border-[#fb7299]/30 rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.1, scale: 1 }}
                  transition={{ duration: 1 }}
                  className="absolute -top-20 -right-20 w-64 h-64 bg-[#fb7299] rounded-full blur-3xl"
                />
              </div>

              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 relative z-10"
              >
                <CheckCircle size={48} className="text-green-500" />
              </motion.div>
              
              <h3 className="text-3xl font-bold text-white mb-2 relative z-10 flex items-center gap-2">
                Download Complete! <Sparkles className="text-yellow-400" size={24} />
              </h3>
              <p className="text-gray-300 mb-8 max-w-md relative z-10 break-all">
                {progressData.fileName} has been successfully downloaded and processed.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md relative z-10">
                <button 
                  onClick={onSave}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-[#fb7299] to-[#ff98b5] hover:opacity-90 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#fb7299]/30 transition-all hover:scale-105"
                >
                  <FolderDown size={24} />
                  <span>Save to Device</span>
                </button>
              </div>

              <button 
                onClick={onBack}
                className="mt-6 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors relative z-10"
              >
                <ArrowLeft size={16} />
                <span>Download Another Video</span>
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Ensure AnimatePresence is available
import { AnimatePresence } from 'framer-motion';
