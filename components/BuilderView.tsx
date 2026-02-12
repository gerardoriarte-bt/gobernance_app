
import React from 'react';
import { Building2, User, Settings, FileText, Download, ShieldAlert, Lock, Save, CheckCircle } from 'lucide-react';
import TaxonomyColumn from './TaxonomyColumn';
import CIDColumn from './CIDColumn';
import SavedHistory from './SavedHistory';
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
  const isTrafficker = user?.role === 'trafficker';
  const canSaveTaxonomy = !isTrafficker;

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

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
          <button 
             onClick={() => setActiveView('config')}
             className="mt-6 md:mt-0 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all z-10 backdrop-blur-sm"
          >
             Switch Workspace
          </button>
        </div>

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
                {generatedStrings.campaign || "--- Complete Campaign Params to Generate CID ---"}
            </div>
            <button
                onClick={() => {
                    navigator.clipboard.writeText(generatedStrings.campaign);
                    alert("CID Copied!");
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/50"
            >
                Copy CID
            </button>
        </div>

        {/* Centered Save Action */}
        <div className="flex flex-col items-center justify-center py-12 bg-white border border-slate-200 rounded-[3rem] shadow-xl relative overflow-hidden group/save">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500"></div>
          <div className="text-center mb-10">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <ShieldAlert className="text-slate-300" size={32} />
                <div className="absolute top-0 right-full mr-4 w-48 p-3 bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover/save:opacity-100 group-hover/save:visible transition-all z-20">
                  Naming standards are strictly enforced here
                  <div className="absolute top-4 -right-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
             </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Governance Check-out</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 font-medium">
              Please review all naming strings above. Once saved, they will be indexed in the client's naming repository.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <button
              onClick={saveDraftTaxonomy}
              disabled={!canSaveTaxonomy}
              className={`group flex items-center gap-3 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all border-2 active:scale-95 ${!canSaveTaxonomy ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'}`}
            >
              <FileText size={18} className={!canSaveTaxonomy ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-600'} />
              {isTrafficker ? 'Drafts Locked' : 'Save as Draft'}
            </button>
            
            <button
              onClick={saveTaxonomy}
              disabled={!canSaveTaxonomy}
              className={`group flex items-center gap-3 px-14 py-5 rounded-[2rem] font-black text-lg uppercase tracking-tight shadow-2xl transition-all transform ${!canSaveTaxonomy ? 'bg-slate-100 text-slate-300 w-full md:w-auto cursor-not-allowed shadow-none' : 'bg-emerald-600 text-white hover:bg-slate-900 shadow-emerald-100 hover:-translate-y-1 active:translate-y-0'}`}
            >
              {!canSaveTaxonomy ? <Lock size={24} /> : <Save size={24} className="group-hover:rotate-12 transition-transform" />}
              {isTrafficker ? 'Read Only Mode' : 'Finalize Convention'}
              {!isTrafficker && <CheckCircle size={20} className="ml-2 opacity-30" />}
            </button>

          </div>
        </div>
      </div>

      {/* History Section */}
      <SavedHistory onEdit={() => setActiveView('builder')} />
    </>
  );
};

export default BuilderView;
