
import React, { useState } from 'react';
import { 
  UserPlus, Users, Trash2, CheckCircle2, Edit2, 
  Save, X, User, ArrowRight, Building2, Search,
  Fingerprint
} from 'lucide-react';
import { useTaxonomyStore } from '../store/useTaxonomyStore';
import { useAuthStore } from '../store/useAuthStore';

const ClientManager: React.FC = () => {
  const { 
    clients, 
    tenants, 
    addClient, 
    updateClient, 
    deleteClient, 
    selectClient, 
    selectedClientId, 
    selectedTenantId 
  } = useTaxonomyStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  
  const [newClientName, setNewClientName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);
  const filteredClients = clients.filter(c => 
    c.tenantId === selectedTenantId && 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClientName.trim() && selectedTenantId) {
      addClient(newClientName.trim());
      setNewClientName('');
    }
  };

  const handleStartEdit = (e: React.MouseEvent, client: { id: string, name: string }) => {
    e.stopPropagation();
    setEditingId(client.id);
    setEditingName(client.name);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingId && editingName.trim()) {
      updateClient(editingId, editingName.trim());
      setEditingId(null);
    }
  };

  if (!selectedTenantId) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] h-full flex flex-col items-center justify-center text-slate-400 p-12 transition-all duration-500 group">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
           <Building2 size={40} className="opacity-20 text-slate-900" />
        </div>
        <h3 className="text-slate-800 font-black uppercase tracking-widest text-sm mb-2">Missing Context</h3>
        <p className="text-xs font-bold text-center max-w-[200px] leading-relaxed">Please select an Organization on the left to manage its client accounts.</p>
        <div className="mt-6 flex gap-2">
           <div className="w-2 h-2 rounded-full bg-slate-200 animate-pulse"></div>
           <div className="w-2 h-2 rounded-full bg-slate-200 animate-pulse delay-75"></div>
           <div className="w-2 h-2 rounded-full bg-slate-200 animate-pulse delay-150"></div>
        </div>
      </div>
    );
  }

  const isFocus = selectedTenantId && !selectedClientId;

  return (
    <div className={`bg-white border-2 rounded-[2.5rem] p-8 shadow-xl h-full flex flex-col transition-all duration-500 ${
      isFocus ? 'border-emerald-500 shadow-emerald-100 ring-8 ring-emerald-500/5' : 'border-slate-100 shadow-slate-100'
    }`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${
            selectedClientId ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 rotate-3'
          }`}>
             <Users size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
               <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Client Accounts</h2>
               <div className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100 uppercase">
                  {filteredClients.length} Accounts
               </div>
            </div>
            <p className="text-xs text-slate-400 font-bold mt-1">Workspace: <span className="text-slate-600 underline decoration-emerald-500/30 underline-offset-4">{selectedTenant?.name}</span></p>
          </div>
        </div>

        <div className="relative">
           <input 
              type="text" 
              placeholder="Search accounts..." 
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 pl-10 text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none w-full md:w-48 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
        </div>
      </div>

      {/* Add Form */}
      {isAdmin && (
        <form onSubmit={handleAddClient} className="flex gap-2 mb-8 group">
          <div className="relative flex-1">
             <input
               type="text"
               placeholder="New Client Name (e.g. Under Armour Mexico)..."
               className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-8 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
               value={newClientName}
               onChange={(e) => setNewClientName(e.target.value)}
             />
             <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                <Fingerprint size={20} />
             </div>
          </div>
          <button
            type="submit"
            disabled={!newClientName.trim()}
            className="bg-slate-900 text-white px-8 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus size={18} /> Add
          </button>
        </form>
      )}

      {/* Clients Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[300px]">
        {filteredClients.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-50 rounded-[3rem] animate-in fade-in duration-500">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <User size={32} className="opacity-10" />
             </div>
             <p className="text-sm font-black uppercase tracking-widest">No matching accounts</p>
             <p className="text-xs font-medium text-slate-400 mt-1">Try a different search or add a new client.</p>
          </div>
        )}
        
        {filteredClients.map((client) => (
          <div
            key={client.id}
            onClick={() => !editingId && selectClient(client.id)}
            className={`flex flex-col p-5 rounded-[2rem] border-2 transition-all group cursor-pointer relative overflow-hidden ${
              selectedClientId === client.id
                ? 'bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-100 -translate-y-1'
                : 'bg-white border-slate-50 hover:border-emerald-200 hover:bg-slate-50 hover:-translate-y-1'
            }`}
          >
            {/* Background Decoration */}
            {selectedClientId === client.id && (
               <div className="absolute -right-4 -bottom-4 opacity-10 text-emerald-900">
                  <CheckCircle2 size={80} />
               </div>
            )}

            <div className="flex items-start justify-between mb-4 relative z-10">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  selectedClientId === client.id ? 'bg-emerald-600 text-white rotate-6 shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400'
               }`}>
                  <User size={20} />
               </div>
               
               {!editingId && isAdmin && (
                 <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleStartEdit(e, client)}
                      className={`p-2 rounded-xl transition-all ${selectedClientId === client.id ? 'text-emerald-600 hover:bg-emerald-100' : 'text-slate-300 hover:text-slate-900 opacity-0 group-hover:opacity-100'}`}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if(confirm(`Delete client account "${client.name}"? This will also remove associated saved strings.`)) deleteClient(client.id);
                      }}
                      className={`p-2 rounded-xl transition-all ${selectedClientId === client.id ? 'text-emerald-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100'}`}
                    >
                      <Trash2 size={16} />
                    </button>
                 </div>
               )}
            </div>

            <div className="flex-1 relative z-10">
              {editingId === client.id ? (
                <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                  <input
                    autoFocus
                    className="w-full bg-white border-2 border-emerald-300 rounded-xl px-3 py-2 text-xs font-black outline-none focus:ring-4 focus:ring-emerald-500/10"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                  />
                  <div className="flex gap-2">
                     <button 
                        onClick={handleSaveEdit} 
                        className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-[10px] font-black uppercase flex items-center justify-center gap-1 shadow-sm"
                     >
                       <Save size={12} /> Save
                     </button>
                     <button 
                        onClick={() => setEditingId(null)} 
                        className="flex-1 bg-slate-100 text-slate-500 rounded-lg py-2 text-[10px] font-black uppercase flex items-center justify-center gap-1"
                     >
                       <X size={12} /> Cancel
                     </button>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className={`text-sm font-black leading-tight mb-1 truncate ${selectedClientId === client.id ? 'text-emerald-900' : 'text-slate-800'}`}>
                    {client.name}
                  </h4>
                  <div className="flex items-center gap-1.5">
                     <div className={`w-1.5 h-1.5 rounded-full ${selectedClientId === client.id ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                     <span className={`text-[10px] font-black uppercase tracking-tighter ${selectedClientId === client.id ? 'text-emerald-600' : 'text-slate-400'}`}>
                       {selectedClientId === client.id ? 'Active Session' : 'Ready to Load'}
                     </span>
                  </div>
                </>
              )}
            </div>

            {selectedClientId === client.id && !editingId && (
               <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-100/50 px-3 py-2 rounded-xl border border-emerald-200/50">
                     <span>Current Context</span>
                     <ArrowRight size={12} />
                  </div>
               </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Footer Info */}
      <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-saved to Local Storage</span>
         </div>
         <span className="text-[10px] font-bold text-slate-300 italic">Total DB: {clients.length} Clients</span>
      </div>
    </div>
  );
};

export default ClientManager;
