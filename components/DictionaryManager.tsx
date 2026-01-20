
import React, { useState } from 'react';
import { 
  Database, Plus, X, ListFilter, Trash2, FolderPlus, Globe, 
  CheckCircle2, Circle, Layers, Target, Rocket, Settings2, 
  ArrowRight, Info, Eye, EyeOff, HelpCircle
} from 'lucide-react';
import { useTaxonomyStore } from '../store/useTaxonomyStore';
import { TaxonomyLevel } from '../types';
import { sanitizeCategoryId } from '../utils/naming';
import { useAuthStore } from '../store/useAuthStore';


const DictionaryManager: React.FC = () => {
  const { 
    dictionaries, 
    addDictionaryItem, 
    deleteDictionaryItem, 
    addDictionaryCategory, 
    deleteDictionaryCategory,
    toggleCategoryInLevel,
    isFieldInLevel
  } = useTaxonomyStore();

  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  
  const fields = Object.keys(dictionaries);
  const [selectedField, setSelectedField] = useState<string>(fields[0] || '');
  const [newItemValue, setNewItemValue] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemValue.trim() && selectedField) {
      addDictionaryItem(selectedField, newItemValue.trim());
      setNewItemValue('');
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (name) {
      const sanitized = sanitizeCategoryId(name);
      addDictionaryCategory(name);
      setSelectedField(sanitized);
      setNewCategoryName('');
    }
  };

  const handleDeleteCategory = (field: string) => {
    if (confirm(`Are you sure you want to delete the category "${readableLabel(field)}"? All items inside will be lost.`)) {
      deleteDictionaryCategory(field);
      if (selectedField === field) {
        const remaining = Object.keys(dictionaries).filter(k => k !== field);
        setSelectedField(remaining[0] || '');
      }
    }
  };

  const readableLabel = (field: string) => {
    return field.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
  };

  const getActiveLevelsCount = (field: string) => {
    return (['campaign', 'adset', 'ad'] as TaxonomyLevel[]).filter(l => isFieldInLevel(field, l)).length;
  };

  // Helper component for mini level indicators
  const LevelIndicators = ({ field, isSelected }: { field: string, isSelected: boolean }) => {
    const levels: { id: TaxonomyLevel, color: string, icon: any }[] = [
      { id: 'campaign', color: 'bg-indigo-500', icon: Rocket },
      { id: 'adset', color: 'bg-emerald-500', icon: Target },
      { id: 'ad', color: 'bg-amber-500', icon: Layers },
    ];

    return (
      <div className="flex gap-1 mt-1.5">
        {levels.map(lvl => {
          const active = isFieldInLevel(field, lvl.id);
          const Icon = lvl.icon;
          return (
            <div 
              key={lvl.id}
              className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                active 
                  ? `${lvl.color} text-white scale-110 shadow-sm ring-1 ring-white/20` 
                  : isSelected ? 'bg-white/10 text-white/20' : 'bg-slate-200 text-slate-400 opacity-40'
              }`}
              title={active ? `Mapped to ${lvl.id}` : `Not mapped to ${lvl.id}`}
            >
              <Icon size={8} strokeWidth={3} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden border-t-8 border-t-amber-500">
      {/* Top Header Section */}
      <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <div className="flex items-center gap-2 mb-1 group relative">
               <Globe className="text-amber-500" size={20} />
               <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Naming Architecture & Governance</span>
               <HelpCircle size={14} className="text-slate-300 cursor-help" />
               
               <div className="absolute left-0 top-full mt-2 w-72 p-4 bg-slate-900 text-white text-[10px] font-medium leading-relaxed rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  Manage the dictionaries and structures that define how media names are constructed globally.
                  <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-900 rotate-45"></div>
               </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">Define your naming DNA and where it propagates across your media operations.</p>
         </div>
         <div className="flex items-center gap-2 px-4 py-2 bg-amber-100/50 rounded-2xl border border-amber-200">
            <Settings2 size={16} className="text-amber-600" />
            <span className="text-[11px] font-black text-amber-700 uppercase tracking-tight">Standard v2.1</span>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[700px]">
        {/* Sidebar: Category Master List */}
        <div className="w-full lg:w-80 bg-slate-50/30 border-r border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100">
            {isAdmin ? (
              <>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                  Create New DNA Segment
                  <div className="group relative">
                    <Info size={10} className="text-slate-300 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-slate-800 text-white text-[9px] font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      Segments are data categories like 'Region', 'Product', or 'Vendor'.
                    </div>
                  </div>
                </label>
                <form onSubmit={handleAddCategory} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Category Name..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95 shrink-0"
                  >
                    <FolderPlus size={18} />
                  </button>
                </form>
              </>
            ) : (
               <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3 opacity-70">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400">
                     <Settings2 size={16} />
                  </div>
                  <div>
                     <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">DNA Structure</span>
                     <span className="block text-[10px] font-bold text-slate-500">Read-Only Mode</span>
                  </div>
               </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            <div className="flex items-center justify-between px-2 mb-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Segments</label>
               <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{fields.length}</span>
            </div>
            
            {fields.map(field => {
              const activeIn = getActiveLevelsCount(field);
              const isSelected = selectedField === field;
              return (
                <div 
                  key={field}
                  className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs transition-all cursor-pointer font-bold border-2 ${
                    isSelected 
                    ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-200 -translate-y-0.5' 
                    : 'bg-white border-transparent text-slate-500 hover:border-amber-200 hover:text-slate-900'
                  }`}
                  onClick={() => setSelectedField(field)}
                >
                  <div className="flex flex-col flex-1 overflow-hidden">
                     <span className="truncate pr-2">{readableLabel(field)}</span>
                     <LevelIndicators field={field} isSelected={isSelected} />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(field); }}
                        className={`p-1 transition-opacity ${isSelected ? 'text-white/50 hover:text-white' : 'text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100'}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area: Items & Mapping */}
        <div className="flex-1 flex flex-col p-8 bg-white relative">
          {selectedField ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col xl:flex-row xl:items-start justify-between mb-10 gap-10">
                 <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <h3 className="text-3xl font-black text-slate-900 tracking-tight">{readableLabel(selectedField)}</h3>
                       <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 border border-slate-200 uppercase">
                          Field ID: {selectedField}
                       </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium max-w-xl">
                       Define the allowed values for this segment and map it to the campaign hierarchy. 
                       Once mapped, this field will appear as a required input in the Builder columns.
                    </p>
                 </div>
                 
                 {/* Visual Mapping Blueprint */}
                 <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-6 w-full xl:w-[420px] shadow-inner relative group/blueprint">
                    <div className="flex items-center justify-between mb-6 px-2">
                       <div className="flex items-center gap-2">
                          <Layers className="text-amber-500" size={18} />
                          <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Taxonomy Blueprint</span>
                       </div>
                       <div className="flex items-center gap-1 group/blueprintinfo">
                          <HelpCircle size={14} className="text-slate-300 group-hover/blueprintinfo:text-amber-500 transition-colors cursor-help" />
                          <div className="absolute right-0 bottom-full mb-4 w-64 p-4 bg-slate-900 text-white text-[10px] font-medium leading-relaxed rounded-2xl shadow-2xl opacity-0 invisible group-hover/blueprintinfo:opacity-100 group-hover/blueprintinfo:visible transition-all z-50">
                            Click on hierarchy levels to enable or disable this segment within that level's naming convention.
                            <div className="absolute -bottom-1 right-6 w-2 h-2 bg-slate-900 rotate-45"></div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="space-y-4 relative">
                       {/* Connection Line */}
                       <div className="absolute left-[2.25rem] top-6 bottom-6 w-1 bg-slate-200 rounded-full z-0"></div>

                       {(['campaign', 'adset', 'ad'] as TaxonomyLevel[]).map((level, idx) => {
                          const active = isFieldInLevel(selectedField, level);
                          const levelIcons = {
                             campaign: <Rocket size={18} />,
                             adset: <Target size={18} />,
                             ad: <Layers size={18} />
                          };
                          const levelColors = {
                             campaign: 'bg-indigo-600',
                             adset: 'bg-emerald-600',
                             ad: 'bg-amber-600'
                          };
                          const levelActiveText = {
                             campaign: 'text-indigo-600',
                             adset: 'text-emerald-600',
                             ad: 'text-amber-600'
                          };
                          const levelActiveBorder = {
                             campaign: 'border-indigo-500',
                             adset: 'border-emerald-500',
                             ad: 'border-amber-500'
                          };
                          const levelActiveShadow = {
                             campaign: 'shadow-indigo-100',
                             adset: 'shadow-emerald-100',
                             ad: 'shadow-amber-100'
                          };
                          const levelNames = {
                             campaign: 'Campaign Level',
                             adset: 'Ad Set Level',
                             ad: 'Ad Creative'
                          };

                          return (
                             <button
                                key={level}
                                onClick={() => isAdmin && toggleCategoryInLevel(selectedField, level)}
                                className={`w-full relative z-10 flex items-center justify-between p-4 rounded-3xl border-2 transition-all duration-300 group/btn ${
                                   active 
                                   ? `bg-white ${levelActiveBorder[level]} ${levelActiveText[level]} shadow-xl ${levelActiveShadow[level]} scale-[1.03]` 
                                   : 'bg-slate-50/50 border-slate-100 text-slate-300 hover:border-slate-300 hover:bg-white'
                                } ${!isAdmin ? 'cursor-not-allowed opacity-80' : ''}`}
                             >
                                <div className="flex items-center gap-4">
                                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                      active ? `${levelColors[level]} text-white rotate-0` : 'bg-slate-200 text-slate-400 -rotate-12'
                                   }`}>
                                      {levelIcons[level]}
                                   </div>
                                   <div className="text-left">
                                      <span className={`text-[10px] font-black uppercase tracking-widest block ${active ? levelActiveText[level] : 'text-slate-400'}`}>
                                         {levelNames[level]}
                                      </span>
                                      <span className="text-xs font-bold block mt-0.5">
                                         {active ? 'Propagating in Naming' : 'Not mapped'}
                                      </span>
                                   </div>
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${active ? 'bg-slate-100 text-current' : 'bg-slate-100 text-slate-300'}`}>
                                   {active ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                </div>
                             </button>
                          );
                       })}
                    </div>

                    <div className="mt-6 text-center">
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                          Toggle levels to update the master naming structure
                       </p>
                    </div>
                 </div>
              </div>
              
              {/* Values Management Section */}
              <div className="border-t border-slate-100 pt-10">
                 <div className="flex items-center justify-between mb-6">
                    <div>
                       <h4 className="text-lg font-black text-slate-800">Allowed Options</h4>
                       <p className="text-xs text-slate-500">Dictionary of values that appear in the dropdown.</p>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                       {(dictionaries[selectedField] || []).length} Options Defined
                    </div>
                 </div>

                 <form onSubmit={handleAddItem} className="flex gap-3 mb-8">
                   <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={`Type new option for ${readableLabel(selectedField)}...`}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-8 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300"
                        value={newItemValue}
                        onChange={(e) => setNewItemValue(e.target.value)}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                         <ListFilter size={20} />
                      </div>
                   </div>
                   <button
                     type="submit"
                     className="bg-amber-600 text-white px-8 py-4 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-amber-700 transition-all shadow-xl shadow-amber-100 active:scale-95 active:shadow-none"
                   >
                     <Plus size={20} /> Add to Dict
                   </button>
                 </form>

                 <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-1">
                   {(dictionaries[selectedField] || []).length === 0 && (
                     <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-50 rounded-[3rem]">
                       <div className="p-6 bg-slate-50 rounded-full mb-4">
                          <Database size={60} className="opacity-10" />
                       </div>
                       <p className="text-lg font-black text-slate-400 uppercase tracking-widest">Empty Dictionary</p>
                       <p className="text-sm font-medium max-w-xs text-center mt-2">Add your first allowed values using the input above to populate this category.</p>
                     </div>
                   )}
                   {(dictionaries[selectedField] || []).map((item) => (
                     <div
                       key={item}
                       className="group flex items-center justify-between bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:border-amber-300 hover:bg-amber-50/20 transition-all hover:-translate-y-1"
                     >
                       <span className="text-xs font-black text-slate-700 truncate mr-2">{item}</span>
                       <button
                         onClick={() => deleteDictionaryItem(selectedField, item)}
                         className="text-slate-200 hover:text-red-500 transition-colors p-1 group-hover:opacity-100"
                       >
                         <X size={16} />
                       </button>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 py-20 animate-in fade-in duration-700">
              <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                 <Database size={60} className="opacity-10" />
              </div>
              <p className="text-2xl font-black text-slate-800 uppercase tracking-widest">Select DNA Segment</p>
              <p className="text-sm font-medium max-w-sm text-center mt-4">Choose a dictionary from the sidebar to manage its allowed values and propagation rules across the taxonomy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DictionaryManager;
