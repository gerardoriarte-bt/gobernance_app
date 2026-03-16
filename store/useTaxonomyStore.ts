
import { create } from 'zustand';
import { TaxonomyState, TaxonomyLevel, Client, SavedTaxonomy, Tenant, Dictionaries, Structures } from '../types';
import { MASTER_SCHEMA } from '../constants';
import { resolveStructure, toPascalCase, sanitizeCategoryId } from '../utils/naming';
import { generateUUID } from '../utils/uuid';
import { TaxonomyService } from '../services/taxonomyService';

const getStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
};

const setStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

const getValueCaseInsensitive = (map: Record<string, string>, field: string) => {
  if (!map) return '';
  const key = Object.keys(map).find(k => k.toLowerCase() === field.toLowerCase());
  return key ? map[key] : '';
};

const generateCid = (
  structure: string[], 
  campaignValues: Record<string, string>, 
  adsetValues: Record<string, string>, 
  adValues: Record<string, string>, 
  mediaOwner: string | null, 
  campaignStr: string
): string => {
  const cidParts = structure.map(field => {
      if (field === 'campaignString') return campaignStr;
      
      // Look up specially mapped
      if (field.toLowerCase() === 'campaignname') {
          return getValueCaseInsensitive(campaignValues, 'CampaignName') || '';
      }
      if (field.toLowerCase() === 'mediaowner') return mediaOwner || 'UNK';
      
      return getValueCaseInsensitive(campaignValues, field) || 
             getValueCaseInsensitive(adsetValues, field) || 
             getValueCaseInsensitive(adValues, field) || '';
  });
  return cidParts.filter(p => p && p.trim().length > 0).join('/');
};

export const useTaxonomyStore = create<TaxonomyState>((set, get) => ({
  campaignValues: {},
  adsetValues: {},
  adValues: {},
  
  initialized: false,
  mediaOwner: null,
  tenants: [],
  selectedTenantId: null,
  clients: [],
  selectedClientId: null,
  savedTaxonomies: [],
  
  dictionaries: getStorage('dictionaries', MASTER_SCHEMA.dictionaries),
  structures: getStorage('structures', MASTER_SCHEMA.structures),
  dependencies: getStorage('dependencies', MASTER_SCHEMA.dependencies),
  cidStructure: getStorage('cidStructure', ['Channel', 'Country', 'Audience', 'Platform', 'CampaignName', 'Objective', 'FunnelStage', 'BudgetSource', 'LaunchDate', 'mediaOwner', 'CampaignId', 'AdsetId', 'AdId']),
  
  generatedStrings: {
    campaign: '',
    adset: '',
    ad: '',
    cid: '',
  },

  hasDraft: typeof window !== 'undefined' ? !!localStorage.getItem('taxonomy_draft') : false,

  fetchInitialData: async () => {
     if (get().initialized) return;
     try {
       const tenants = await TaxonomyService.getTenants();
       const clients = await TaxonomyService.getClients();
       const taxonomies = await TaxonomyService.getTaxonomies();
       
       set({ tenants, clients, savedTaxonomies: taxonomies, initialized: true });
     } catch (e) {
       console.error("Failed to fetch initial data", e);
     }
  },

  setMediaOwner: (owner) => {
    set((state) => {
        // Update Owner
        const newState = { 
            mediaOwner: owner,
            selectedTenantId: null, 
            selectedClientId: null 
        };
        
        // Recalculate CID with new owner if needed (if owner is in structure)
        // We need nextCampaignValues (current)
        const campaignValues = state.campaignValues;
        const adsetValues = state.adsetValues;
        const adValues = state.adValues;
        const campaignStr = state.generatedStrings.campaign;

        const finalCid = generateCid(state.cidStructure, campaignValues, adsetValues, adValues, owner, campaignStr);

        return { 
            ...newState, 
            generatedStrings: { ...state.generatedStrings, cid: finalCid } 
        };
    });

    // Trigger Rules based on Media Owner Change
    const state = get();
    (['campaign', 'adset', 'ad'] as TaxonomyLevel[]).forEach(level => {
        const deps = state.dependencies[level] || [];
        deps.forEach(dep => {
            if (dep.field === 'mediaOwner' && dep.value.includes(owner)) {
                 // Apply Consequence
                 if (dep.lock && dep.to) {
                     get().setFieldValue(dep.setInLevel || level, dep.lock, dep.to);
                 }
            }
        });
    });
  },

  // Helper to sync changes to current client
  syncCurrentClientConfig: async () => {
    const state = get();
    if (!state.selectedClientId) return;
    
    // Auto-save to server
    await TaxonomyService.updateClientConfig(
        state.selectedClientId, 
        state.dictionaries, 
        state.structures,
        state.cidStructure
    );

    // CRITICAL: Also update the in-memory client object so that
    // re-selecting the client doesn't load a stale cidStructure
    set((s) => ({
      clients: s.clients.map(c => 
        c.id === state.selectedClientId 
          ? { ...c, dictionaries: state.dictionaries, structures: state.structures, cidStructure: state.cidStructure }
          : c
      )
    }));
  },

  setCidStructure: (structure: string[]) => {
      set((state) => {
          setStorage('cidStructure', structure);
          
          // Recalculate CID
          const campaignStr = state.generatedStrings.campaign;
          const finalCid = generateCid(structure, state.campaignValues, state.adsetValues, state.adValues, state.mediaOwner, campaignStr);

          return { 
              cidStructure: structure,
              generatedStrings: { ...state.generatedStrings, cid: finalCid }
          };
      });
      get().syncCurrentClientConfig();
  },

  addDictionaryCategory: (name: string) => {
    set((state) => {
      const sanitizedName = sanitizeCategoryId(name);
      if (!sanitizedName || state.dictionaries[sanitizedName]) return state;
      
      const updatedDicts = {
        ...state.dictionaries,
        [sanitizedName]: []
      };
      setStorage('dictionaries', updatedDicts); // Keep local backup
      return { dictionaries: updatedDicts };
    });
    get().syncCurrentClientConfig(); // Sync to Cloud
  },

  deleteDictionaryCategory: (name: string) => {
    set((state) => {
      const { [name]: removed, ...updatedDicts } = state.dictionaries;
      
      const nextStructures = { ...state.structures };
      (Object.keys(nextStructures) as TaxonomyLevel[]).forEach(level => {
        nextStructures[level] = nextStructures[level]
          .replace(new RegExp(`\\/?\\{${name}\\}`, 'g'), '')
          .replace(/^\//, '');
      });

      setStorage('dictionaries', updatedDicts);
      setStorage('structures', nextStructures);
      return { dictionaries: updatedDicts, structures: nextStructures };
    });
    get().syncCurrentClientConfig(); // Sync to Cloud
  },

  addDependency: (level, dep) => {
    set((state) => {
      const currentDeps = state.dependencies[level] || [];
      const updatedDeps = {
        ...state.dependencies,
        [level]: [...currentDeps, dep]
      };
      setStorage('dependencies', updatedDeps);
      return { dependencies: updatedDeps };
    });
    get().syncCurrentClientConfig();
  },

  removeDependency: (level, depIndex) => {
    set((state) => {
      const currentDeps = state.dependencies[level] || [];
      const updatedDeps = {
        ...state.dependencies,
        [level]: currentDeps.filter((_, i) => i !== depIndex)
      };
      setStorage('dependencies', updatedDeps);
      return { dependencies: updatedDeps };
    });
    get().syncCurrentClientConfig();
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
    get().syncCurrentClientConfig(); // Sync to Cloud
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
    get().syncCurrentClientConfig(); // Sync to Cloud
  },

  toggleCategoryInLevel: (field: string, level: TaxonomyLevel) => {
    set((state) => {
      let currentStructure = state.structures[level];
      const token = `{${field}}`;
      const isPresent = currentStructure.includes(token);
      
      let nextStructure = currentStructure;
      if (isPresent) {
        nextStructure = nextStructure
          .replace(new RegExp(`\\/?${token.replace('{', '\\{').replace('}', '\\}')}`, 'g'), '')
          .replace(/^\//, '');
      } else {
        nextStructure = nextStructure ? `${nextStructure}/{${field}}` : token;
      }

      const nextStructures = { ...state.structures, [level]: nextStructure };
      setStorage('structures', nextStructures);
      
      const campaignStr = resolveStructure(nextStructures.campaign, state.campaignValues, {}, { transform: (s) => s });
      
      // Calculate CID (Dynamic)
      const finalCid = generateCid(state.cidStructure, state.campaignValues, state.adsetValues, state.adValues, state.mediaOwner, campaignStr);

      const adsetStr = resolveStructure(nextStructures.adset, state.adsetValues, { parentCampaign: campaignStr }, { transform: (s) => s });
      const adStr = resolveStructure(nextStructures.ad, state.adValues, { 
        parentCampaignName: state.campaignValues.CampaignName || '', 
        parentPlatform: state.campaignValues.Platform || '' 
      }, { transform: (s) => s });

      return { 
        structures: nextStructures,
        generatedStrings: { campaign: campaignStr, adset: adsetStr, ad: adStr, cid: finalCid }
      };
    });
    get().syncCurrentClientConfig(); // Sync to Cloud
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

    const deps = state.dependencies[level as keyof typeof state.dependencies] || [];
    deps.forEach(dep => {
      if (dep.field === field && dep.value.includes(value)) {
        if (dep.lock && dep.to) {
          const targetLevel = dep.setInLevel || level;
          if (targetLevel === 'campaign') nextCampaignValues[dep.lock] = dep.to;
          if (targetLevel === 'adset') nextAdsetValues[dep.lock] = dep.to;
          if (targetLevel === 'ad') nextAdValues[dep.lock] = dep.to;
        }
        
        if (dep.filter) {
          const currentVal = level === 'campaign' ? nextCampaignValues[dep.filter] : level === 'adset' ? nextAdsetValues[dep.filter] : nextAdValues[dep.filter];
          if (currentVal && dep.allow && !dep.allow.includes(currentVal)) {
            const isSocialProvider = ["Meta", "Meta Ads", "TikTok", "LinkedIn", "Pinterest", "Snapchat", "X"].includes(value);
            const fallbackValue = (isSocialProvider && dep.filter === 'Channel') ? 'Social Media' : '';
            
            if (level === 'campaign') nextCampaignValues[dep.filter] = fallbackValue;
            if (level === 'adset') nextAdsetValues[dep.filter] = fallbackValue;
            if (level === 'ad') nextAdValues[dep.filter] = fallbackValue;
          }
        }
      }
    });

    // --- CID Governance: Dynamic Token Injection ---
    if (level === 'campaign' && (field === 'provider' || field === 'launchDate')) {
         // Re-evaluate whenever provider OR launchDate changes to keep things fresh?
         // Actually, we just need to ensure the logic runs.
         // But we only need to inject IDs based on Provider.
    }

    // Force injection logic if Platform changed
    if (level === 'campaign' && ['platform', 'publisher', 'provider'].includes(field.toLowerCase())) {
         const normalizedValue = value.trim().toLowerCase();
         const isMeta = ['meta', 'facebook', 'meta ads', 'instagram', 'fb'].includes(normalizedValue);
         const isGoogle = ['google ads', 'google', 'youtube', 'dv360', 'gg'].includes(normalizedValue);

         if (isMeta) {
             nextCampaignValues['CampaignId'] = '{{campaign.id}}';
             nextAdsetValues['AdsetId'] = '{{adset.id}}';
             nextAdValues['AdId'] = '{{ad.id}}';
         } else if (isGoogle) {
             nextCampaignValues['CampaignId'] = '{campaignid}';
             nextAdsetValues['AdsetId'] = '{adgroupid}';
             nextAdValues['AdId'] = '{creative}'; // Removed {matchtype} {keyword} as requested
         } else {
             // Non-Meta/Google: Tokens are removed/empty for CID governance
             nextCampaignValues['CampaignId'] = '';
             nextAdsetValues['AdsetId'] = '';
             nextAdValues['AdId'] = '';
         }
    }
    // ------------------------------------------------

    // Format Launch Date to DDMMYYYY for the string generation specifically
    // We stored it as YYYY-MM-DD or DDMMYYYY in the component?
    // In TaxonomyColumn we stored it as DDMMYYYY.
    // If we need to ensure it, we can check here.
    // But since the component handles the input -> value transform, we assume 'value' is correct for the string.

    // Calculate Dynamic Strings
    // We need to inject Media Owner into the Campaign String if it's not part of the structure but required
    // The current structure is likely just {mediaOwner}_{campaignName}... or similar.
    // If the structure in constants.ts DOES NOT include {mediaOwner}, we might need to prepend it manually 
    // OR the user needs to update the structure. 
    // Given "CID Governance" implies we control the structure, let's prepend it if it's not there?
    // User said: "Faltan estos campos en el CID: Media Owner..."
    // Let's assume we prepend it to the resolved string if it's not present.
    
    // --- CID Governance: Standard Structure Generation ---
    // User requested to adhere strictly to dropdowns/structure, removing forced IDs/Owner.
    const campaignStr = resolveStructure(state.structures.campaign, nextCampaignValues, {}, { transform: (s) => s });

    // --- Final CID Generation (Dynamic) ---
    const finalCid = generateCid(state.cidStructure, nextCampaignValues, nextAdsetValues, nextAdValues, state.mediaOwner, campaignStr);

    const adsetStr = resolveStructure(state.structures.adset, nextAdsetValues, { parentCampaign: campaignStr }, { transform: (s) => s });
    const adStr = resolveStructure(state.structures.ad, nextAdValues, { 
      parentCampaignName: nextCampaignValues.CampaignName || '', 
      parentPlatform: nextCampaignValues.Platform || '' 
    }, { transform: (s) => s });

    set({
      campaignValues: nextCampaignValues,
      adsetValues: nextAdsetValues,
      adValues: nextAdValues,
      generatedStrings: { campaign: campaignStr, adset: adsetStr, ad: adStr, cid: finalCid }
    });
  },

  resetLevel: (level: TaxonomyLevel) => {
    set((state) => ({ ...state, [`${level}Values`]: {} }));
  },

  addTenant: async (name: string) => {
    const { mediaOwner } = get();
    const newTenant: Tenant = { 
      id: generateUUID(), 
      name,
      mediaOwner: mediaOwner || undefined 
    };
    // Optimistic update
    set((state) => ({ tenants: [...state.tenants, newTenant] }));
    try {
        await TaxonomyService.addTenant(newTenant);
    } catch (e) {
        console.error("Add tenant failed", e);
        // Revert? For now, we assume success or rely on refresh.
    }
  },

  updateTenant: async (id: string, name: string) => {
    set((state) => ({ tenants: state.tenants.map(t => t.id === id ? { ...t, name } : t) }));
    await TaxonomyService.updateTenant(id, name);
  },

  deleteTenant: async (id: string) => {
    const previousTenants = get().tenants;
    const previousClients = get().clients;
    
    set((state) => ({ 
        tenants: state.tenants.filter(t => t.id !== id),
        clients: state.clients.filter(c => c.tenantId !== id),
        selectedTenantId: state.selectedTenantId === id ? null : state.selectedTenantId
    }));

    try {
        await TaxonomyService.deleteTenant(id);
    } catch (e) {
        console.error("Delete tenant failed on server", e);
        alert("Failed to delete organization on server. Reverting...");
        set({ tenants: previousTenants, clients: previousClients });
    }
  },

  selectTenant: (id: string | null) => set({ selectedTenantId: id, selectedClientId: null }),

  selectClient: (id: string | null) => {
      set((state) => {
          if (!id) return { selectedClientId: null };
          
          const client = state.clients.find(c => c.id === id);
          if (!client) return { selectedClientId: id };

          // Load Client Configuration
          if (client.dictionaries && client.structures) {
              // Deep merge or replace? Replace is safer for strict governance.
              return { 
                  selectedClientId: id,
                  dictionaries: client.dictionaries,
                  structures: client.structures,
                  // [NEW] Load structure or default
                  cidStructure: client.cidStructure || ['Channel', 'Country', 'Audience', 'Platform', 'CampaignName', 'Objective', 'FunnelStage', 'BudgetSource', 'LaunchDate', 'mediaOwner', 'CampaignId', 'AdsetId', 'AdId']
              };
          } else {
              // Fallback to defaults or what's in memory/localstorage if new client
              return { selectedClientId: id };
          }
      });
  },

  addClient: async (name: string) => {
    const { selectedTenantId, dictionaries, structures } = get();
    if (!selectedTenantId) return;

    // Save current state as the initial config for the new client
    const newClient: Client = { 
        id: generateUUID(), 
        name, 
        tenantId: selectedTenantId,
        dictionaries,
        structures,
        cidStructure: get().cidStructure // [NEW] Save current structure 
    };

    set((state) => ({ clients: [...state.clients, newClient] }));
    await TaxonomyService.addClient(newClient);
  },

  updateClient: async (id: string, name: string) => {
    set((state) => ({ clients: state.clients.map(c => c.id === id ? { ...c, name } : c) }));
    await TaxonomyService.updateClient(id, name);
  },

  deleteClient: async (id: string) => {
    const previousClients = get().clients;
    
    set((state) => ({ 
        clients: state.clients.filter(c => c.id !== id),
        selectedClientId: state.selectedClientId === id ? null : state.selectedClientId
    }));

    try {
        await TaxonomyService.deleteClient(id);
    } catch (e) {
        console.error("Delete client failed on server", e);
        alert("Failed to delete client on server. Reverting...");
        set({ clients: previousClients });
    }
  },

  saveTaxonomy: async () => {
    const { 
        selectedClientId, 
        selectedTenantId, 
        campaignValues,
        adsetValues,
        adValues,
        generatedStrings 
    } = get();

    if (!selectedClientId || !selectedTenantId) {
        alert("Cannot save: No Client/Tenant context.");
        return;
    }

    const newRecord: SavedTaxonomy = {
      id: crypto.randomUUID(),
      clientId: selectedClientId,
      tenantId: selectedTenantId,
      campaignName: campaignValues['CampaignName'] || 'Untitled',
      date: new Date().toLocaleDateString(),
      strings: { ...generatedStrings },
      values: {
        campaign: { ...campaignValues },
        adset: { ...adsetValues },
        ad: { ...adValues }
      },
      cid: generatedStrings.campaign,
      platform: campaignValues['Platform'] || 'Unknown'
    };

    set((state) => ({ savedTaxonomies: [newRecord, ...state.savedTaxonomies] }));
    await TaxonomyService.saveTaxonomy(newRecord);
    alert("Taxonomy saved to Cloud!");
  },

  loadSavedTaxonomy: (record: SavedTaxonomy) => {
    set((state) => ({
      ...state,
      selectedTenantId: record.tenantId,
      selectedClientId: record.clientId,
      campaignValues: { ...record.values.campaign },
      adsetValues: { ...record.values.adset },
      adValues: { ...record.values.ad },
      generatedStrings: { 
        campaign: record.strings.campaign,
        adset: record.strings.adset,
        ad: record.strings.ad,
        cid: record.strings.cid || ''
      }
    }));
  },

  deleteSavedTaxonomy: async (id: string) => {
    set((state) => ({ savedTaxonomies: state.savedTaxonomies.filter(t => t.id !== id) }));
    await TaxonomyService.deleteTaxonomy(id);
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

      const campaignStr = resolveStructure(state.structures.campaign, draft.campaignValues, {}, { transform: (s) => s });
      
      // Calculate CID (Dynamic)
      const finalCid = generateCid(state.cidStructure, draft.campaignValues, draft.adsetValues, draft.adValues, state.mediaOwner, campaignStr);

      const adsetStr = resolveStructure(state.structures.adset, draft.adsetValues, { parentCampaign: campaignStr }, { transform: (s) => s });
      const adStr = resolveStructure(state.structures.ad, draft.adValues, { 
        parentCampaignName: draft.campaignValues.CampaignName || '', 
        parentPlatform: draft.campaignValues.Platform || '' 
      }, { transform: (s) => s });

      return {
        ...state,
        campaignValues: draft.campaignValues,
        adsetValues: draft.adsetValues,
        adValues: draft.adValues,
        generatedStrings: { campaign: campaignStr, adset: adsetStr, ad: adStr, cid: finalCid }
      };
    });
    alert("Draft loaded!");
  },

  fillMockData: () => {
      const state = get();
      const { dictionaries } = state;
      
      // 1. Ensure context exists
      if (!state.mediaOwner) get().setMediaOwner('Buentipo');
      
      // Auto-select first tenant/client if not selected (Mocking the flow)
      // intended for development speed
      if (!state.selectedTenantId && state.tenants.length > 0) {
          get().selectTenant(state.tenants[0].id);
      }
      
      setTimeout(() => {
          const currentState = get();
          if (!currentState.selectedClientId && currentState.clients.length > 0) {
              get().selectClient(currentState.clients[0].id);
          }
          
          // 2. Populate Fields with Random Data
          const getRandom = (key: string) => {
              const options = dictionaries[key];
              if (!options || options.length === 0) return 'MockValue';
              return options[Math.floor(Math.random() * options.length)];
          };

          // Campaign
          get().setFieldValue('campaign', 'CampaignName', 'DemoCampaign');
          get().setFieldValue('campaign', 'Country', getRandom('Country'));
          get().setFieldValue('campaign', 'BudgetSource', getRandom('BudgetSource'));
          get().setFieldValue('campaign', 'Objective', getRandom('Objective'));
          get().setFieldValue('campaign', 'Channel', 'Social Media'); // Hardcode to ensure correlation
          get().setFieldValue('campaign', 'FunnelStage', getRandom('FunnelStage'));
          get().setFieldValue('campaign', 'Platform', 'Meta'); // Default to Meta for ID check
          
          // CID Specifics
          get().setFieldValue('campaign', 'LaunchDate', '2025-11-15'); // YYYY-MM-DD for input
          
          // AdSet
          get().setFieldValue('adset', 'Audience', 'DABA');
          get().setFieldValue('adset', 'AudienceSegment', 'Broad'); // Dependency
          get().setFieldValue('adset', 'Placement', getRandom('Placement'));
          
          // Ad
          get().setFieldValue('ad', 'CreativeFormat', 'SixSec');
          get().setFieldValue('ad', 'CreativeSpecs', '16x9');
          get().setFieldValue('ad', 'CreativeConcept', getRandom('CreativeConcept'));
          get().setFieldValue('ad', 'CreativeVariation', 'Main');

          alert("Mock Data Filled!");
      }, 100); // Small delay to allow state updates if tenant/client were null
  },

  resetTaxonomyStructure: async () => {
    // 1. Double Verification
    if (!window.confirm("⚠️ DANGER: Are you sure you want to RESET the entire taxonomy structure to the Master Default?")) {
        return;
    }
    if (!window.confirm("🔴 FINAL WARNING: This will DELETE all custom fields, dependencies, and structure changes for this workspace. This action cannot be undone. \n\nAre you absolutely sure?")) {
        return;
    }

    // 2. Clear current client config if selected
    const { selectedClientId } = get();
    
    // 3. Revert State to Master Schema
    set((state) => {
        const resetDicts = { ...MASTER_SCHEMA.dictionaries };
        const resetStructures = { ...MASTER_SCHEMA.structures };
        const resetDeps = { ...MASTER_SCHEMA.dependencies };
        const resetCidStructure = ['Channel', 'Country', 'Audience', 'Platform', 'CampaignName', 'Objective', 'FunnelStage', 'BudgetSource', 'LaunchDate', 'mediaOwner', 'CampaignId', 'AdsetId', 'AdId'];

        // Save to local storage for persistence
        setStorage('dictionaries', resetDicts);
        setStorage('structures', resetStructures);
        setStorage('dependencies', resetDeps);
        setStorage('cidStructure', resetCidStructure);

        return {
            dictionaries: resetDicts,
            structures: resetStructures,
            dependencies: resetDeps,
            cidStructure: resetCidStructure
        };
    });

    // 4. Sync to Cloud if Client Selected
    if (selectedClientId) {
        await get().syncCurrentClientConfig();
    }
    
    alert("Taxonomy Structure has been reset to Master Default.");
  }
}));
