
import React from 'react';
import { Check, ArrowRight, ShieldAlert, Sparkles, Building2 } from 'lucide-react';
import TenantManager from './TenantManager';
import ClientManager from './ClientManager';
import DictionaryManager from './DictionaryManager';
import UserManager from './UserManager';
import { useTaxonomyStore } from '../store/useTaxonomyStore';
import { useAuthStore } from '../store/useAuthStore';
import { Database } from 'lucide-react';

interface ConfigViewProps {
  setActiveView: (view: 'builder' | 'config') => void;
  canSave: boolean;
}

const ConfigView: React.FC<ConfigViewProps> = ({ setActiveView, canSave }) => {
  const { selectedTenantId, selectedClientId, tenants } = useTaxonomyStore();
  const selectedTenant = tenants.find(t => t.id === selectedTenantId);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 space-y-12">
      {/* Visual Progress Stepper for Setup */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border-b-8 border-b-indigo-500">
         <div className="flex items-center gap-8 flex-1 w-full md:auto">
            <div className={`flex items-center gap-3 transition-all duration-500 ${!selectedTenantId ? 'scale-110' : 'opacity-60 grayscale'}`}>
               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${selectedTenantId ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-500 border-2 border-indigo-500 animate-pulse'}`}>
                  {selectedTenantId ? <Check size={20} /> : '1'}
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step One</span>
                  <span className="text-xs font-black uppercase tracking-tight text-slate-800">Assign Organization</span>
               </div>
            </div>
            
            <div className="h-px bg-slate-200 flex-1 hidden md:block relative overflow-hidden">
               {selectedTenantId && !selectedClientId && <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-emerald-500 animate-slide-infinite opacity-30"></div>}
            </div>

            <div className={`flex items-center gap-3 transition-all duration-500 ${selectedTenantId && !selectedClientId ? 'scale-110' : 'opacity-60 grayscale'}`}>
               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${selectedClientId ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-emerald-500 border-2 border-emerald-500 ' + (selectedTenantId && !selectedClientId ? 'animate-pulse' : '')}`}>
                  {selectedClientId ? <Check size={20} /> : '2'}
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step Two</span>
                  <span className="text-xs font-black uppercase tracking-tight text-slate-800">Assign Client</span>
               </div>
            </div>
         </div>
         
         {canSave ? (
           <button 
             onClick={() => setActiveView('builder')}
             className="w-full md:w-auto bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-1"
           >
             Launch Campaign Builder <ArrowRight size={16} />
           </button>
         ) : (
           <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <ShieldAlert size={14} /> Initialization Required
           </div>
         )}
      </div>

      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-lg shadow-slate-100 relative group">
                 <Building2 size={24} />
                 <div className="absolute bottom-full left-0 mb-3 w-48 p-3 bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    Manage your company portfolio here
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-800 rotate-45"></div>
                 </div>
              </div>
              <div>
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Working Context</h2>
                 <p className="text-sm text-slate-400 font-medium">Select your current workspace to enable the naming engine.</p>
              </div>
           </div>
           {selectedTenantId && !selectedClientId && (
             <div className="flex items-center gap-2 text-[11px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 animate-bounce-subtle">
               <Sparkles size={14} /> Organization selected! Now choose a client.
             </div>
           )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
           {/* Organization Section wrapper with visual aid */}
           <div className={`lg:col-span-4 transition-all duration-500 relative ${!selectedTenantId ? 'scale-[1.02] z-20' : 'opacity-70 grayscale-[0.5]'}`}>
              {!selectedTenantId && (
                 <div className="absolute -top-12 left-0 flex items-center gap-2 text-indigo-600 animate-in slide-in-from-bottom-2">
                    <ArrowRight className="rotate-90" size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Start Here</span>
                 </div>
              )}
              <TenantManager />
           </div>

           {/* Client Section wrapper with visual aid */}
           <div className={`lg:col-span-8 transition-all duration-500 relative ${selectedTenantId && !selectedClientId ? 'scale-[1.02] z-20' : !selectedTenantId ? 'opacity-40 pointer-events-none' : ''}`}>
              {selectedTenantId && !selectedClientId && (
                 <div className="absolute -top-12 left-0 flex items-center gap-2 text-emerald-600 animate-in slide-in-from-bottom-2">
                    <ArrowRight className="rotate-90" size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Final Step</span>
                 </div>
              )}
              <ClientManager />
           </div>
        </div>
      </section>

      <hr className="border-slate-100" />

      <section>
        <div className="flex items-center gap-3 mb-6">
           <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-100 group relative">
              <Database size={24} />
              <div className="absolute bottom-full left-0 mb-3 w-64 p-3 bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                Define the building blocks of your media naming conventions
                <div className="absolute -bottom-1 left-4 w-2 h-2 bg-amber-600 rotate-45"></div>
              </div>
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Taxonomy DNA Library</h2>
              <p className="text-sm text-slate-400 font-medium">Global dictionaries and propagation rules shared across all entities.</p>
           </div>
        </div>
        <DictionaryManager />
      </section>

      {isAdmin && (
        <>
          <hr className="border-slate-100" />
          <section>
            <UserManager />
          </section>
        </>
      )}
    </div>
  );
};

export default ConfigView;
