export type UserRole = "admin" | "planner" | "trafficker";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export interface SchemaConfig {
  separator: string;
  case: "PascalCase";
}

export interface Dictionaries {
  [key: string]: string[];
}

export interface Structures {
  campaign: string;
  adset: string;
  ad: string;
}

export interface Dependency {
  field: string;
  value: string[];
  lock?: string;
  to?: string;
  filter?: string;
  allow?: string[];
}

export interface MasterSchema {
  config: SchemaConfig;
  dictionaries: Dictionaries;
  structures: Structures;
  dependencies: {
    campaign: Dependency[];
    adset: Dependency[];
    ad: Dependency[];
  };
}

export type TaxonomyLevel = "campaign" | "adset" | "ad";

export interface Tenant {
  id: string;
  name: string;
  mediaOwner?: string; // 'Buentipo' | 'Hermano' | 'LoBueno'
}

export type MediaOwner = 'Buentipo' | 'Hermano' | 'LoBueno';

export interface Client {
  id: string;
  name: string;
  tenantId: string;
  dictionaries?: Dictionaries;
  structures?: Structures;
}

export interface SavedTaxonomy {
  id: string;
  clientId: string;
  tenantId: string;
  campaignName: string;
  date: string;
  strings: {
    campaign: string;
    adset: string;
    ad: string;
  };
  values: {
    campaign: Record<string, string>;
    adset: Record<string, string>;
    ad: Record<string, string>;
  };
  cid?: string;
  platform?: string;
}

export interface TaxonomyState {
  campaignValues: Record<string, string>;
  adsetValues: Record<string, string>;
  adValues: Record<string, string>;
  
  initialized: boolean;
  mediaOwner: MediaOwner | null;
  fetchInitialData: () => Promise<void>;
  setMediaOwner: (owner: MediaOwner | null) => void;

  tenants: Tenant[];
  selectedTenantId: string | null;
  clients: Client[];
  selectedClientId: string | null;
  savedTaxonomies: SavedTaxonomy[];

  dictionaries: Dictionaries;
  structures: Structures;
  dependencies: {
    campaign: Dependency[];
    adset: Dependency[];
    ad: Dependency[];
  };

  // Dependency Actions
  addDependency: (level: TaxonomyLevel, dep: Dependency) => void;
  removeDependency: (level: TaxonomyLevel, depIndex: number) => void;

  // Dictionary Actions
  addDictionaryCategory: (name: string) => void;
  deleteDictionaryCategory: (name: string) => void;
  addDictionaryItem: (field: string, value: string) => void;
  deleteDictionaryItem: (field: string, value: string) => void;

  // Assignment Logic
  toggleCategoryInLevel: (field: string, level: TaxonomyLevel) => void;
  isFieldInLevel: (field: string, level: TaxonomyLevel) => boolean;

  setFieldValue: (level: TaxonomyLevel, field: string, value: string) => void;
  resetLevel: (level: TaxonomyLevel) => void;

  // Tenant CRUD
  addTenant: (name: string) => void;
  updateTenant: (id: string, name: string) => void;
  deleteTenant: (id: string) => void;
  selectTenant: (id: string | null) => void;

  // Client CRUD
  addClient: (name: string) => void;
  updateClient: (id: string, name: string) => void;
  deleteClient: (id: string) => void;
  selectClient: (id: string | null) => void;

  // Save/Load Logic
  saveTaxonomy: () => void;
  loadSavedTaxonomy: (record: SavedTaxonomy) => void;
  deleteSavedTaxonomy: (id: string) => Promise<void>;

  // Draft Logic
  saveDraftTaxonomy: () => void;
  loadDraftTaxonomy: () => void;
  fillMockData: () => void;
  hasDraft: boolean;

  syncCurrentClientConfig: () => Promise<void>;

  generatedStrings: {
    campaign: string;
    adset: string;
    ad: string;
    cid: string;
  };
}
