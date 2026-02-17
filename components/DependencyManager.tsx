import React, { useState } from 'react';
import { useTaxonomyStore } from '../store/useTaxonomyStore';
import { TaxonomyLevel, Dependency } from '../types';
import { X, Plus, Save, Trash2 } from 'lucide-react';

interface DependencyManagerProps {
    onClose: () => void;
}

export const DependencyManager: React.FC<DependencyManagerProps> = ({ onClose }) => {
    const { dependencies, dictionaries, addDependency, removeDependency } = useTaxonomyStore();
    const [activeLevel, setActiveLevel] = useState<TaxonomyLevel>('campaign');
    
    // Form State
    const [newDep, setNewDep] = useState<Partial<Dependency>>({
        field: '',
        value: [],
        lock: '',
        to: '',
    });

    const handleAdd = () => {
        if (!newDep.field || newDep.value?.length === 0 || !newDep.lock || !newDep.to) {
            alert("Please fill all required fields (If Field = Value, Set Field = Value)");
            return;
        }

        addDependency(activeLevel, newDep as Dependency);
        setNewDep({ field: '', value: [], lock: '', to: '' });
    };

    const dictionaryKeys = Object.keys(dictionaries);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="bg-indigo-500 rounded p-1"><Plus size={16} /></span>
                        Dependency Rules Manager
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {/* Level Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
                        {(['campaign', 'adset', 'ad'] as TaxonomyLevel[]).map(level => (
                            <button
                                key={level}
                                onClick={() => setActiveLevel(level)}
                                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                                    activeLevel === level 
                                    ? 'bg-slate-700 text-indigo-400 border-b-2 border-indigo-400' 
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                            >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Existing Rules List */}
                    <div className="space-y-3 mb-8">
                        {dependencies[activeLevel]?.length === 0 && (
                            <p className="text-slate-500 italic text-sm p-4 text-center border border-dashed border-slate-800 rounded-lg">No rules defined for this level.</p>
                        )}
                        {dependencies[activeLevel]?.map((dep, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-950/50 p-3 rounded-lg border border-slate-800 hover:border-indigo-500/30 transition-all">
                                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                                    <span className="text-indigo-400 font-mono text-xs font-bold">IF</span>
                                    <span className="bg-slate-800 px-2 py-1 rounded text-white border border-slate-700">{dep.field}</span>
                                    <span className="text-xs">IN</span>
                                    <span className="bg-slate-800 px-2 py-1 rounded text-white border border-slate-700 max-w-[200px] truncate" title={dep.value.join(', ')}>
                                        [{dep.value.join(', ')}]
                                    </span>
                                    <span className="text-emerald-400 font-mono text-xs font-bold ml-2">SET</span>
                                    <span className="bg-slate-800 px-2 py-1 rounded text-white border border-slate-700">{dep.lock}</span>
                                    <span>=</span>
                                    <span className="bg-slate-800 px-2 py-1 rounded text-white border border-slate-700">{dep.to}</span>
                                </div>
                                <button 
                                    onClick={() => removeDependency(activeLevel, idx)}
                                    className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add New Rule Form */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Add New Rule</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* IF Block */}
                            <div className="space-y-3">
                                <label className="text-xs text-indigo-400 font-bold block uppercase">Condition (IF)</label>
                                <select 
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    value={newDep.field}
                                    onChange={(e) => setNewDep({...newDep, field: e.target.value, value: []})}
                                >
                                    <option value="">Select Controlling Field</option>
                                    {dictionaryKeys.map(k => <option key={k} value={k}>{k}</option>)}
                                </select>

                                {newDep.field && dictionaries[newDep.field] && (
                                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                                        <p className="text-[10px] text-slate-400 mb-2 uppercase font-bold">Matches Any Value:</p>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {newDep.value?.map(v => (
                                                <span key={v} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer hover:bg-red-500 transition-colors"
                                                    onClick={() => setNewDep({...newDep, value: newDep.value?.filter(x => x !== v)})}
                                                >
                                                    {v} <X size={12} />
                                                </span>
                                            ))}
                                        </div>
                                        <select 
                                            className="w-full bg-slate-800 border-none rounded p-2 text-xs text-white"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if(val && !newDep.value?.includes(val)) {
                                                    setNewDep({ ...newDep, value: [...(newDep.value || []), val] });
                                                }
                                            }}
                                            value=""
                                        >
                                            <option value="">+ Add Value to Condition</option>
                                            {dictionaries[newDep.field].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                   </div>
                                )}
                            </div>

                            {/* THEN Block */}
                            <div className="space-y-3">
                                <label className="text-xs text-emerald-400 font-bold block uppercase">Consequence (THEN SET)</label>
                                <select 
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    value={newDep.lock}
                                    onChange={(e) => setNewDep({...newDep, lock: e.target.value, to: ''})}
                                >
                                    <option value="">Select Target Field</option>
                                    {dictionaryKeys.filter(k => k !== newDep.field).map(k => <option key={k} value={k}>{k}</option>)}
                                </select>

                                {newDep.lock && dictionaries[newDep.lock] && (
                                     <select 
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                        value={newDep.to}
                                        onChange={(e) => setNewDep({...newDep, to: e.target.value})}
                                     >
                                        <option value="">Select Value to Force</option>
                                        {dictionaries[newDep.lock].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                     </select>
                                )}
                            </div>

                        </div>
                        
                        <button 
                            onClick={handleAdd}
                            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Save Dependency Rule
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
