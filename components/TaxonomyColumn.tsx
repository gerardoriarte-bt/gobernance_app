
import React, { useMemo } from 'react';
import { ChevronDown, Info, Lock, AlertCircle, CheckCircle, Flame, Clipboard, HelpCircle } from 'lucide-react';
import { MASTER_SCHEMA } from '../constants';
import { useTaxonomyStore } from '../store/useTaxonomyStore';
import { TaxonomyLevel } from '../types';

interface TaxonomyColumnProps {
  level: TaxonomyLevel;
  title: string;
  description: string;
}

const TaxonomyColumn: React.FC<TaxonomyColumnProps> = ({ level, title, description }) => {
  const { campaignValues, adsetValues, adValues, setFieldValue, generatedStrings, dictionaries, structures } = useTaxonomyStore();
  
  const currentValues = level === 'campaign' ? campaignValues : level === 'adset' ? adsetValues : adValues;
  
  const structure = structures[level];
  const fields = structure.match(/\{(\w+)\}/g)?.map(f => f.slice(1, -1)) || [];
  
  const inputFields = fields.filter(f => !f.startsWith('parent'));
  
  const getOptions = (fieldName: string) => {
    const defaultOptions = dictionaries[fieldName] || [];
    const deps = MASTER_SCHEMA.dependencies[level as keyof typeof MASTER_SCHEMA.dependencies] || [];
    
    let filteredOptions = [...defaultOptions];
    
    deps.forEach(dep => {
      if (dep.filter === fieldName) {
        const triggerValue = currentValues[dep.field];
        if (triggerValue && dep.value.includes(triggerValue)) {
          filteredOptions = filteredOptions.filter(opt => dep.allow?.includes(opt));
        }
      }
    });
    
    return filteredOptions;
  };

  const isLocked = (fieldName: string) => {
    const deps = MASTER_SCHEMA.dependencies[level as keyof typeof MASTER_SCHEMA.dependencies] || [];
    return deps.some(dep => {
      const triggerValue = currentValues[dep.field];
      return dep.lock === fieldName && triggerValue && dep.value.includes(triggerValue);
    });
  };

  const validation = useMemo(() => {
    const missing = inputFields.filter(f => !currentValues[f]);
    const isValid = missing.length === 0;
    const progress = inputFields.length > 0 
      ? Math.round(((inputFields.length - missing.length) / inputFields.length) * 100) 
      : 100;
    
    return { isValid, missing, progress };
  }, [currentValues, inputFields]);

  return (
    <div className={`flex flex-col gap-6 bg-white p-6 rounded-[2.5rem] border-2 transition-all duration-500 shadow-xl h-full relative overflow-hidden ${
      validation.isValid 
        ? 'border-emerald-100 shadow-emerald-50/50' 
        : 'border-slate-100 shadow-slate-50'
    }`}>
      {validation.isValid && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
      )}

      <div className="flex justify-between items-start">
        <div className="group relative">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            {title}
            <HelpCircle size={14} className="text-slate-300 cursor-help" />
          </h2>
          <p className="text-xs text-slate-400 font-bold mt-1">{description}</p>
          
          {/* Tooltip Content */}
          <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-slate-900 text-white text-[10px] font-medium leading-relaxed rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 pointer-events-none">
            {level === 'campaign' && "Core identifiers for the media initiative. These values will propagate downstream to Ad Sets and Ads."}
            {level === 'adset' && "Defines targeting and placement. Ad Sets automatically include the Campaign prefix for structural integrity."}
            {level === 'ad' && "Final creative details. Includes format and variations. All names are automatically converted to PascalCase."}
            <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-900 rotate-45"></div>
          </div>
        </div>
        
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
          validation.isValid 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
            : 'bg-slate-50 border-slate-200 text-slate-400'
        }`}>
          {validation.isValid ? (
            <><CheckCircle size={12} /> Complete</>
          ) : (
            <><div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></div> {inputFields.length - validation.missing.length}/{inputFields.length}</>
          )}
        </div>
      </div>

      <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 ease-out ${
            validation.isValid ? 'bg-emerald-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${validation.progress}%` }}
        ></div>
      </div>

      <div className="space-y-5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {fields.map(field => {
          if (field.startsWith('parent')) return null;

          const options = getOptions(field);
          const locked = isLocked(field);
          const value = currentValues[field] || '';
          const hasError = !value && !locked;

          return (
            <div key={field} className="space-y-2 group relative">
              <div className="flex justify-between items-center">
                <label className={`text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-1 transition-colors ${
                  hasError ? 'text-red-400' : 'text-slate-400 group-focus-within:text-indigo-600'
                }`}>
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                  {locked && (
                    <div className="relative group/lock">
                      <Lock size={10} className="text-amber-500 cursor-help" />
                      <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover/lock:opacity-100 group-hover/lock:visible transition-all z-40 pointer-events-none">
                        Auto-locked by dependency rules
                        <div className="absolute -bottom-1 left-2 w-2 h-2 bg-amber-600 rotate-45"></div>
                      </div>
                    </div>
                  )}
                  {!locked && <span className="text-red-300 ml-0.5">*</span>}
                </label>
                {hasError && (
                  <span className="text-[9px] font-black text-red-400 uppercase tracking-tighter flex items-center gap-0.5 animate-in fade-in slide-in-from-right-1">
                    <AlertCircle size={10} /> Required
                  </span>
                )}
              </div>
              
              <div className="relative">
                {field === 'creativeVariation' || field === 'campaignName' ? (
                  <div className="relative">
                    <input
                      type="text"
                      list={`${level}-${field}-list`}
                      className={`w-full bg-slate-50 border-2 rounded-2xl py-3.5 px-4 text-xs font-bold focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all ${
                        locked 
                          ? 'cursor-not-allowed opacity-70 bg-slate-100 border-slate-100' 
                          : hasError 
                            ? 'border-red-50 hover:border-red-100' 
                            : 'border-slate-50 hover:border-indigo-100 group-hover:bg-white'
                      }`}
                      placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
                      value={value}
                      disabled={locked}
                      onChange={(e) => setFieldValue(level, field, e.target.value)}
                    />
                    <datalist id={`${level}-${field}-list`}>
                      {options.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      className={`w-full bg-slate-50 border-2 rounded-2xl py-3.5 px-4 pr-10 text-xs font-bold appearance-none focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all ${
                        locked 
                          ? 'cursor-not-allowed opacity-70 border-slate-100' 
                          : hasError
                            ? 'border-red-50 hover:border-red-100 cursor-pointer'
                            : 'border-slate-50 cursor-pointer hover:border-indigo-100 hover:bg-white'
                      }`}
                      disabled={locked}
                      value={value}
                      onChange={(e) => setFieldValue(level, field, e.target.value)}
                    >
                      <option value="" disabled className="text-slate-300">Choose Option...</option>
                      {options.map(opt => (
                        <option key={opt} value={opt} className="text-slate-700 font-bold">{opt}</option>
                      ))}
                    </select>
                    {!locked && (
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 transition-colors" size={16} />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-50">
        <div className={`rounded-3xl p-5 relative overflow-hidden group transition-all duration-500 ${
          validation.isValid 
            ? 'bg-slate-900 border-indigo-500 shadow-lg' 
            : 'bg-slate-50 border border-slate-100'
        }`}>
          {validation.isValid && (
            <div className="absolute top-0 right-0 p-3 z-10">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedStrings[level]);
                  alert('String copied to clipboard!');
                }}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white transition-all backdrop-blur-md relative group/copy"
                title="Copy to clipboard"
              >
                <Clipboard size={14} />
                <div className="absolute bottom-full right-0 mb-2 w-24 p-2 bg-slate-700 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover/copy:opacity-100 group-hover/copy:visible transition-all pointer-events-none">
                  Click to Copy
                  <div className="absolute -bottom-1 right-3 w-2 h-2 bg-slate-700 rotate-45"></div>
                </div>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              validation.isValid ? 'text-indigo-400' : 'text-slate-400'
            }`}>
              Convention Output
            </span>
            {validation.isValid && <Flame size={12} className="text-orange-400 animate-pulse" />}
          </div>

          <p className={`font-mono text-xs break-all leading-relaxed transition-colors ${
            validation.isValid ? 'text-white font-bold' : 'text-slate-300 italic'
          }`}>
            {generatedStrings[level] || `--- Required fields pending ---`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaxonomyColumn;
