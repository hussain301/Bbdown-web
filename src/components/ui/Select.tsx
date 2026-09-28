import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string | string[];
  onChange: (value: any) => void;
  multiple?: boolean;
  searchable?: boolean;
  placeholder?: string;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  multiple = false,
  searchable = false,
  placeholder = 'Select...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const valArray = Array.isArray(value) ? value : [];
      if (valArray.includes(optionValue)) {
        onChange(valArray.filter((v) => v !== optionValue));
      } else {
        onChange([...valArray, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const removeValue = (e: React.MouseEvent, valToRemove: string) => {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((v) => v !== valToRemove));
    }
  };

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderValue = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return <span className="text-zinc-500">{placeholder}</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {value.map(val => {
            const opt = options.find(o => o.value === val);
            return (
              <span key={val} className="flex items-center gap-1 bg-zinc-800 text-xs px-2 py-1 rounded-md border border-zinc-700">
                {opt?.label || val}
                <button onClick={(e) => removeValue(e, val)} className="hover:text-pink-400 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      );
    }
    
    if (!value || (typeof value === 'string' && value.length === 0)) {
      return <span className="text-zinc-500">{placeholder}</span>;
    }
    
    const selectedOpt = options.find(o => o.value === value);
    return <span>{selectedOpt?.label || value}</span>;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div 
        className="min-h-[42px] px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-colors focus-within:border-pink-500/50 focus-within:ring-1 focus-within:ring-pink-500/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 pr-2 truncate">
          {renderValue()}
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {searchable && (
            <div className="p-2 border-b border-zinc-800">
              <input
                type="text"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500/50"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-zinc-500 text-center">No options found</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = multiple 
                  ? Array.isArray(value) && value.includes(option.value)
                  : value === option.value;
                
                return (
                  <div
                    key={option.value}
                    className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors
                      ${isSelected ? 'bg-pink-500/10 text-pink-400' : 'text-zinc-300 hover:bg-zinc-800'}
                    `}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
