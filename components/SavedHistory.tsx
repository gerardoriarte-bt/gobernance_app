
import React, { useState } from 'react';
import { History, Trash2, Calendar, Clipboard, User, Building, Edit3, Filter, Globe, Copy, Download } from 'lucide-react';
import { useTaxonomyStore } from '../store/useTaxonomyStore';
import { SavedTaxonomy } from '../types';

interface SavedHistoryProps {
  onEdit?: () => void;
}

const SavedHistory: React.FC<SavedHistoryProps> = ({ onEdit }) => {
  const { savedTaxonomies, clients, tenants, deleteSavedTaxonomy, loadSavedTaxonomy, selectedClientId, selectedTenantId } = useTaxonomyStore();
  const [showAll, setShowAll] = useState(false);

  // Filter by tenant primarily, then client if selected
  const filteredHistory = savedTaxonomies.filter(t => {
    if (showAll) return true;
    const matchesTenant = selectedTenantId ? t.tenantId === selectedTenantId : true;
    const matchesClient = selectedClientId ? t.clientId === selectedClientId : true;
    return matchesTenant && matchesClient;
  });

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown';
  const getTenantName = (id: string) => tenants.find(t => t.id === id)?.name || 'Unknown';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleEdit = (item: SavedTaxonomy) => {
    loadSavedTaxonomy(item);
    if (onEdit) onEdit();
  };

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredHistory.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredHistory.map(i => i.id));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const recordsToExport = selectedRows.length > 0 
      ? filteredHistory.filter(item => selectedRows.includes(item.id))
      : filteredHistory; // Fallback to all if none selected, or block? 
      // User request: "download the campaign number I want". 
      // Typically if 0 selected -> Export All (default behavior) or Alert.
      // Let's default to exporting ALL if nothing selected, but if selection exists, export ONLY selection.

    if (recordsToExport.length === 0) {
        alert("No records to export.");
        return;
    }

    // CSV Headers
    const headers = ["Date", "Campaign Name", "Organization", "Client", "Campaign String", "AdSet String", "Ad String", "CID", "Platform"];
    
    // CSV Rows
    const rows = recordsToExport.map(item => [
      item.date,
      `"${item.campaignName.replace(/"/g, '""')}"`,
      `"${getTenantName(item.tenantId)}"`,
      `"${getClientName(item.clientId)}"`,
      `"${item.strings.campaign}"`,
      `"${item.strings.adset}"`,
      `"${item.strings.ad}"`,
      `"${item.cid || ''}"`,
      `"${item.platform || ''}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `naming_repository_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm border-b-4 border-b-indigo-400 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <History className="text-indigo-600" size={20} />
          </div>
          <div>
             <h2 className="text-xl font-black text-slate-800 tracking-tight">Naming Repository</h2>
             <p className="text-xs text-slate-500 font-medium">
               Select items to export or view your history.
             </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
            <button 
                onClick={handleExport}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg ${
                    selectedRows.length > 0 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                }`}
            >
                <Download size={14} /> 
                {selectedRows.length > 0 ? `Export Selected (${selectedRows.length})` : 'Export All as CSV'}
            </button>

            <div className="flex bg-slate-100 p-1 rounded-xl">
               <button 
                 onClick={() => setShowAll(false)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${!showAll ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
               >
                  <Filter size={14} /> Current Selection
               </button>
               <button 
                 onClick={() => setShowAll(true)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${showAll ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
               >
                  <Globe size={14} /> All Records
               </button>
            </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-separate border-spacing-y-4">
          <thead>
            <tr className="text-slate-400">
              <th className="pl-6 w-10 align-middle pb-2">
                 <input 
                    type="checkbox" 
                    onChange={toggleSelectAll}
                    checked={filteredHistory.length > 0 && selectedRows.length === filteredHistory.length}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer accent-indigo-600"
                 />
              </th>
              <th className="pb-2 pl-4 font-black uppercase text-[10px] tracking-widest">Workspace Context</th>
              <th className="pb-2 font-black uppercase text-[10px] tracking-widest">Generated Convention Strings</th>
              <th className="pb-2 pr-4 font-black uppercase text-[10px] tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 && (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center opacity-30">
                     <History size={48} className="mb-2" />
                     <p className="text-sm font-bold italic">
                        No records found {showAll ? 'anywhere' : 'for this context'}.
                     </p>
                  </div>
                </td>
              </tr>
            )}
            {filteredHistory.map((item) => (
              <tr key={item.id} className={`group hover:translate-x-1 transition-all ${selectedRows.includes(item.id) ? 'bg-indigo-50/30' : ''}`}>
                <td className="pl-6 bg-slate-50/50 rounded-l-2xl border-y border-l border-slate-100 align-middle w-10">
                    <input 
                        type="checkbox" 
                        checked={selectedRows.includes(item.id)}
                        onChange={() => toggleRow(item.id)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer accent-indigo-600"
                    />
                </td>
                <td className="py-6 pl-4 bg-slate-50/50 border-y border-slate-100 align-top w-64">
                  <div className="font-black text-slate-800 text-lg mb-3 leading-tight">{item.campaignName}</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[9px] text-indigo-600 uppercase tracking-widest font-black bg-indigo-50 px-2.5 py-1 rounded-md w-fit border border-indigo-100">
                      <Building size={12} /> {getTenantName(item.tenantId)}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-emerald-600 uppercase tracking-widest font-black bg-emerald-50 px-2.5 py-1 rounded-md w-fit border border-emerald-100">
                      <User size={12} /> {getClientName(item.clientId)}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-3">
                      <Calendar size={12} /> {item.date}
                    </div>
                  </div>
                </td>
                
                <td className="py-6 bg-slate-50/50 border-y border-slate-100 align-top">
                  <div className="flex flex-col gap-3 pr-6">
                    {/* Campaign String */}
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 group/item relative">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">1. Campaign Name</span>
                        <button onClick={() => copyToClipboard(item.strings.campaign)} className="text-slate-500 hover:text-white transition-colors"><Copy size={12} /></button>
                      </div>
                      <div className="text-white font-mono text-[11px] break-all leading-relaxed pr-6 mb-2">{item.strings.campaign}</div>
                      
                      {/* CID Display if available */}
                      {item.cid && (
                          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                              <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                  {item.platform && <span className="bg-emerald-900/30 px-1 rounded text-emerald-400">{item.platform}</span>}
                                  CID
                              </span>
                              <div className="flex items-center gap-2">
                                <code className="text-[10px] text-emerald-400 font-mono">{item.cid}</code>
                                <button onClick={() => copyToClipboard(item.cid!)} className="text-emerald-700 hover:text-emerald-400 transition-colors"><Copy size={10} /></button>
                              </div>
                          </div>
                      )}
                    </div>

                    {/* Ad Set String */}
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm group/item relative">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">2. Ad Set Name</span>
                        <button onClick={() => copyToClipboard(item.strings.adset)} className="text-slate-300 hover:text-indigo-600 transition-colors"><Copy size={12} /></button>
                      </div>
                      <div className="text-slate-700 font-mono text-[11px] break-all leading-relaxed pr-6">{item.strings.adset}</div>
                    </div>

                    {/* Ad String */}
                    <div className="bg-indigo-50/30 rounded-xl p-3 border border-indigo-100 group/item relative">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-indigo-500 font-black uppercase tracking-widest">3. Ad Creative Name</span>
                        <button onClick={() => copyToClipboard(item.strings.ad)} className="text-indigo-300 hover:text-indigo-600 transition-colors"><Copy size={12} /></button>
                      </div>
                      <div className="text-indigo-900 font-mono text-[11px] break-all leading-relaxed pr-6">{item.strings.ad}</div>
                    </div>
                  </div>
                </td>

                <td className="py-6 pr-6 bg-slate-50/50 rounded-r-2xl border-y border-r border-slate-100 align-top text-right w-32">
                  <div className="flex flex-col gap-2 items-end">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex items-center gap-2 bg-white border-2 border-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => { if(confirm('Permanently delete this record?')) deleteSavedTaxonomy(item.id); }}
                      className="flex items-center gap-2 text-slate-300 hover:text-red-500 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SavedHistory;
