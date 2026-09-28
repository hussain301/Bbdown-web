import React, { useState, useEffect } from 'react';
import { ClipboardPaste, X, Check, Eye, EyeOff, Save } from 'lucide-react';

interface CookieInputProps {
  onSave: (cookie: string) => void;
  initialValue?: string;
}

const CookieInput: React.FC<CookieInputProps> = ({ onSave, initialValue = '' }) => {
  const [cookieValue, setCookieValue] = useState(initialValue);
  const [showMask, setShowMask] = useState(false); // Default show for ease of use
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Simple validation: SESSDATA should be reasonably long
    if (!cookieValue) {
      setIsValid(null);
    } else {
      setIsValid(cookieValue.length > 20);
    }
  }, [cookieValue]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCookieValue(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const handleSave = () => {
    if (isValid) {
      onSave(cookieValue.trim());
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <label className="block text-sm font-medium text-gray-400">
          SESSDATA Cookie
        </label>
        <span className="text-xs text-gray-500 font-mono">
          {cookieValue.length} chars
        </span>
      </div>

      <div className="relative group">
        <textarea
          value={cookieValue}
          onChange={(e) => setCookieValue(e.target.value)}
          placeholder="e.g. 1a2b3c4d%2C1234567890%2Cabcdef%2A11"
          className={`w-full bg-gray-900 border rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-colors resize-none h-32 ${
            isValid === false
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : isValid === true
              ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
              : 'border-gray-700 focus:border-pink-500 focus:ring-pink-500'
          } ${showMask ? 'font-mono' : 'text-security'}`}
          style={showMask ? { textSecurity: 'disc', WebkitTextSecurity: 'disc' } as any : {}}
        />

        {/* Status Icon */}
        <div className="absolute top-3 right-3 flex items-center justify-center w-6 h-6 rounded-full">
          {isValid === true && <Check className="w-4 h-4 text-green-500" />}
          {isValid === false && <X className="w-4 h-4 text-red-500" />}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handlePaste}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm border border-gray-700"
        >
          <ClipboardPaste className="w-4 h-4" />
          Paste
        </button>
        <button
          onClick={() => setShowMask(!showMask)}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-4 rounded-lg transition-colors border border-gray-700"
          title={showMask ? "Hide content" : "Show content"}
        >
          {showMask ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setCookieValue('')}
          className="bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-300 py-2 px-4 rounded-lg transition-colors border border-gray-700"
          title="Clear"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={!isValid}
        className="w-full mt-4 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-lg shadow-pink-500/20 disabled:shadow-none"
      >
        <Save className="w-5 h-5" />
        Save Cookie
      </button>
    </div>
  );
};

export default CookieInput;
