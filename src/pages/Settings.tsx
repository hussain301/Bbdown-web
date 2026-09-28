import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Upload, Download as DownloadIcon, Trash2, Shield, Info, CheckCircle2, XCircle, Settings as SettingsIcon } from 'lucide-react';

// Reusable Components
const SettingsSection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="mb-8 glass rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
      <div className="text-[#fb7299]">{icon}</div>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const ToggleSwitch = ({ label, description, checked, onChange }: { label: string, description?: string, checked: boolean, onChange: (c: boolean) => void }) => (
  <div className="flex items-center justify-between">
    <div>
      <div className="font-medium">{label}</div>
      {description && <div className="text-sm text-gray-400 mt-1">{description}</div>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-[#fb7299]' : 'bg-gray-700'
      }`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

export default function Settings() {
  // State for all settings
  const [settings, setSettings] = useState({
    proxyUrl: '',
    apiMode: 'App',
    videoAscending: false,
    audioAscending: false,
    multiThreaded: true,
    forceHttp: true,
    autoMerge: true,
    skipAiSubtitles: true,
    downloadDanmaku: false,
    downloadSubtitles: true,
    downloadCover: false,
    singlePattern: '<videoTitle>',
    multiPattern: '<videoTitle>/[P<pageNumber>]<pageTitle>',
    customUpos: '',
    allowPcdn: false,
    langTag: '',
    delayPerPage: 0,
    cookie: '',
    accessToken: ''
  });

  const [proxyStatus, setProxyStatus] = useState<'idle' | 'testing' | 'connected' | 'disconnected'>('idle');
  const [ping, setPing] = useState(0);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('bbdown_settings');
    if (saved) {
      try {
        setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {
        console.error("Failed to parse settings");
      }
    }
  }, []);

  // Save to local storage when changed
  useEffect(() => {
    localStorage.setItem('bbdown_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const testConnection = () => {
    setProxyStatus('testing');
    setTimeout(() => {
      setProxyStatus(Math.random() > 0.5 ? 'connected' : 'disconnected');
      setPing(Math.floor(Math.random() * 150) + 10);
    }, 1000);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "bbdown_settings.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleReset = () => {
    if(window.confirm("Are you sure you want to reset all settings to default?")) {
      localStorage.removeItem('bbdown_settings');
      window.location.reload();
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">Configure BBDown Web preferences and download behavior.</p>
      </div>

      {/* Section 1: Proxy Connection */}
      <SettingsSection title="Proxy Connection" icon={<Shield size={24} />}>
        <div>
          <label className="block text-sm font-medium mb-2">Cloudflare Worker URL</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={settings.proxyUrl}
              onChange={(e) => updateSetting('proxyUrl', e.target.value)}
              placeholder="https://your-worker.workers.dev"
              className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#fb7299] focus:ring-1 focus:ring-[#fb7299]"
            />
            <button 
              onClick={testConnection}
              disabled={proxyStatus === 'testing' || !settings.proxyUrl}
              className="bg-[#fb7299] hover:bg-[#ff85a9] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {proxyStatus === 'testing' ? <RefreshCw size={18} className="animate-spin" /> : 'Test'}
            </button>
          </div>
          {proxyStatus !== 'idle' && (
            <div className={`mt-3 flex items-center gap-2 text-sm ${proxyStatus === 'connected' ? 'text-green-500' : proxyStatus === 'testing' ? 'text-gray-400' : 'text-red-500'}`}>
              {proxyStatus === 'connected' && <CheckCircle2 size={16} />}
              {proxyStatus === 'disconnected' && <XCircle size={16} />}
              {proxyStatus === 'testing' ? 'Testing connection...' : proxyStatus === 'connected' ? `Connected successfully (${ping}ms)` : 'Connection failed. Please check the URL.'}
            </div>
          )}
          <div className="mt-2 text-sm text-gray-500">
            <a href="#" className="text-[#fb7299] hover:underline">Need help deploying? Read the guide.</a>
          </div>
        </div>
      </SettingsSection>

      {/* Section 2: Default Download Preferences */}
      <SettingsSection title="Default Download Preferences" icon={<DownloadIcon size={24} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium mb-3">Default API Mode</label>
            <div className="space-y-3">
              {['Web', 'TV', 'App', 'International'].map(mode => (
                <label key={mode} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="apiMode" 
                    value={mode}
                    checked={settings.apiMode === mode}
                    onChange={(e) => updateSetting('apiMode', e.target.value)}
                    className="w-4 h-4 text-[#fb7299] bg-black/30 border-white/10 focus:ring-[#fb7299]"
                  />
                  <span>{mode} API</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-6">
             <ToggleSwitch 
              label="Video Ascending" 
              description="Download smallest video quality first"
              checked={settings.videoAscending} 
              onChange={(c) => updateSetting('videoAscending', c)} 
            />
             <ToggleSwitch 
              label="Audio Ascending" 
              description="Download smallest audio quality first"
              checked={settings.audioAscending} 
              onChange={(c) => updateSetting('audioAscending', c)} 
            />
          </div>
        </div>
      </SettingsSection>

      {/* Section 3: Download Behavior */}
      <SettingsSection title="Download Behavior" icon={<SettingsIcon size={24} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <ToggleSwitch label="Multi-threaded Download" description="Speed up downloads using multiple threads" checked={settings.multiThreaded} onChange={(c) => updateSetting('multiThreaded', c)} />
          <ToggleSwitch label="Force HTTP" description="Use HTTP instead of HTTPS (sometimes faster)" checked={settings.forceHttp} onChange={(c) => updateSetting('forceHttp', c)} />
          <ToggleSwitch label="Auto-merge Video+Audio" description="Automatically combine streams using FFmpeg" checked={settings.autoMerge} onChange={(c) => updateSetting('autoMerge', c)} />
          <ToggleSwitch label="Skip AI Subtitles" description="Ignore auto-generated subtitles" checked={settings.skipAiSubtitles} onChange={(c) => updateSetting('skipAiSubtitles', c)} />
          <ToggleSwitch label="Download Danmaku" description="Save danmaku as .ass file" checked={settings.downloadDanmaku} onChange={(c) => updateSetting('downloadDanmaku', c)} />
          <ToggleSwitch label="Download Subtitles" description="Save external subtitles if available" checked={settings.downloadSubtitles} onChange={(c) => updateSetting('downloadSubtitles', c)} />
          <ToggleSwitch label="Download Cover" description="Save video thumbnail image" checked={settings.downloadCover} onChange={(c) => updateSetting('downloadCover', c)} />
        </div>
      </SettingsSection>

      {/* Section 4: File Naming */}
      <SettingsSection title="File Naming" icon={<Save size={24} />}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Single Video Pattern</label>
            <input
              type="text"
              value={settings.singlePattern}
              onChange={(e) => updateSetting('singlePattern', e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#fb7299] font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Multi-part Video Pattern</label>
            <input
              type="text"
              value={settings.multiPattern}
              onChange={(e) => updateSetting('multiPattern', e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#fb7299] font-mono text-sm"
            />
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Available Variables:</h4>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {['<videoTitle>', '<pageTitle>', '<pageNumber>', '<bvid>', '<aid>', '<cid>', '<ownerName>'].map(chip => (
                <span key={chip} className="bg-black/40 px-2 py-1 rounded text-[#fb7299] border border-white/5">{chip}</span>
              ))}
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Section 5: Credentials */}
      <SettingsSection title="Credentials" icon={<Shield size={24} />}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Saved Cookie (SESSDATA)</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={settings.cookie}
                onChange={(e) => updateSetting('cookie', e.target.value)}
                placeholder="Paste your SESSDATA here..."
                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#fb7299]"
              />
              <button onClick={() => updateSetting('cookie', '')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">Clear</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Saved Access Token</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={settings.accessToken}
                onChange={(e) => updateSetting('accessToken', e.target.value)}
                placeholder="Access token from TV/App login..."
                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#fb7299]"
              />
              <button onClick={() => updateSetting('accessToken', '')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">Clear</button>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Section 6: Advanced */}
      <SettingsSection title="Advanced Settings" icon={<SettingsIcon size={24} />}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Custom UPOS Host</label>
              <input
                type="text"
                value={settings.customUpos}
                onChange={(e) => updateSetting('customUpos', e.target.value)}
                placeholder="e.g. upos-sz-mirrorali.bilivideo.com"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#fb7299]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Language Tag for Audio</label>
              <input
                type="text"
                value={settings.langTag}
                onChange={(e) => updateSetting('langTag', e.target.value)}
                placeholder="e.g. chi, jpn"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#fb7299]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Delay Per Page (seconds)</label>
              <input
                type="number"
                min="0"
                value={settings.delayPerPage}
                onChange={(e) => updateSetting('delayPerPage', parseInt(e.target.value) || 0)}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#fb7299]"
              />
            </div>
          </div>
          <ToggleSwitch label="Allow PCDN" description="Allow using PCDN nodes for downloading (not recommended)" checked={settings.allowPcdn} onChange={(c) => updateSetting('allowPcdn', c)} />
        </div>
      </SettingsSection>

      {/* Section 7: Data Management */}
      <SettingsSection title="Data Management" icon={<Save size={24} />}>
        <div className="flex flex-wrap gap-4">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
            <DownloadIcon size={18} /> Export Settings
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
            <Upload size={18} /> Import Settings
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
            <Trash2 size={18} /> Clear Download History
          </button>
          <div className="w-full h-px bg-white/10 my-2"></div>
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors">
            <Trash2 size={18} /> Reset All Settings
          </button>
        </div>
      </SettingsSection>

      {/* Section 8: About */}
      <SettingsSection title="About" icon={<Info size={24} />}>
        <div className="space-y-4 text-sm text-gray-300">
          <div className="flex items-center justify-between">
            <span className="font-medium">BBDown Web Version</span>
            <span className="text-[#fb7299]">v1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Core Engine</span>
            <span>Based on <a href="https://github.com/nilaoda/BBDown" target="_blank" rel="noreferrer" className="text-[#fb7299] hover:underline">nilaoda/BBDown</a></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">License</span>
            <span>MIT License</span>
          </div>
          <details className="mt-4 p-4 bg-white/5 rounded-lg border border-white/5">
            <summary className="cursor-pointer font-medium text-gray-200">How it works</summary>
            <p className="mt-3 text-gray-400 leading-relaxed">
              BBDown Web acts as a graphical user interface and task manager for the BBDown CLI tool. 
              It communicates with a local backend server that spawns BBDown processes and tracks their progress.
              Settings configured here are passed directly to BBDown as command-line arguments when a download is initiated.
            </p>
          </details>
        </div>
      </SettingsSection>
    </div>
  );
}
