
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
      <header className="sticky top-4 z-50 mb-8 mx-auto w-full max-w-7xl px-4">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-xl shadow-slate-200/20 rounded-2xl h-16 flex items-center justify-between px-6 transition-all duration-300">
          
          {/* Left: Logo & Core Nav */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setActiveView('builder')}>
              <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-indigo-200">
                <Settings size={18} className="text-white" />
              </div>
              <span className="text-lg font-black text-slate-900 tracking-tight">
                Governance Builder
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
              <button 
                onClick={() => setActiveView('builder')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  activeView === 'builder' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Builder
              </button>
              {canModifyConfig && (
                <button 
                  onClick={() => setActiveView('config')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    activeView === 'config' 
                      ? 'bg-white text-amber-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Library
                </button>
              )}
            </nav>
          </div>

          {/* Center: Media Owner Pill (Compact) */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900 rounded-full p-1 border border-slate-800 shadow-inner">
            {(['Buentipo', 'Hermano', 'LoBueno', 'AntPack'] as const).map((owner) => (
              <button
                key={owner}
                onClick={() => setMediaOwner(owner)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                  mediaOwner === owner 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {owner}
              </button>
            ))}
          </div>

          {/* Right: User & Actions */}
          <div className="flex items-center gap-4">
            {canSave && (
              <div className="hidden xl:flex items-center gap-2 text-indigo-600 text-[10px] uppercase font-black tracking-tight bg-indigo-50/50 px-3 py-1.5 rounded-full border border-indigo-100/50">
                <CheckCircle size={10} />
                <span className="opacity-60 text-[9px]">Active:</span> {selectedTenant?.name.split(' ')[0]} / {selectedClient?.name}
              </div>
            )}

            <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>

            {user && (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-full transition-colors group"
                >
                   <div className="relative">
                     <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm group-hover:border-indigo-100 transition-all" />
                     <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                   </div>
                   <div className="hidden sm:flex flex-col text-left items-start pr-2">
                      <span className="text-xs font-bold text-slate-800 leading-none">{user.name.split(' ')[0]}</span>
                      <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider leading-none mt-1">{user.role}</span>
                   </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-100 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
                      <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full border border-slate-200" />
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 truncate uppercase font-bold tracking-widest">{user.role}</p>
                      </div>
                    </div>
                    <div className="p-2">
                      {(user.role === 'admin' || user.role === 'superadmin') && (
                        <button 
                          onClick={() => {
                            setIsUserModalOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors flex items-center gap-3"
                        >
                          <Users size={16} className="text-slate-400" /> User Management
                        </button>
                      )}
                      <button 
                        onClick={() => logout()}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-3"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                    
                    <div className="p-3 bg-slate-50/50 border-t border-slate-50 text-center">
                       <button 
                          onClick={() => useTaxonomyStore.getState().fillMockData()}
                          className="text-[9px] font-mono text-slate-400 hover:text-indigo-500 uppercase transition-colors"
                       >
                          [Fill Demo Data]
                       </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
