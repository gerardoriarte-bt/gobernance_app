
import React, { useMemo } from 'react';
import { Calendar, CheckCircle, AlertCircle, Lock, Edit3, Clipboard, HelpCircle, ChevronDown } from 'lucide-react';
import { useTaxonomyStore } from '../store/useTaxonomyStore';
import { SUB_CHANNEL_OPTIONS } from '../constants';

const CIDColumn: React.FC = () => {
  const { 
    mediaOwner, 
    campaignValues, 
    adsetValues, 
    adValues, 
    setFieldValue, 
    generatedStrings 
  } = useTaxonomyStore();

  const launchDate = campaignValues['launchDate'] || '';
  
  // Helper to check if a field has a value
  const hasValue = (val: string | undefined) => val && val.length > 0;

  // Validation state
  const validation = useMemo(() => {
    const missing = [];
    if (!mediaOwner) missing.push('Media Owner');
    if (!campaignValues['subChannel']) missing.push('Sub-Channel');
    if (!launchDate) missing.push('Launch Date');
    // IDs are auto-generated but we should check if they exist?
    // They depend on provider selection.
    
    // Check if upstream is ready
    const isUpstreamReady = generatedStrings.campaign && generatedStrings.adset && generatedStrings.ad;
    
    return { 
        isValid: missing.length === 0 && isUpstreamReady, 
        missing 
    };
  }, [mediaOwner, launchDate, generatedStrings]);

  return (
    <div className={`flex flex-col gap-6 bg-slate-50 p-6 rounded-[2.5rem] border-2 transition-all duration-500 shadow-xl h-full relative overflow-hidden ${
      validation.isValid 
        ? 'border-indigo-500 shadow-indigo-50/50' 
        : 'border-slate-200 shadow-slate-50'
    }`}>
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="group relative">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            4. CID Control
            <HelpCircle size={14} className="text-slate-300 cursor-help" />
          </h2>
          <p className="text-xs text-slate-400 font-bold mt-1">Localization, Tracking & IDs.</p>
        </div>
        
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
          validation.isValid 
            ? 'bg-indigo-600 border-indigo-600 text-white' 
            : 'bg-slate-200 border-slate-300 text-slate-400'
        }`}>
          {validation.isValid ? (
            <><CheckCircle size={12} /> Ready</>
          ) : (
            <><div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></div> Pending</>
          )}
        </div>
      </div>

      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-4">
        <div 
          className={`h-full transition-all duration-700 ease-out ${
            validation.isValid ? 'bg-indigo-600' : 'bg-slate-400'
          }`}
          style={{ width: validation.isValid ? '100%' : '30%' }}
        ></div>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        
        {/* 1. Media Owner Context */}
        <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1">
                Media Owner Context
                <Lock size={10} className="text-slate-300" />
             </label>
             <div className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl py-3.5 px-4 text-xs font-bold text-slate-500 flex items-center justify-between">
                <span>{mediaOwner || 'Not Selected (Select in Header)'}</span>
                {mediaOwner && <span className="text-[9px] bg-slate-200 px-2 py-0.5 rounded text-slate-600 uppercase tracking-wider">Locked</span>}
             </div>
        </div>

        {/* 2. Sub-Channel Input */}
        <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1">
                Sub-Channel <span className="text-red-300 ml-0.5">*</span>
             </label>
             <div className="relative">
                <select
                   className={`w-full bg-white border-2 rounded-2xl py-3.5 px-4 pr-10 text-xs font-bold appearance-none outline-none transition-all ${
                      !campaignValues['subChannel'] ? 'border-red-50' : 'border-slate-200 hover:border-indigo-100'
                   }`}
                   value={campaignValues['subChannel'] || ''}
                   onChange={(e) => setFieldValue('campaign', 'subChannel', e.target.value)}
                 >
                    <option value="" disabled>Select Sub-Channel...</option>
                    {SUB_CHANNEL_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                 </select>
                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
             </div>
        </div>

        {/* 3. Launch Date Input */}
        <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1">
                Launch Date <span className="text-red-300 ml-0.5">*</span>
             </label>
             <div className="relative">
                <input 
                  type="date"
                  className={`w-full bg-white border-2 rounded-2xl py-3.5 px-4 text-xs font-bold focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all ${
                    !launchDate ? 'border-red-50 hover:border-red-100' : 'border-slate-200 hover:border-indigo-100'
                  }`}
                  value={launchDate ? 
                    // Convert stored DDMMYYYY to YYYY-MM-DD for input if needed, 
                    // OR if we store it as YYYY-MM-DD in the store?
                    // Previous logic in TaxonomyColumn converted input (YYYY-MM-DD) -> store (DDMMYYYY).
                    // In CIDColumn we should probably do the same reversable if possible.
                    // But simpler: just use a text input for DDMMYYYY or stick to date picker returning YYYY-MM-DD and formatting for string?
                    // Let's stick to the store value. If store has '15112024', date input won't understand it.
                    // We need to parse it back or just reset?
                    // Let's assume for now we clear it if invalid, or start fresh since it's a new column.
                    // Better: Store formatted in `campaignValues['launchDateFormatted']` and raw in `campaignValues['launchDate']`?
                    // Or just parse:
                    (launchDate.length === 8 ? `${launchDate.slice(4)}-${launchDate.slice(2,4)}-${launchDate.slice(0,2)}` : launchDate)
                    : ''
                  }
                  onChange={(e) => {
                       const date = e.target.value; // YYYY-MM-DD
                       if(date) {
                           const [y, m, d] = date.split('-');
                           const formatted = `${d}${m}${y}`;
                           setFieldValue('campaign', 'launchDate', formatted); // Store formatted for string generation
                       } else {
                           setFieldValue('campaign', 'launchDate', '');
                       }
                  }}
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
             </div>
             {launchDate && launchDate.length === 8 && (
                <div className="text-[10px] text-slate-400 font-mono text-right">
                    Formatted: {launchDate}
                </div>
             )}
        </div>

        {/* 3. Conditional IDs (Read-Only / Override?) */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Generated Identifiers</h4>
             
             {/* Campaign ID */}
             <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase">Campaign ID Token</label>
                 <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-[10px] font-mono text-indigo-700 break-all">
                     {campaignValues['campaignId'] || '---'}
                 </div>
             </div>

             {/* Ad Set ID */}
             <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase">Ad Set ID Token</label>
                 <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-[10px] font-mono text-indigo-700 break-all">
                     {adsetValues['adsetId'] || '---'}
                 </div>
             </div>

             {/* Ad ID */}
             <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase">Ad ID Token</label>
                 <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-[10px] font-mono text-indigo-700 break-all">
                     {adValues['adId'] || '---'}
                 </div>
             </div>
        </div>

      </div>

      {/* Footer / Final String Preview */}
      <div className="mt-auto pt-6 border-t border-slate-200">
        <div className="bg-slate-900 rounded-2xl p-4 relative overflow-hidden group">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Final CID</span>
                {validation.isValid && (
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(generatedStrings.cid);
                            alert('CID Copied!');
                        }}
                        className="text-white hover:text-indigo-400 transition-colors"
                    >
                        <Clipboard size={14} />
                    </button>
                )}
             </div>
             <p className="font-mono text-[10px] text-white leading-relaxed break-all">
                {generatedStrings.cid || '--- Pending ---'}
             </p>
        </div>
      </div>
    </div>
  );
};

export default CIDColumn;
