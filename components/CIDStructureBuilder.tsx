import React, { useState } from 'react';
import { X, GripVertical, Check, Plus, Trash2 } from 'lucide-react';
import { useTaxonomyStore } from '../store/useTaxonomyStore';

interface CIDStructureBuilderProps {
  onClose: () => void;
}

export const CIDStructureBuilder: React.FC<CIDStructureBuilderProps> = ({ onClose }) => {
  const { cidStructure, setCidStructure, dictionaries } = useTaxonomyStore();
  
  // Local state for the builder before saving
  const [currentStructure, setCurrentStructure] = useState<string[]>(cidStructure);
  
  // Available fields: Campaign Name, Media Owner, IDs, and any key in dictionaries (that belongs to campaign)
  // For simplicity, we'll list special keys + all keys from dictionaries for now?
  // Ideally we should list keys that are 'in' the taxonomy, or just available ones.
  
  const SPECIAL_FIELDS = [
      { key: 'campaignName', label: 'Campaign Name String' },
      { key: 'mediaOwner', label: 'Media Owner' },
      { key: 'campaignId', label: 'Campaign ID Token' },
      { key: 'adsetId', label: 'Ad Set ID Token' },
      { key: 'adId', label: 'Ad ID Token' }
  ];

  // Get other potential fields from dictionaries that are typically campaign level
  // Filtering might be tricky without explicit metadata, but we can list all available 'keys'
  // or just let user pick from a dropdown.
  
  const availableDictionaryKeys = Object.keys(dictionaries).filter(k => 
      !SPECIAL_FIELDS.find(sf => sf.key === k)
  );

  const toggleField = (key: string) => {
      if (currentStructure.includes(key)) {
          setCurrentStructure(currentStructure.filter(k => k !== key));
      } else {
          setCurrentStructure([...currentStructure, key]);
      }
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
      const newStructure = [...currentStructure];
      if (direction === 'up' && index > 0) {
          [newStructure[index], newStructure[index - 1]] = [newStructure[index - 1], newStructure[index]];
      } else if (direction === 'down' && index < newStructure.length - 1) {
          [newStructure[index], newStructure[index + 1]] = [newStructure[index + 1], newStructure[index]];
      }
      setCurrentStructure(newStructure);
  };

  const getLabel = (key: string) => {
      const special = SPECIAL_FIELDS.find(sf => sf.key === key);
      return special ? special.label : key.replace(/([A-Z])/g, ' $1').trim(); // Basic formatting
  };

  const handleSave = () => {
      setCidStructure(currentStructure);
      onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Configure CID Sequence</h2>
            <p className="text-xs text-slate-500 font-bold mt-1">Define the exact order of fields for the Final CID string.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col md:flex-row gap-8">
            
            {/* Left: Active Sequence (Orderable) */}
            <div className="flex-1 flex flex-col gap-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                    Active Sequence
                    <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-[9px]">{currentStructure.length}</span>
                </h3>
                
                <div className="bg-slate-50 rounded-2xl border-2 border-slate-200/60 p-2 space-y-2 min-h-[300px]">
                    {currentStructure.map((key, index) => (
                        <div key={key} className="group relative bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all select-none">
                             <div className="text-slate-300 cursor-grab active:cursor-grabbing hover:text-indigo-400">
                                 <GripVertical size={16} />
                             </div>
                             <div className="flex-1">
                                 <span className="text-xs font-bold text-slate-700">{getLabel(key)}</span>
                                 <code className="block text-[9px] text-slate-400 mt-0.5 font-mono">{key}</code>
                             </div>
                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                    onClick={() => moveField(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                                 >
                                     ▲
                                 </button>
                                 <button 
                                    onClick={() => moveField(index, 'down')}
                                    disabled={index === currentStructure.length - 1}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                                 >
                                     ▼
                                 </button>
                                 <button 
                                    onClick={() => toggleField(key)}
                                    className="p-1 hover:bg-red-50 rounded text-slate-300 hover:text-red-500 ml-1"
                                 >
                                     <Trash2 size={14} />
                                 </button>
                             </div>
                        </div>
                    ))}
                    {currentStructure.length === 0 && (
                        <div className="h-full flex items-center justify-center text-xs text-slate-400 py-10 italic">
                            No fields selected. CID will be empty.
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Available Fields */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Available Fields</h3>
                 
                 <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                     
                     {/* Standard / Special */}
                     <div className="space-y-2">
                         <label className="text-[9px] font-bold text-slate-400 uppercase">Core Tokens</label>
                         {SPECIAL_FIELDS.map((field) => (
                             !currentStructure.includes(field.key) && (
                                 <button 
                                    key={field.key}
                                    onClick={() => toggleField(field.key)}
                                    className="w-full text-left bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 p-2 rounded-lg flex items-center gap-2 group transition-all"
                                 >
                                     <Plus size={14} className="text-indigo-500" />
                                     <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-700">{field.label}</span>
                                 </button>
                             )
                         ))}
                     </div>

                     {/* Custom / Dictionary */}
                     <div className="space-y-2 pt-2 border-t border-slate-200">
                         <label className="text-[9px] font-bold text-slate-400 uppercase">Input Fields</label>
                         {availableDictionaryKeys.map((key) => (
                             !currentStructure.includes(key) && (
                                 <button 
                                    key={key}
                                    onClick={() => toggleField(key)}
                                    className="w-full text-left bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 p-2 rounded-lg flex items-center gap-2 group transition-all"
                                 >
                                     <Plus size={14} className="text-slate-400 group-hover:text-indigo-500" />
                                     <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-700">{getLabel(key)}</span>
                                 </button>
                             )
                         ))}
                     </div>
                 </div>
            </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center gap-2"
          >
            <Check size={16} /> Save Sequence
          </button>
        </div>

      </div>
    </div>
  );
};
