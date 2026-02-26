
import React, { useState } from 'react';
import { Building2, Plus, Trash2, CheckCircle2, Edit2, Save, X } from 'lucide-react';
import { useTaxonomyStore } from '../store/useTaxonomyStore';
import { useAuthStore } from '../store/useAuthStore';

const TenantManager: React.FC = () => {
  const { tenants, addTenant, updateTenant, deleteTenant, selectTenant, selectedTenantId, mediaOwner } = useTaxonomyStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  
  const [newTenantName, setNewTenantName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Filter tenants by current Media Owner context
  // If no mediaOwner is selected (shouldn't happen in app view), show all? Or none?
  // User request: "solo muestre los tenant generados para ese media owner"
  const filteredTenants = tenants.filter(t => 
      t.mediaOwner === mediaOwner || (!t.mediaOwner && !mediaOwner) 
      // Option: Include legacy tenants (undefined owner) for all? 
      // For now, strict filtering creates better data separation. 
      // If a tenant has no owner, it might be hidden unless we fallback.
      // Let's stick to matching owner.
  );

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTenantName.trim()) {
      addTenant(newTenantName.trim());
      setNewTenantName('');
    }
  };

  const handleStartEdit = (e: React.MouseEvent, tenant: { id: string, name: string }) => {
    e.stopPropagation();
    setEditingId(tenant.id);
    setEditingName(tenant.name);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingId && editingName.trim()) {
      updateTenant(editingId, editingName.trim());
      setEditingId(null);
    }
  };

  return (
    <div className={`bg-white border-2 rounded-xl p-6 shadow-sm h-full flex flex-col transition-all duration-300 ${selectedTenantId ? 'border-slate-200 opacity-90' : 'border-indigo-500 shadow-indigo-50 ring-4 ring-indigo-500/5'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${selectedTenantId ? 'bg-slate-200 text-slate-500' : 'bg-indigo-600 text-white shadow-sm'}`}>1</div>
          <Building2 className="text-indigo-600" size={18} />
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Organizations</h2>
        </div>
        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-500">{filteredTenants.length} Total</span>
      </div>

      {isAdmin && (
        <form onSubmit={handleAddTenant} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder={`New ${mediaOwner || ''} Organization...`}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            value={newTenantName}
            onChange={(e) => setNewTenantName(e.target.value)}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
          >
            <Plus size={16} />
          </button>
        </form>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar max-h-[400px]">
        {filteredTenants.length === 0 && (
          <div className="text-center py-10 text-slate-300">
             <Building2 size={32} className="mx-auto opacity-20 mb-2" />
             <p className="text-xs">No organizations for {mediaOwner}.</p>
          </div>
        )}
        {filteredTenants.map((tenant) => (
          <div
            key={tenant.id}
            onClick={() => !editingId && selectTenant(tenant.id)}
            className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
              selectedTenantId === tenant.id
                ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20 shadow-sm scale-[1.02]'
                : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
            }`}
          >
            {editingId === tenant.id ? (
              <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                <input
                  autoFocus
                  className="flex-1 bg-white border border-indigo-200 rounded px-2 py-1 text-xs font-bold outline-none"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <button onClick={handleSaveEdit} className="text-emerald-600 p-1">
                  <Save size={14} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="text-slate-400 p-1">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${selectedTenantId === tenant.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {tenant.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`text-xs font-bold truncate ${selectedTenantId === tenant.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {tenant.name}
                  </span>
                </div>
                                <div className="flex items-center gap-1">
                   {selectedTenantId === tenant.id && <CheckCircle2 size={14} className="text-indigo-600 mr-1" />}
                   {isAdmin && (
                     <>
                       <button
                         onClick={(e) => handleStartEdit(e, tenant)}
                         className="p-1 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <Edit2 size={12} />
                       </button>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           if(confirm(`Delete organization "${tenant.name}"?`)) deleteTenant(tenant.id);
                         }}
                         className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <Trash2 size={12} />
                       </button>
                     </>
                   )}
                 </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TenantManager;
