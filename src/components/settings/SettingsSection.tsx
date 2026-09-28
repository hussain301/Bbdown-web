import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  icon,
  description,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl overflow-hidden mb-6 backdrop-blur-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 bg-zinc-800/50 rounded-lg text-pink-400">
            {icon}
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
            {description && (
              <p className="text-sm text-zinc-400 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <div className="text-zinc-500 p-2">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>
      
      <div 
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
      >
        <div className="p-5 border-t border-zinc-800/50">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
