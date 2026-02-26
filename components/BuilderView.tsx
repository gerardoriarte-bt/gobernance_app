
import React, { useState } from 'react';
import { Building2, User, Settings, FileText, Download, ShieldAlert, Lock, Save, CheckCircle } from 'lucide-react';
import TaxonomyColumn from './TaxonomyColumn';
import CIDColumn from './CIDColumn';
import SavedHistory from './SavedHistory';
import { DependencyManager } from './DependencyManager';
import { useTaxonomyStore } from '../store/useTaxonomyStore';
import { useAuthStore } from '../store/useAuthStore';

interface BuilderViewProps {
  setActiveView: (view: 'builder' | 'config') => void;
}

const BuilderView: React.FC<BuilderViewProps> = ({ setActiveView }) => {
  const { 
    saveTaxonomy, 
    saveDraftTaxonomy, 
    loadDraftTaxonomy, 
    hasDraft, 
    selectedClientId, 
    selectedTenantId, 
    clients, 
    tenants,
    generatedStrings
  } = useTaxonomyStore();

  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';
  const isTrafficker = user?.role === 'trafficker';
  const canSaveTaxonomy = isSuperAdmin || isAdmin || !isTrafficker; 

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  const [showRules, setShowRules] = useState(false);

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Context Header for Builder */}
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between border-b-8 border-indigo-500">
          <div className="relative z-10 flex flex-wrap items-center gap-8">
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Organization</span>
                <span className="text-2xl font-black tracking-tighter flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><Building2 size={20} /></div>
                   {selectedTenant?.name}
                </span>
             </div>
             <div className="h-12 w-px bg-slate-800 hidden md:block"></div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Client Account</span>
                <span className="text-2xl font-black tracking-tighter flex items-center gap-3">
                   <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg"><User size={20} /></div>
                   {selectedClient?.name}
                </span>
             </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-y-1/3 translate-x-1/4">
             <Settings size={240} className="animate-spin-slow" />
          </div>
          <div className="flex flex-col gap-2 z-10 mt-6 md:mt-0">
            <button 
                onClick={() => setActiveView('config')}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all backdrop-blur-sm"
            >
                Switch Workspace
            </button>
            <button 
                onClick={() => setShowRules(!showRules)}
                className="bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/30 transition-all backdrop-blur-sm"
            >
                {showRules ? 'Hide Rules' : 'Manage Rules'}
            </button>
          </div>
        </div>
        
        {showRules && <DependencyManager onClose={() => setShowRules(false)} />}

        {hasDraft && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 flex items-center justify-between shadow-xl shadow-amber-50/50 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                 <FileText size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Restore Previous Progress</h4>
                <p className="text-xs text-amber-700 font-medium">We found an unsaved taxonomy draft for this session.</p>
              </div>
            </div>
            <button
              onClick={loadDraftTaxonomy}
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 active:scale-95"
            >
              <Download size={16} /> Load Draft
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch h-[600px]">
          <TaxonomyColumn 
            level="campaign" 
            title="1. Campaign" 
            description="Provider, Objective & Strategy."
          />
          <TaxonomyColumn 
            level="adset" 
            title="2. Ad Set" 
            description="Audience & Placement."
          />
          <TaxonomyColumn 
            level="ad" 
            title="3. Ad Creative" 
            description="Formats & Variations."
          />
          <CIDColumn />
        </div>

        {/* CID Display & Copy Action */}
        <div className="bg-slate-900 rounded-[2rem] p-8 relative overflow-hidden text-center border-4 border-indigo-500 shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10"><FileText size={120} /></div>
            <h3 className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">Final Campaign ID (CID)</h3>
            <div className="font-mono text-2xl md:text-3xl font-bold text-white break-all mb-6 relative z-10">
                {generatedStrings.cid || "--- Complete Campaign Params to Generate CID ---"}
            </div>
            <button
                onClick={() => {
                    navigator.clipboard.writeText(generatedStrings.cid);
                    alert("CID Copied!");
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/50"
            >
                Copy CID
            </button>
        </div>

        {/* Centered Save Action */}
        {/* Governance Check-Out / Save Section */}
        <div className="mt-12 bg-slate-900 border-2 border-indigo-500/50 rounded-[2.5rem] p-10 text-center relative overflow-hidden shadow-2xl shadow-indigo-900/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
             <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 rotate-3">
                <Save size={32} className="text-white" />
             </div>
             
             <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                Ready to Commit?
             </h2>
             <p className="text-indigo-200 text-sm font-medium mb-10 leading-relaxed">
               Review your generated naming conventions above. Clicking below will <span className="text-white font-bold decoration-indigo-500 underline underline-offset-4">permanently index</span> them into the <span className="font-bold text-white">Client's Naming Repository</span> for governance tracking.
             </p>

             <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                <button 
                  onClick={saveDraftTaxonomy}
                  disabled={!canSaveTaxonomy}
                  className={`px-8 py-4 rounded-xl border border-slate-700 font-bold uppercase tracking-widest text-xs transition-all w-full sm:w-auto ${!canSaveTaxonomy ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                    {isTrafficker ? 'Drafts Locked' : 'Save as Draft'}
                </button>
                
                <button 
                  onClick={saveTaxonomy}
                  disabled={!canSaveTaxonomy}
                  className={`group relative px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl transition-all w-full sm:w-auto overflow-hidden ${!canSaveTaxonomy ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-900/20 hover:scale-105 active:scale-95'}`}
                >
                    {!canSaveTaxonomy ? (
                        <span className="flex items-center justify-center gap-3"><Lock size={18} /> Read Only Mode</span>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
                            <span className="flex items-center justify-center gap-3">
                               <CheckCircle size={20} className="fill-white/20" />
                               Commit to Repository
                            </span>
                        </>
                    )}
                </button>
             </div>
             
             <div className="mt-8 flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <ShieldAlert size={12} className="text-indigo-500" />
                Governed Action • Irreversible update to history
             </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <SavedHistory onEdit={() => setActiveView('builder')} />
    </>
  );
};

export default BuilderView;
