import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AddTaskOptions } from '../../types';

export interface DownloadOptionsProps {
  options: Partial<AddTaskOptions>;
  onChange: (options: Partial<AddTaskOptions>) => void;
}

const DEFAULT_OPTIONS: Partial<AddTaskOptions> = {
  UseTvApi: false,
  UseAppApi: false,
  UseIntlApi: false,
  VideoOnly: false,
  AudioOnly: false,
  DownloadDanmaku: false,
  SkipSubtitle: false,
  SkipCover: false,
  MultiThread: true,
  ForceHttp: false,
  SelectPage: '',
  FilePattern: '<videoTitle>',
  WorkDir: '',
  EncodingPriority: 'hevc,av1,avc',
  DfnPriority: '8K,4K,1080P60,1080P,720P'
};

export default function DownloadOptions({ options, onChange }: DownloadOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateOption = (key: keyof AddTaskOptions, value: any) => {
    onChange({ ...options, [key]: value });
  };

  const handleApiChange = (apiType: string) => {
    updateOption('UseTvApi', apiType === 'tv');
    updateOption('UseAppApi', apiType === 'app');
    updateOption('UseIntlApi', apiType === 'intl');
  };

  const currentApi = options.UseTvApi ? 'tv' : options.UseAppApi ? 'app' : options.UseIntlApi ? 'intl' : 'web';

  const resetToDefaults = () => {
    onChange(DEFAULT_OPTIONS);
  };

  return (
    <div className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm shadow-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-slate-200 hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-pink-500" />
          <span className="font-semibold text-lg">Advanced Options</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-700/50"
          >
            <div className="p-6 space-y-8">
              {/* API Mode */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">API Mode</h3>
                <div className="flex flex-wrap gap-4">
                  {[
                    { id: 'web', label: 'Web API' },
                    { id: 'tv', label: 'TV API' },
                    { id: 'app', label: 'App API' },
                    { id: 'intl', label: 'Intl API' }
                  ].map(api => (
                    <label key={api.id} className="flex items-center space-x-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="apiMode"
                        checked={currentApi === api.id}
                        onChange={() => handleApiChange(api.id)}
                        className="text-pink-500 focus:ring-pink-500 bg-slate-700 border-slate-600 w-4 h-4"
                      />
                      <span className="text-slate-300 group-hover:text-white transition-colors">{api.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Content Selection */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Content</h3>
                  <div className="space-y-3">
                    <Toggle label="Video Only" checked={!!options.VideoOnly} onChange={(v) => updateOption('VideoOnly', v)} />
                    <Toggle label="Audio Only" checked={!!options.AudioOnly} onChange={(v) => updateOption('AudioOnly', v)} />
                    <Toggle label="Download Danmaku" checked={!!options.DownloadDanmaku} onChange={(v) => updateOption('DownloadDanmaku', v)} />
                    <Toggle label="Skip Subtitles" checked={!!options.SkipSubtitle} onChange={(v) => updateOption('SkipSubtitle', v)} />
                    <Toggle label="Skip Cover" checked={!!options.SkipCover} onChange={(v) => updateOption('SkipCover', v)} />
                  </div>
                </div>

                {/* Performance & Settings */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Performance</h3>
                  <div className="space-y-3">
                    <Toggle label="Multi-threaded Download" checked={!!options.MultiThread} onChange={(v) => updateOption('MultiThread', v)} />
                    <Toggle label="Force HTTP" checked={!!options.ForceHttp} onChange={(v) => updateOption('ForceHttp', v)} />
                  </div>
                  
                  <div className="pt-4 space-y-3">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Page Selection</h3>
                    <input
                      type="text"
                      value={options.SelectPage || ''}
                      onChange={(e) => updateOption('SelectPage', e.target.value)}
                      placeholder="e.g. ALL, 1-5, 1,3,5, LAST, LATEST"
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-pink-500 outline-none transition-shadow"
                    />
                    <p className="text-xs text-slate-500">Syntax: ALL, 1, 1-5, 1,3,5, LAST, LATEST</p>
                  </div>
                </div>
              </div>

              {/* Advanced Text Inputs */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">File Pattern</h3>
                  <input
                    type="text"
                    value={options.FilePattern || ''}
                    onChange={(e) => updateOption('FilePattern', e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-pink-500 outline-none transition-shadow"
                  />
                  <div className="flex flex-wrap gap-2 pt-2">
                    {['<videoTitle>', '<pageNumber>', '<pageTitle>', '<bvid>'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => updateOption('FilePattern', (options.FilePattern || '') + tag)}
                        className="px-3 py-1 bg-slate-700/50 hover:bg-pink-500/20 hover:text-pink-300 border border-slate-600 rounded-full text-xs text-slate-300 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Working Directory</h3>
                  <input
                    type="text"
                    value={options.WorkDir || ''}
                    onChange={(e) => updateOption('WorkDir', e.target.value)}
                    placeholder="Leave empty to use backend default directory"
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-pink-500 outline-none transition-shadow"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-700/50">
                <button
                  onClick={resetToDefaults}
                  className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors border border-slate-700"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset to Defaults</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (c: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-pink-500' : 'bg-slate-600'}`}>
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
    </label>
  );
}
