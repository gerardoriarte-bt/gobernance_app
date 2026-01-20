
import React from 'react';
import { ShieldAlert, ArrowRight, Building2, User, Settings, Check } from 'lucide-react';
import { useTaxonomyStore } from '../store/useTaxonomyStore';

interface DashboardViewProps {
  setActiveView: (view: 'builder' | 'config') => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView }) => {
  const { selectedTenantId, selectedClientId, tenants, clients } = useTaxonomyStore();
  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  return (
    <div className="bg-white border border-slate-200 shadow-2xl rounded-[3rem] p-12 md:p-24 text-center animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
      
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
        <ShieldAlert size={48} className="text-slate-300" />
      </div>
      
      <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Initialize Workspace</h3>
      <p className="text-slate-500 max-w-lg mx-auto mb-14 text-lg font-medium leading-relaxed">
        To guarantee naming governance and compliance, you must specify the Organization and Client before generating conventions.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-14 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
           <div className={`w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center transition-all duration-700 ${selectedTenantId ? 'border-indigo-500 text-indigo-500 scale-110 shadow-lg' : 'border-slate-200 text-slate-300'}`}>
              <ArrowRight size={24} />
           </div>
        </div>

        <div className={`p-8 rounded-[2.5rem] border-4 transition-all duration-700 ${selectedTenantId ? 'bg-indigo-50 border-indigo-500 shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 opacity-60'}`}>
           <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${selectedTenantId ? 'bg-indigo-600 text-white shadow-xl rotate-6' : 'bg-slate-100 text-slate-300'}`}>
                 <Building2 size={28} />
              </div>
              {selectedTenantId ? <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center"><Check size={16} /></div> : <div className="w-8 h-8 rounded-full border-4 border-slate-100"></div>}
           </div>
           <h4 className={`text-left font-black uppercase tracking-widest text-xs ${selectedTenantId ? 'text-indigo-900' : 'text-slate-400'}`}>Step 1: Organization</h4>
           <p className={`text-left text-sm font-bold mt-2 ${selectedTenantId ? 'text-indigo-600' : 'text-slate-300'}`}>
             {selectedTenantId ? selectedTenant?.name : 'Selection pending...'}
           </p>
        </div>

        <div className={`p-8 rounded-[2.5rem] border-4 transition-all duration-700 ${selectedClientId ? 'bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-100' : 'bg-white border-slate-100 opacity-60'}`}>
           <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${selectedClientId ? 'bg-emerald-600 text-white shadow-xl rotate-6' : 'bg-slate-100 text-slate-300'}`}>
                 <User size={28} />
              </div>
              {selectedClientId ? <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center"><Check size={16} /></div> : <div className="w-8 h-8 rounded-full border-4 border-slate-100"></div>}
           </div>
           <h4 className={`text-left font-black uppercase tracking-widest text-xs ${selectedClientId ? 'text-emerald-900' : 'text-slate-400'}`}>Step 2: Client Account</h4>
           <p className={`text-left text-sm font-bold mt-2 ${selectedClientId ? 'text-emerald-600' : 'text-slate-300'}`}>
             {selectedClientId ? selectedClient?.name : 'Awaiting organization...'}
           </p>
        </div>
      </div>

      <button 
        onClick={() => setActiveView('config')}
        className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-xl hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-200 flex items-center gap-4 mx-auto transform hover:scale-105 active:scale-95 group"
      >
        Go to Workspace Config <Settings size={24} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>
    </div>
  );
};

export default DashboardView;
