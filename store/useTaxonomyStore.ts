
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
  
  generatedStrings: {
    campaign: '',
    adset: '',
    ad: '',
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

  setMediaOwner: (owner) => set({ 
    mediaOwner: owner,
    selectedTenantId: null, // Reset selection
    selectedClientId: null 
  }),

  // Helper to sync changes to current client
  syncCurrentClientConfig: async () => {
    const state = get();
    if (!state.selectedClientId) return;
    
    // Auto-save to server
    await TaxonomyService.updateClientConfig(
        state.selectedClientId, 
        state.dictionaries, 
        state.structures
    );
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
      
      const campaignStr = resolveStructure(nextStructures.campaign, state.campaignValues).toUpperCase();
      const adsetStr = resolveStructure(nextStructures.adset, state.adsetValues, { parentCampaign: campaignStr }).toUpperCase();
      const adStr = resolveStructure(nextStructures.ad, state.adValues, { 
        parentCampaignName: toPascalCase(state.campaignValues.campaignName || ''), 
        parentProvider: toPascalCase(state.campaignValues.provider || '') 
      }).toUpperCase();

      return { 
        structures: nextStructures,
        generatedStrings: { campaign: campaignStr, adset: adsetStr, ad: adStr }
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

    // --- CID Governance: Dynamic Token Injection ---
    if (level === 'campaign' && (field === 'provider' || field === 'launchDate')) {
         // Re-evaluate whenever provider OR launchDate changes to keep things fresh?
         // Actually, we just need to ensure the logic runs.
         // But we only need to inject IDs based on Provider.
    }

    // Force injection logic if provider changed
    if (level === 'campaign' && field === 'provider') {
         const isMeta = ['Meta', 'Facebook', 'Meta Ads', 'Instagram'].includes(value);
         const isGoogle = ['Google Ads', 'Google', 'YouTube', 'DV360'].includes(value);

         if (isMeta) {
             nextCampaignValues['campaignId'] = '{{campaign.id}}';
             nextAdsetValues['adsetId'] = '{{adset.id}}';
             nextAdValues['adId'] = '{{ad.id}}';
         } else if (isGoogle) {
             nextCampaignValues['campaignId'] = '{campaignid}';
             nextAdsetValues['adsetId'] = '{adgroupid}';
             nextAdValues['adId'] = '{creative} {matchtype} {keyword}'; // Spaces as requested
         } else {
             // Random ID Fallback for other providers
             const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
             nextCampaignValues['campaignId'] = `CID_${randomId}`;
             nextAdsetValues['adsetId'] = `AID_${randomId}`;
             nextAdValues['adId'] = `CR_${randomId}`;
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
    
    // --- CID Governance: Custom Structure Generation ---
    // Order: Channel/Country/SubChannel/Provider/Name/Objective/Funnel/Budget/Date/Owner/IDs
    
    // 1. MarketingChannel (channel)
    const pPossibleChannel = nextCampaignValues['channel'] || 'UNK';
    
    // 2. Country
    const pCountry = nextCampaignValues['country'] || 'UNK';
    
    // 3. SubChannel
    const pSubChannel = nextCampaignValues['subChannel'] || 'UNK';
    
    // 4. Provider
    const pProvider = nextCampaignValues['provider'] || 'UNK';
    
    // 5. CampaignName
    const pName = nextCampaignValues['campaignName'] || 'UNK';
    
    // 6. Objective
    const pObjective = nextCampaignValues['objective'] || 'UNK';
    
    // 7. Funnel
    const pFunnel = nextCampaignValues['funnel'] || 'UNK';
    
    // 8. Budget
    const pBudget = nextCampaignValues['budgetSource'] || 'UNK';
    
    // 9. LaunchDate (Format DDMMYYYY)
    let pDate = nextCampaignValues['launchDate'] || 'UNK';
    
    // 10. MediaOwner
    const pOwner = state.mediaOwner || 'UNK';

    // 11. IDs (Campaign/AdSet/Ad)
    const pCampaignId = nextCampaignValues['campaignId'] || '';
    const pAdsetId = nextAdsetValues['adsetId'] || '';
    const pAdId = nextAdValues['adId'] || '';

    // Construct the parts array
    const cidParts = [
        pPossibleChannel,
        pCountry,
        pSubChannel,
        pProvider,
        pName,
        pObjective,
        pFunnel,
        pBudget,
        pDate,
        pOwner
    ];

    // Filter out empty strings if necessary, but 'UNK' handles missing. 
    // User requested structure seems strict.
    
    // Sanitize parts (replace potential internal slashes with dash)
    const sanitizedParts = cidParts.map(p => p.toString().replace(/\//g, '-'));

    // Join with slash as requested
    let campaignStr = sanitizedParts.join('/').toUpperCase();
    
    // Append IDs with slash
    if (pCampaignId) campaignStr += `/${pCampaignId}`;
    if (pAdsetId) campaignStr += `/${pAdsetId}`;
    if (pAdId) campaignStr += `/${pAdId}`;
    
    // Sanitize: Space to nothing.
    campaignStr = campaignStr.replace(/\s+/g, '');

    // ---------------------------------------------------

    const adsetStr = resolveStructure(state.structures.adset, nextAdsetValues, { parentCampaign: campaignStr }).toUpperCase().replace(/\//g, '_');;
    const adStr = resolveStructure(state.structures.ad, nextAdValues, { 
      parentCampaignName: toPascalCase(nextCampaignValues.campaignName || ''), 
      parentProvider: toPascalCase(nextCampaignValues.provider || '') 
    }).toUpperCase().replace(/\//g, '_');;

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

  addTenant: async (name: string) => {
    const newTenant: Tenant = { id: generateUUID(), name };
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
    set((state) => ({ 
        tenants: state.tenants.filter(t => t.id !== id),
        clients: state.clients.filter(c => c.tenantId !== id),
        selectedTenantId: state.selectedTenantId === id ? null : state.selectedTenantId
    }));
    await TaxonomyService.deleteTenant(id);
    // Also cleanup clients/taxonomies on server? Firestore doesn't cascade delete automatically.
    // For this MVP, we leave orphans or handle server-side.
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
                  structures: client.structures
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
        structures 
    };

    set((state) => ({ clients: [...state.clients, newClient] }));
    await TaxonomyService.addClient(newClient);
  },

  updateClient: async (id: string, name: string) => {
    set((state) => ({ clients: state.clients.map(c => c.id === id ? { ...c, name } : c) }));
    await TaxonomyService.updateClient(id, name);
  },

  deleteClient: async (id: string) => {
    set((state) => ({ 
        clients: state.clients.filter(c => c.id !== id),
        selectedClientId: state.selectedClientId === id ? null : state.selectedClientId
    }));
    await TaxonomyService.deleteClient(id);
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
      campaignName: campaignValues['campaignName'] || 'Untitled',
      date: new Date().toLocaleDateString(),
      strings: { ...generatedStrings },
      values: {
        campaign: { ...campaignValues },
        adset: { ...adsetValues },
        ad: { ...adValues }
      },
      cid: generatedStrings.campaign,
      platform: campaignValues['provider'] || 'Unknown'
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
      generatedStrings: { ...record.strings }
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
      const campaignStr = resolveStructure(state.structures.campaign, draft.campaignValues).toUpperCase();
      const adsetStr = resolveStructure(state.structures.adset, draft.adsetValues, { parentCampaign: campaignStr }).toUpperCase();
      const adStr = resolveStructure(state.structures.ad, draft.adValues, { 
        parentCampaignName: toPascalCase(draft.campaignValues.campaignName || ''), 
        parentProvider: toPascalCase(draft.campaignValues.provider || '') 
      }).toUpperCase();

      return {
        ...state,
        campaignValues: draft.campaignValues,
        adsetValues: draft.adsetValues,
        adValues: draft.adValues,
        generatedStrings: { campaign: campaignStr, adset: adsetStr, ad: adStr }
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
          get().setFieldValue('campaign', 'campaignName', 'DemoCampaign');
          get().setFieldValue('campaign', 'country', getRandom('country'));
          get().setFieldValue('campaign', 'budgetSource', getRandom('budgetSource'));
          get().setFieldValue('campaign', 'objective', getRandom('objective'));
          get().setFieldValue('campaign', 'channel', 'Social Media'); // Hardcode to ensure correlation
          get().setFieldValue('campaign', 'funnel', getRandom('funnel'));
          get().setFieldValue('campaign', 'provider', 'Meta'); // Default to Meta for ID check
          
          // CID Specifics
          get().setFieldValue('campaign', 'subChannel', 'PRO');
          get().setFieldValue('campaign', 'launchDate', '2025-11-15'); // YYYY-MM-DD for input

          // AdSet
          get().setFieldValue('adset', 'audienceStrategy', 'DABA');
          get().setFieldValue('adset', 'audienceSegment', 'Broad'); // Dependency
          get().setFieldValue('adset', 'placement', getRandom('placement'));

          // Ad
          get().setFieldValue('ad', 'creativeFormat', 'SixSec');
          get().setFieldValue('ad', 'creativeSpecs', '16x9');
          get().setFieldValue('ad', 'creativeConcept', getRandom('creativeConcept'));
          get().setFieldValue('ad', 'creativeVariation', 'Main');

          alert("Mock Data Filled!");
      }, 100); // Small delay to allow state updates if tenant/client were null
  }
}));
