import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Shield, ShieldAlert, LogOut, CheckCircle2, User, Key, Globe, Eye, EyeOff, Copy } from 'lucide-react';

const LoginStatusCard: React.FC = () => {
  const { isLoggedIn, username, vipStatus, loginType, cookie, accessToken, logout, checkLoginStatus } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    await checkLoginStatus();
    setTimeout(() => setIsVerifying(false), 800);
  };

  const handleCopy = () => {
    const val = loginType === 'web' ? cookie : accessToken;
    if (val) {
      navigator.clipboard.writeText(val);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-gray-500" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-white mb-1">Not Logged In</h3>
          <p className="text-sm text-gray-400">Login to unlock high-quality downloads.</p>
        </div>
      </div>
    );
  }

  const getLoginTypeIcon = () => {
    switch (loginType) {
      case 'web': return <Globe className="w-3 h-3" />;
      case 'tv': return <Key className="w-3 h-3" />;
      default: return <Shield className="w-3 h-3" />;
    }
  };

  const getLoginTypeName = () => {
    switch (loginType) {
      case 'web': return 'Web Cookie';
      case 'tv': return 'TV Token';
      case 'manual': return 'Manual Auth';
      default: return 'Unknown';
    }
  };

  const secretValue = loginType === 'web' ? cookie : accessToken;
  const maskedSecret = secretValue ? `${secretValue.substring(0, 8)}...${secretValue.substring(secretValue.length - 8)}` : '';

  return (
    <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-6 overflow-hidden relative shadow-xl">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      
      <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* Avatar/Status */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/20">
            <span className="text-3xl font-bold text-white uppercase">{username ? username[0] : <User className="w-10 h-10" />}</span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gray-900 rounded-full p-1 border border-gray-700">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-white truncate">{username || 'Authenticated User'}</h2>
            {vipStatus && (
              <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-xs px-2 py-0.5 rounded-full font-medium">
                {vipStatus}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
            <span className="flex items-center gap-1.5 text-pink-400 bg-pink-400/10 px-2.5 py-1 rounded-md border border-pink-400/20">
              {getLoginTypeIcon()}
              {getLoginTypeName()}
            </span>
            <span className="text-gray-400 text-xs">
              Status: <span className="text-green-400 font-medium">Active</span>
            </span>
          </div>

          {/* Credential display */}
          <div className="mt-4 p-3 bg-gray-900/80 rounded-lg border border-gray-700/50 flex items-center gap-3">
            <span className="text-gray-500 font-mono text-xs truncate flex-1">
              {showSecret ? secretValue : maskedSecret}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={() => setShowSecret(!showSecret)}
                className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors"
                title={showSecret ? "Hide" : "Reveal"}
              >
                {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={handleCopy}
                className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-700 transition-colors relative"
                title="Copy"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full md:w-auto shrink-0 mt-4 md:mt-0">
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full md:w-32 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              'Verify Status'
            )}
          </button>
          <button
            onClick={logout}
            className="w-full md:w-32 py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginStatusCard;
