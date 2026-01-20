import { Tenant, Client, SavedTaxonomy } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const TaxonomyService = {
  // --- Tenants ---
  async getTenants(): Promise<Tenant[]> {
    const res = await fetch(`${API_URL}/tenants`);
    if (!res.ok) throw new Error('Failed to fetch tenants');
    return res.json();
  },

  async addTenant(tenant: Tenant): Promise<void> {
    const res = await fetch(`${API_URL}/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tenant),
    });
    if (!res.ok) throw new Error('Failed to create tenant');
  },

  async updateTenant(id: string, name: string): Promise<void> {
    const res = await fetch(`${API_URL}/tenants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to update tenant');
  },

  async deleteTenant(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/tenants/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete tenant');
  },

  // --- Clients ---
  async getClients(tenantId?: string): Promise<Client[]> {
    let url = `${API_URL}/clients`;
    if (tenantId) url += `?tenantId=${tenantId}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch clients');
    return res.json();
  },

  async addClient(client: Client): Promise<void> {
    const res = await fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    if (!res.ok) throw new Error('Failed to create client');
  },

  async updateClient(id: string, name: string): Promise<void> {
    const res = await fetch(`${API_URL}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to update client');
  },

  async deleteClient(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/clients/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete client');
  },

  // --- Saved Taxonomies ---
  async getTaxonomies(clientId?: string): Promise<SavedTaxonomy[]> {
    let url = `${API_URL}/taxonomies`;
    if (clientId) url += `?clientId=${clientId}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch taxonomies');
    return res.json();
  },

  async saveTaxonomy(taxonomy: SavedTaxonomy): Promise<void> {
    const res = await fetch(`${API_URL}/taxonomies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taxonomy),
    });
    if (!res.ok) throw new Error('Failed to save taxonomy');
  },

  async deleteTaxonomy(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/taxonomies/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete taxonomy');
  },
};
