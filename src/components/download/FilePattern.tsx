import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileCode2, RotateCcw } from 'lucide-react';

interface FilePatternProps {
  value: string;
  onChange: (value: string) => void;
  isMultiPart?: boolean;
}

const VARIABLES = [
  '<videoTitle>', '<pageNumber>', '<pageNumberWithZero>', '<pageTitle>',
  '<bvid>', '<aid>', '<cid>',
  '<dfn>', '<res>', '<fps>',
  '<videoCodecs>', '<videoBandwidth>',
  '<audioCodecs>', '<audioBandwidth>',
  '<ownerName>', '<ownerMid>',
  '<publishDate>', '<videoDate>',
  '<apiType>'
];

const DEFAULT_SINGLE = '<videoTitle>';
const DEFAULT_MULTI = '<videoTitle>_P<pageNumberWithZero>_<pageTitle>';

const SAMPLE_DATA: Record<string, string> = {
  '<videoTitle>': 'Amazing Bilibili Video',
  '<pageNumber>': '1',
  '<pageNumberWithZero>': '01',
  '<pageTitle>': 'Part 1 Intro',
  '<bvid>': 'BV1xx411c7mD',
  '<aid>': '12345678',
  '<cid>': '87654321',
  '<dfn>': '1080P 高清',
  '<res>': '1920x1080',
  '<fps>': '60',
  '<videoCodecs>': 'AVC',
  '<videoBandwidth>': '3000',
  '<audioCodecs>': 'AAC',
  '<audioBandwidth>': '320',
  '<ownerName>': 'UploaderName',
  '<ownerMid>': '998877',
  '<publishDate>': '2023-10-01',
  '<videoDate>': '2023-10-01',
  '<apiType>': 'TV'
};

export default function FilePattern({ value, onChange, isMultiPart = false }: FilePatternProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    let result = value || '';
    Object.entries(SAMPLE_DATA).forEach(([key, val]) => {
      result = result.replace(new RegExp(key, 'g'), val);
    });
    setPreview(result + '.mp4');
  }, [value]);

  const insertVariable = (variable: string) => {
    if (!inputRef.current) {
      onChange(value + variable);
      return;
    }

    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const newValue = value.substring(0, start) + variable + value.substring(end);
    onChange(newValue);
    
    // Set focus back and adjust cursor position
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newPos = start + variable.length;
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleReset = () => {
    onChange(isMultiPart ? DEFAULT_MULTI : DEFAULT_SINGLE);
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileCode2 size={20} className="text-[#fb7299]" />
          <h3 className="text-lg font-semibold text-white">Filename Pattern</h3>
        </div>
        <button 
          onClick={handleReset}
          className="text-sm text-gray-400 hover:text-white flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded"
        >
          <RotateCcw size={14} />
          <span>Reset Default</span>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter file naming pattern..."
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#fb7299] focus:ring-1 focus:ring-[#fb7299] transition-all"
          />
        </div>

        <div className="bg-gray-950/50 p-3 rounded-lg border border-gray-800/50">
          <div className="text-xs text-gray-500 mb-1">Preview:</div>
          <div className="text-sm text-gray-300 font-mono break-all">
            {preview || '...'}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Variables</div>
          <div className="flex flex-wrap gap-2">
            {VARIABLES.map((v) => (
              <motion.button
                key={v}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => insertVariable(v)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs font-mono transition-colors border border-gray-700"
              >
                {v}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
