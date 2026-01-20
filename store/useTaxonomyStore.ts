
import { create } from 'zustand';
import { TaxonomyState, TaxonomyLevel, Client, SavedTaxonomy, Tenant, Dictionaries, Structures } from '../types';
import { MASTER_SCHEMA } from '../constants';
import { resolveStructure, toPascalCase, sanitizeCategoryId } from '../utils/naming';

const getStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
};

const setStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const useTaxonomyStore = create<TaxonomyState>((set, get) => ({
  campaignValues: {},
  adsetValues: {},
  adValues: {},
  
  tenants: getStorage('tenants', []),
  selectedTenantId: null,
  clients: getStorage('clients', []),
  selectedClientId: null,
  savedTaxonomies: getStorage('savedTaxonomies', []),
  
  dictionaries: getStorage('dictionaries', MASTER_SCHEMA.dictionaries),
  structures: getStorage('structures', MASTER_SCHEMA.structures),
  
  generatedStrings: {
    campaign: '',
    adset: '',
    ad: '',
  },

  hasDraft: typeof window !== 'undefined' ? !!localStorage.getItem('taxonomy_draft') : false,

  addDictionaryCategory: (name: string) => {
    set((state) => {
      const sanitizedName = sanitizeCategoryId(name);
      if (!sanitizedName || state.dictionaries[sanitizedName]) return state;
      
      const updatedDicts = {
        ...state.dictionaries,
        [sanitizedName]: []
      };
      setStorage('dictionaries', updatedDicts);
      return { dictionaries: updatedDicts };
    });
  },

  deleteDictionaryCategory: (name: string) => {
    set((state) => {
      const { [name]: removed, ...updatedDicts } = state.dictionaries;
      
      const nextStructures = { ...state.structures };
      (Object.keys(nextStructures) as TaxonomyLevel[]).forEach(level => {
        nextStructures[level] = nextStructures[level]
          .replace(new RegExp(`\\|?\\{${name}\\}`, 'g'), '')
          .replace(/^\|/, '');
      });

      setStorage('dictionaries', updatedDicts);
      setStorage('structures', nextStructures);
      return { dictionaries: updatedDicts, structures: nextStructures };
    });
  },

  addDictionaryItem: (field: string, value: string) => {
    set((state) => {
      const currentList = state.dictionaries[field] || [];
      if (currentList.includes(value)) return state;
      
      const updatedDicts = {
        ...state.dictionaries,
        [field]: [...currentList, value]
      };
      setStorage('dictionaries', updatedDicts);
      return { dictionaries: updatedDicts };
    });
  },

  deleteDictionaryItem: (field: string, value: string) => {
    set((state) => {
      const currentList = state.dictionaries[field] || [];
      const updatedDicts = {
        ...state.dictionaries,
        [field]: currentList.filter(item => item !== value)
      };
      setStorage('dictionaries', updatedDicts);
      return { dictionaries: updatedDicts };
    });
  },

  toggleCategoryInLevel: (field: string, level: TaxonomyLevel) => {
    set((state) => {
      let currentStructure = state.structures[level];
      const token = `{${field}}`;
      const isPresent = currentStructure.includes(token);
      
      let nextStructure = currentStructure;
      if (isPresent) {
        nextStructure = nextStructure
          .replace(new RegExp(`\\|?${token.replace('{', '\\{').replace('}', '\\}')}`, 'g'), '')
          .replace(/^\|/, '');
      } else {
        nextStructure = nextStructure ? `${nextStructure}|${token}` : token;
      }

      const nextStructures = { ...state.structures, [level]: nextStructure };
      setStorage('structures', nextStructures);
      
      const campaignStr = resolveStructure(nextStructures.campaign, state.campaignValues);
      const adsetStr = resolveStructure(nextStructures.adset, state.adsetValues, { parentCampaign: campaignStr });
      const adStr = resolveStructure(nextStructures.ad, state.adValues, { 
        parentCampaignName: toPascalCase(state.campaignValues.campaignName || ''), 
        parentProvider: toPascalCase(state.campaignValues.provider || '') 
      });

      return { 
        structures: nextStructures,
        generatedStrings: { campaign: campaignStr, adset: adsetStr, ad: adStr }
      };
    });
  },

  isFieldInLevel: (field: string, level: TaxonomyLevel) => {
    return get().structures[level].includes(`{${field}}`);
  },

  setFieldValue: (level: TaxonomyLevel, field: string, value: string) => {
    const state = get();
    
    let nextCampaignValues = { ...state.campaignValues };
    let nextAdsetValues = { ...state.adsetValues };
    let nextAdValues = { ...state.adValues };

    if (level === 'campaign') nextCampaignValues[field] = value;
    if (level === 'adset') nextAdsetValues[field] = value;
    if (level === 'ad') nextAdValues[field] = value;

    const deps = MASTER_SCHEMA.dependencies[level as keyof typeof MASTER_SCHEMA.dependencies];
    deps.forEach(dep => {
      if (dep.field === field && dep.value.includes(value)) {
        if (dep.lock && dep.to) {
          if (level === 'campaign') nextCampaignValues[dep.lock] = dep.to;
          if (level === 'adset') nextAdsetValues[dep.lock] = dep.to;
          if (level === 'ad') nextAdValues[dep.lock] = dep.to;
        }
        
        if (dep.filter) {
          const currentVal = level === 'campaign' ? nextCampaignValues[dep.filter] : level === 'adset' ? nextAdsetValues[dep.filter] : nextAdValues[dep.filter];
          if (currentVal && dep.allow && !dep.allow.includes(currentVal)) {
            const isSocialProvider = ["Meta", "Meta Ads", "TikTok", "LinkedIn", "Pinterest", "Snapchat", "X"].includes(value);
            const fallbackValue = (isSocialProvider && dep.filter === 'channel') ? 'Social Media' : '';
            
            if (level === 'campaign') nextCampaignValues[dep.filter] = fallbackValue;
            if (level === 'adset') nextAdsetValues[dep.filter] = fallbackValue;
            if (level === 'ad') nextAdValues[dep.filter] = fallbackValue;
          }
        }
      }
    });

    const campaignStr = resolveStructure(state.structures.campaign, nextCampaignValues);
    const adsetStr = resolveStructure(state.structures.adset, nextAdsetValues, { parentCampaign: campaignStr });
    const adStr = resolveStructure(state.structures.ad, nextAdValues, { 
      parentCampaignName: toPascalCase(nextCampaignValues.campaignName || ''), 
      parentProvider: toPascalCase(nextCampaignValues.provider || '') 
    });

    set({
      campaignValues: nextCampaignValues,
      adsetValues: nextAdsetValues,
      adValues: nextAdValues,
      generatedStrings: { campaign: campaignStr, adset: adsetStr, ad: adStr }
    });
  },

  resetLevel: (level: TaxonomyLevel) => {
    set((state) => ({ ...state, [`${level}Values`]: {} }));
  },

  addTenant: (name: string) => {
    const newTenant: Tenant = { id: crypto.randomUUID(), name };
    set((state) => {
      const updated = [...state.tenants, newTenant];
      setStorage('tenants', updated);
      return { tenants: updated };
    });
  },

  updateTenant: (id: string, name: string) => {
    set((state) => {
      const updated = state.tenants.map(t => t.id === id ? { ...t, name } : t);
      setStorage('tenants', updated);
      return { tenants: updated };
    });
  },

  deleteTenant: (id: string) => {
    set((state) => {
      const updatedTenants = state.tenants.filter(t => t.id !== id);
      const updatedClients = state.clients.filter(c => c.tenantId !== id);
      const updatedHistory = state.savedTaxonomies.filter(s => s.tenantId !== id);
      
      setStorage('tenants', updatedTenants);
      setStorage('clients', updatedClients);
      setStorage('savedTaxonomies', updatedHistory);
      
      return { 
        tenants: updatedTenants,
        clients: updatedClients,
        savedTaxonomies: updatedHistory,
        selectedTenantId: state.selectedTenantId === id ? null : state.selectedTenantId,
        selectedClientId: (state.selectedTenantId === id || state.clients.find(c => c.id === state.selectedClientId)?.tenantId === id) ? null : state.selectedClientId
      };
    });
  },

  selectTenant: (id: string | null) => set({ selectedTenantId: id, selectedClientId: null }),

  addClient: (name: string) => {
    const { selectedTenantId } = get();
    if (!selectedTenantId) return;

    const newClient: Client = { id: crypto.randomUUID(), name, tenantId: selectedTenantId };
    set((state) => {
      const updated = [...state.clients, newClient];
      setStorage('clients', updated);
      return { clients: updated };
    });
  },

  updateClient: (id: string, name: string) => {
    set((state) => {
      const updated = state.clients.map(c => c.id === id ? { ...c, name } : c);
      setStorage('clients', updated);
      return { clients: updated };
    });
  },

  deleteClient: (id: string) => {
    set((state) => {
      const updatedClients = state.clients.filter(c => c.id !== id);
      const updatedHistory = state.savedTaxonomies.filter(s => s.clientId !== id);
      setStorage('clients', updatedClients);
      setStorage('savedTaxonomies', updatedHistory);
      return { 
        clients: updatedClients, 
        savedTaxonomies: updatedHistory,
        selectedClientId: state.selectedClientId === id ? null : state.selectedClientId
      };
    });
  },

  selectClient: (id: string | null) => set({ selectedClientId: id }),

  saveTaxonomy: () => {
    const state = get();
    if (!state.selectedTenantId || !state.selectedClientId) {
      alert("Selection required.");
      return;
    }
    
    const campaignName = state.campaignValues.campaignName || 'Unnamed_Campaign';
    const newRecord: SavedTaxonomy = {
      id: crypto.randomUUID(),
      tenantId: state.selectedTenantId,
      clientId: state.selectedClientId,
      campaignName: campaignName,
      date: new Date().toLocaleString(),
      strings: { ...state.generatedStrings },
      values: {
        campaign: { ...state.campaignValues },
        adset: { ...state.adsetValues },
        ad: { ...state.adValues }
      }
    };

    set((state) => {
      const updated = [newRecord, ...state.savedTaxonomies];
      setStorage('savedTaxonomies', updated);
      return { savedTaxonomies: updated };
    });
    alert("Taxonomy saved!");
  },

  loadSavedTaxonomy: (record: SavedTaxonomy) => {
    set((state) => ({
      ...state,
      selectedTenantId: record.tenantId,
      selectedClientId: record.clientId,
      campaignValues: { ...record.values.campaign },
      adsetValues: { ...record.values.adset },
      adValues: { ...record.values.ad },
      generatedStrings: { ...record.strings }
    }));
  },

  deleteSavedTaxonomy: (id: string) => {
    set((state) => {
      const updated = state.savedTaxonomies.filter(t => t.id !== id);
      setStorage('savedTaxonomies', updated);
      return { savedTaxonomies: updated };
    });
  },

  saveDraftTaxonomy: () => {
    const { campaignValues, adsetValues, adValues } = get();
    const draft = { campaignValues, adsetValues, adValues };
    setStorage('taxonomy_draft', draft);
    set({ hasDraft: true });
    alert("Draft saved!");
  },

  loadDraftTaxonomy: () => {
    const draftStr = localStorage.getItem('taxonomy_draft');
    if (!draftStr) return;
    
    const draft = JSON.parse(draftStr);
    
    set((state) => {
      const campaignStr = resolveStructure(state.structures.campaign, draft.campaignValues);
      const adsetStr = resolveStructure(state.structures.adset, draft.adsetValues, { parentCampaign: campaignStr });
      const adStr = resolveStructure(state.structures.ad, draft.adValues, { 
        parentCampaignName: toPascalCase(draft.campaignValues.campaignName || ''), 
        parentProvider: toPascalCase(draft.campaignValues.provider || '') 
      });

      return {
        ...state,
        campaignValues: draft.campaignValues,
        adsetValues: draft.adsetValues,
        adValues: draft.adValues,
        generatedStrings: { campaign: campaignStr, adset: adsetStr, ad: adStr }
      };
    });
    alert("Draft loaded!");
  }
}));
