
import React from 'react';
import { Settings, Info, HelpCircle, Layers, BookOpen, CheckCircle, LogOut, Users, X } from 'lucide-react';
import UserManager from './UserManager';
import { useAuthStore } from '../store/useAuthStore';
import { useTaxonomyStore } from '../store/useTaxonomyStore';

interface TaxonomyHeaderProps {
  activeView: 'builder' | 'config';
  setActiveView: (view: 'builder' | 'config') => void;
  canModifyConfig: boolean;
}

const TaxonomyHeader: React.FC<TaxonomyHeaderProps> = ({ activeView, setActiveView, canModifyConfig }) => {
  const { user, logout } = useAuthStore();
  const { selectedTenantId, selectedClientId, tenants, clients, mediaOwner, setMediaOwner } = useTaxonomyStore();

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedTenant = tenants.find(t => t.id === selectedTenantId);
  const canSave = selectedTenantId && selectedClientId;


  /* State for User Menu & Modal */
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-50">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="text-indigo-600" />
            Governance Builder
          </h1>
          
          {/* Media Owner Selector (Quick Switch) */}
          <div className="mt-4 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest bg-indigo-50/50 px-1.5 py-0.5 rounded">Media Owner:</span>
              <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                  {(['Buentipo', 'Hermano', 'LoBueno'] as const).map((owner) => (
                      <button
                          key={owner}
                          onClick={() => setMediaOwner(owner)}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                              mediaOwner === owner 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                      >
                          {owner}
                      </button>
                  ))}
              </div>
          </div>
  
          <div className="flex items-center gap-2 group relative mt-1">
            <p className="text-slate-500 flex items-center gap-1.5 text-sm">
              <Info size={14} className="text-slate-400" />
              Professional Governance & Media Naming Tool.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {user && (
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="hidden lg:flex items-center gap-3 bg-slate-100 rounded-full pl-1 pr-4 py-1 mr-4 border border-slate-200 hover:bg-slate-200 transition-colors"
              >
                 <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full bg-slate-200" />
                 <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-700 leading-none">{user.name}</span>
                    <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider leading-none mt-1">{user.role}</span>
                 </div>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute top-full right-4 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-100 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-xs font-black text-slate-900">{user.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    {user.role === 'admin' && (
                      <button 
                        onClick={() => {
                          setIsUserModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <Users size={14} /> User Management
                      </button>
                    )}
                    <button 
                      onClick={() => logout()}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
  
          <div className="flex bg-slate-200/50 p-1 rounded-xl mr-2">
            <button 
              onClick={() => setActiveView('builder')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeView === 'builder' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Layers size={14} /> Builder
            </button>
            {canModifyConfig && (
              <button 
                onClick={() => setActiveView('config')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeView === 'config' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <BookOpen size={14} /> Library & Setup
              </button>
            )}
          </div>
  
          <div className="hidden md:flex flex-col items-end justify-center border-l border-slate-200 pl-4 ml-2">
             <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-widest">v1.5.0</span>
             {canSave && (
               <div className="flex items-center gap-2 text-indigo-600 text-[10px] mt-1 uppercase font-black tracking-tight bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100/50">
                 <CheckCircle size={10} /> Active: {selectedTenant?.name} / {selectedClient?.name}
               </div>
             )}
               {/* Debug/Mock Button */}
               <button 
                  onClick={() => useTaxonomyStore.getState().fillMockData()}
                  className="mt-2 text-[9px] font-mono text-slate-300 hover:text-indigo-400 uppercase cursor-pointer"
               >
                  [Fill Demo Data]
               </button>
          </div>
        </div>
      </header>

      {/* User Management Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsUserModalOpen(false)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="sticky top-0 right-0 z-10 flex justify-end p-4 bg-linear-to-b from-white to-transparent pointer-events-none">
                <button 
                  onClick={() => setIsUserModalOpen(false)}
                  className="pointer-events-auto bg-white text-slate-400 hover:text-slate-900 p-2 rounded-full shadow-lg border border-slate-100 transition-all hover:scale-110"
                >
                   <X size={20} />
                </button>
             </div>
             <div className="px-8 pb-8 -mt-12">
                <UserManager />
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaxonomyHeader;
