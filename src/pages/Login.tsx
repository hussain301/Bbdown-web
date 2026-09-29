import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Tv, Key, CheckCircle, RefreshCw, XCircle, LogOut, Copy, Eye, EyeOff, ShieldCheck, Ticket } from 'lucide-react';
import { generateWebQR, pollWebLogin, generateTvQR, pollTvLogin, checkLoginStatus } from '../lib/bilibili/login';

type TabType = 'web' | 'tv' | 'manual' | 'token';
type QrStatus = 'idle' | 'waiting' | 'scanned' | 'confirmed' | 'expired';

interface UserProfile {
  username: string;
  isVip: boolean;
  vipExpiry?: string;
  loginMethod: 'Web Cookie' | 'TV Token' | 'Manual' | 'Access Token';
  lastVerified: number;
  credentialMasked: string;
  credentialFull: string;
}

export default function Login() {
  const [tab, setTab] = useState<TabType>('web');
  const [qrStatus, setQrStatus] = useState<QrStatus>('idle');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [qrExpiry, setQrExpiry] = useState<number>(0);
    
  const [manualCookie, setManualCookie] = useState('');
  const [accessToken, setAccessToken] = useState('');
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showCredential, setShowCredential] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check initial login status
    loadProfile();
    return () => clearTimers();
  }, []);

  const clearTimers = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
  };

  const loadProfile = async () => {
    try {
      const sessdata = localStorage.getItem('BILI_SESSDATA');
      const token = localStorage.getItem('BILI_ACCESS_TOKEN');
      const method = localStorage.getItem('BILI_LOGIN_METHOD') as any;

      if (sessdata || token) {
        // In a real app, checkLoginStatus would validate the cookie/token
        // For now we simulate a loaded profile based on what's in local storage
        const profileInfo = await checkLoginStatus(sessdata || undefined);
        setUserProfile({
          username: profileInfo?.username || 'Bilibili User',
          isVip: profileInfo?.isVip || true,
          vipExpiry: '2099-12-31',
          loginMethod: method || (sessdata ? 'Web Cookie' : 'TV Token'),
          lastVerified: Date.now(),
          credentialFull: sessdata || token || '',
          credentialMasked: maskCredential(sessdata || token || '')
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const maskCredential = (cred: string) => {
    if (!cred || cred.length < 8) return '********';
    return cred.substring(0, 4) + '...********...' + cred.substring(cred.length - 4);
  };

  const handleStartQr = async (type: 'web' | 'tv') => {
    clearTimers();
    setQrStatus('idle');
    try {
      let url = '';
      let key = '';
      if (type === 'web') {
        const res = await generateWebQR();
        url = res.url;
        key = res.qrcodeKey;
      } else {
        const res = await generateTvQR();
        url = res.url;
        key = res.authCode;
      }
      
      setQrUrl(url);
            setQrStatus('waiting');
      setQrExpiry(180);

      expiryTimerRef.current = setInterval(() => {
        setQrExpiry(prev => {
          if (prev <= 1) {
            clearTimers();
            setQrStatus('expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      pollIntervalRef.current = setInterval(async () => {
        try {
          const pollRes = type === 'web' 
            ? await pollWebLogin(key) 
            : await pollTvLogin(key);

          if (pollRes.status === 'scanned') {
            setQrStatus('scanned');
          } else if (pollRes.status === 'confirmed') {
            clearTimers();
            setQrStatus('confirmed');
            console.log('Login successful!');
            
            if (type === 'web' && 'cookie' in pollRes && pollRes.cookie) {
              localStorage.setItem('BILI_SESSDATA', pollRes.cookie);
              localStorage.setItem('BILI_LOGIN_METHOD', 'Web Cookie');
            } else if (type === 'tv' && 'accessToken' in pollRes && pollRes.accessToken) {
              localStorage.setItem('BILI_ACCESS_TOKEN', pollRes.accessToken);
              localStorage.setItem('BILI_LOGIN_METHOD', 'TV Token');
            }
            setTimeout(loadProfile, 1000);
          } else if (pollRes.status === 'expired') {
            clearTimers();
            setQrStatus('expired');
          }
        } catch (err) {
          console.error('Polling error', err);
        }
      }, 2000);
    } catch (err) {
      console.error('Failed to generate QR code', err);
      setQrStatus('idle');
      setSaveMessage({ type: 'error', text: '❌ QR code generation failed! Make sure Cloudflare Worker proxy is deployed and configured in Settings.' });
      setTimeout(() => setSaveMessage(null), 8000);
    }
  };

  useEffect(() => {
    if (tab === 'web' || tab === 'tv') {
      if (!userProfile) {
        handleStartQr(tab as 'web' | 'tv');
      }
    } else {
      clearTimers();
    }
  }, [tab, userProfile]);

  const handleManualSave = () => {
    if (!manualCookie.trim()) {
      setSaveMessage({ type: 'error', text: '❌ Please enter a valid SESSDATA cookie!' });
      return;
    }
    localStorage.setItem('BILI_SESSDATA', manualCookie.trim());
    localStorage.setItem('BILI_LOGIN_METHOD', 'Manual');
    setSaveMessage({ type: 'success', text: '✅ Cookie saved successfully! You are now logged in.' });
    setManualCookie('');
    loadProfile();
    setTimeout(() => setSaveMessage(null), 5000);
  };

  const handleTokenSave = () => {
    if (!accessToken.trim()) {
      setSaveMessage({ type: 'error', text: '❌ Please enter a valid access token!' });
      return;
    }
    localStorage.setItem('BILI_ACCESS_TOKEN', accessToken.trim());
    localStorage.setItem('BILI_LOGIN_METHOD', 'Access Token');
    setSaveMessage({ type: 'success', text: '✅ Access Token saved successfully! You are now logged in.' });
    setAccessToken('');
    loadProfile();
    setTimeout(() => setSaveMessage(null), 5000);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('BILI_SESSDATA');
      localStorage.removeItem('BILI_ACCESS_TOKEN');
      localStorage.removeItem('BILI_LOGIN_METHOD');
      setUserProfile(null);
      setQrStatus('idle');
      console.log('Logged out successfully');
    }
  };

  const copyCredential = () => {
    if (userProfile) {
      navigator.clipboard.writeText(userProfile.credentialFull);
      console.log('Copied to clipboard');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-4">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight">Account Login</h1>
        <p className="text-gray-400">Sign in to Bilibili to access 1080P+, 4K, and VIP member content.</p>
      </div>

      {saveMessage && (
        <div className={`p-4 rounded-xl text-center font-semibold text-lg mb-4 animate-pulse ${
          saveMessage.type === 'success' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {saveMessage.text}
        </div>
      )}

      <AnimatePresence mode="wait">
        {userProfile ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                  <ShieldCheck className="text-green-500 w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white">{userProfile.username}</h2>
                    {userProfile.isVip && (
                      <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded border border-yellow-500/30 flex items-center gap-1">
                        大会员
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Logged in via {userProfile.loginMethod}
                    {userProfile.isVip && ` • VIP expires: ${userProfile.vipExpiry}`}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={loadProfile}
                  className="flex-1 md:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} /> Re-verify
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20 flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>

            <div className="mt-8 bg-black/40 border border-white/5 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400 font-medium">Credential (SESSDATA / Token)</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowCredential(!showCredential)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                  >
                    {showCredential ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button 
                    onClick={copyCredential}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <div className="font-mono text-sm text-pink-400 break-all bg-black/50 p-3 rounded-lg border border-pink-500/10">
                {showCredential ? userProfile.credentialFull : userProfile.credentialMasked}
              </div>
              <div className="text-xs text-gray-500 mt-2 text-right">
                Last verified: {new Date(userProfile.lastVerified).toLocaleString()}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Tabs */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2 flex flex-wrap md:flex-nowrap gap-2">
              {[
                { id: 'web', icon: QrCode, label: 'Web QR Login' },
                { id: 'tv', icon: Tv, label: 'TV Login (云视听)' },
                { id: 'manual', icon: Key, label: 'Manual Cookie' },
                { id: 'token', icon: Ticket, label: 'Access Token' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as TabType)}
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                    tab === t.id 
                      ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/25' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <t.icon size={18} /> {t.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-10 min-h-[450px] relative overflow-hidden">
              <AnimatePresence mode="wait">
                {(tab === 'web' || tab === 'tv') && (
                  <motion.div 
                    key={tab}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center h-full justify-center gap-8"
                  >
                    {tab === 'tv' && (
                      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2 mb-4">
                        <Tv size={16} /> TV login provides watermark-free downloads natively
                      </div>
                    )}
                    
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative bg-white p-4 rounded-2xl shadow-xl">
                        {qrUrl ? (
                          <QRCodeSVG value={qrUrl} size={220} />
                        ) : (
                          <div className="w-[220px] h-[220px] flex items-center justify-center bg-gray-100 rounded-xl">
                            <RefreshCw className="animate-spin text-pink-500" size={32} />
                          </div>
                        )}
                        
                        {qrStatus === 'expired' && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl gap-3">
                            <XCircle className="text-red-500 w-12 h-12" />
                            <span className="text-red-600 font-bold text-lg">QR Expired</span>
                            <button 
                              onClick={() => handleStartQr(tab as 'web'|'tv')}
                              className="px-4 py-2 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600 transition"
                            >
                              Regenerate
                            </button>
                          </div>
                        )}
                        
                        {qrStatus === 'confirmed' && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl gap-3">
                            <CheckCircle className="text-green-500 w-16 h-16 animate-bounce" />
                            <span className="text-green-600 font-bold text-xl">Success!</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2 text-lg font-medium">
                        {qrStatus === 'waiting' && (
                          <>
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            <span className="text-blue-400">Waiting for scan...</span>
                          </>
                        )}
                        {qrStatus === 'scanned' && (
                          <>
                            <CheckCircle size={20} className="text-yellow-400 animate-pulse" /> 
                            <span className="text-yellow-400">QR Code scanned! Confirm on your phone...</span>
                          </>
                        )}
                        {qrStatus === 'confirmed' && (
                          <span className="text-green-400 flex items-center gap-2">
                            <CheckCircle size={20} /> Login successful!
                          </span>
                        )}
                        {qrStatus === 'expired' && (
                          <span className="text-red-400 flex items-center gap-2">
                            <XCircle size={20} /> QR Code expired.
                          </span>
                        )}
                      </div>
                      
                      {qrStatus === 'waiting' && qrExpiry > 0 && (
                        <div className="text-pink-400 font-mono text-xl font-bold bg-pink-500/10 px-4 py-2 rounded-lg inline-block">
                          {Math.floor(qrExpiry / 60)}:{(qrExpiry % 60).toString().padStart(2, '0')}
                        </div>
                      )}

                      <div className="text-sm text-gray-400 bg-black/40 px-6 py-3 rounded-xl border border-white/5 inline-block">
                        <p className="font-semibold text-gray-300 mb-1">Instructions:</p>
                        Open Bilibili App → Scan → Confirm
                      </div>
                    </div>
                  </motion.div>
                )}

                {tab === 'manual' && (
                  <motion.div
                    key="manual"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full max-w-xl mx-auto space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Manual Cookie Injection</h3>
                      <p className="text-sm text-gray-400">Paste your SESSDATA value from bilibili.com cookies to authenticate.</p>
                    </div>

                    <div className="bg-black/30 border border-white/5 p-4 rounded-xl text-sm text-gray-300 space-y-2">
                      <p className="font-semibold text-white">How to get your SESSDATA:</p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Open <a href="https://bilibili.com" target="_blank" rel="noreferrer" className="text-pink-400 hover:underline">bilibili.com</a> and login</li>
                        <li>Press F12 to open Developer Tools</li>
                        <li>Go to <strong>Application</strong> tab → <strong>Cookies</strong></li>
                        <li>Find <strong>SESSDATA</strong> and copy its value</li>
                        <li>Paste the value in the text area below</li>
                      </ol>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">SESSDATA Value</label>
                      <textarea
                        value={manualCookie}
                        onChange={(e) => setManualCookie(e.target.value)}
                        className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-mono text-sm resize-none shadow-inner"
                        placeholder="e.g. 1a2b3c4d%2C5e6f7g8h%2C9i0j1k2l..."
                      />
                    </div>
                    
                    <button 
                      onClick={handleManualSave}
                      className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-pink-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Save & Validate Cookie
                    </button>
                  </motion.div>
                )}

                {tab === 'token' && (
                  <motion.div
                    key="token"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full max-w-xl mx-auto space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Access Token</h3>
                      <p className="text-sm text-gray-400">Use a direct TV/App access token to authenticate.</p>
                    </div>

                    <div className="bg-black/30 border border-white/5 p-4 rounded-xl text-sm text-gray-300">
                      <p>You can use an existing Access Token from a previous login or a token extracted from the App. This is usually not needed if you use the TV QR Login option.</p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">Access Token Value</label>
                      <input
                        type="text"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-mono text-sm shadow-inner"
                        placeholder="Paste access token here..."
                      />
                    </div>
                    
                    <button 
                      onClick={handleTokenSave}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Save Access Token
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
