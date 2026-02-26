
import React, { useState } from 'react';
import { useTaxonomyStore } from '../store/useTaxonomyStore';
import { useAuthStore } from '../store/useAuthStore';
import TaxonomyHeader from './TaxonomyHeader';
import DashboardView from './DashboardView';
import ConfigView from './ConfigView';
import BuilderView from './BuilderView';
import TaxonomyFooter from './TaxonomyFooter';

const TaxonomyBuilder: React.FC = () => {
  const { 
    selectedClientId, 
    selectedTenantId, 
    mediaOwner,
    setMediaOwner,
    fetchInitialData
  } = useTaxonomyStore();

  React.useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;
  const isPlanner = user?.role === 'planner';
  const canModifyConfig = isAdmin || isPlanner; 
  const canSave = selectedTenantId && selectedClientId;

  const [activeView, setActiveView] = useState<'builder' | 'config'>('builder');

  if (!mediaOwner) {
      return <MediaOwnerSelector onSelect={setMediaOwner} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <TaxonomyHeader 
        activeView={activeView} 
        setActiveView={setActiveView} 
        canModifyConfig={canModifyConfig} 
      />

      {activeView === 'config' ? (
        <ConfigView 
          setActiveView={setActiveView} 
          canSave={!!canSave} 
        />
      ) : (
        <>
          {!canSave ? (
            <DashboardView setActiveView={setActiveView} />
          ) : (
            <BuilderView setActiveView={setActiveView} />
          )}
        </>
      )}

      <TaxonomyFooter />
    </div>
  );
};

const MediaOwnerSelector: React.FC<{ onSelect: (owner: 'Buentipo' | 'Hermano' | 'LoBueno') => void }> = ({ onSelect }) => {
    return (
        <div className="fixed inset-0 bg-slate-50 z-[100] flex items-center justify-center p-6">
            <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
                
                {/* Left: Selection */}
                <div className="flex-1 p-12 md:p-16 flex flex-col justify-center">
                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">MEDIA OWNER</h1>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            Select the media owner to configure the workspace context.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {(['Buentipo', 'Hermano', 'LoBueno'] as const).map((owner) => (
                            <button
                                key={owner}
                                onClick={() => onSelect(owner)}
                                className="group w-full flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <span className="text-lg font-bold text-slate-700 group-hover:text-indigo-700 transition-colors uppercase tracking-wider">{owner}</span>
                                <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white flex items-center justify-center transition-all">
                                    <div className="w-2.5 h-2.5 rounded-full bg-current" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Info / How it Works */}
                <div className="md:w-[400px] bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative z-10">
                         <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                            <div className="w-6 h-6 border-2 border-white rounded-full"></div>
                         </div>
                         <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Governance<br/>Engine</h3>
                         <p className="text-slate-400 text-sm font-medium">Standardize your campaign taxonomy with precision.</p>
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div>
                             <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">How it works</h4>
                             <ul className="space-y-4">
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold">1</span>
                                    <span className="text-xs font-medium text-slate-300 leading-relaxed">Setup your Organization and Client workspace.</span>
                                </li>
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">2</span>
                                    <span className="text-xs font-medium text-slate-300 leading-relaxed">Use the Builder to select naming parameters.</span>
                                </li>
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">3</span>
                                    <span className="text-xs font-medium text-slate-300 leading-relaxed">Finalize your convention to save it to the repository.</span>
                                </li>
                             </ul>
                        </div>
                        <div className="pt-8 border-t border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Governance Builder v1.5.0</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxonomyBuilder;
