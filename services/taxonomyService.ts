
import { db } from '../utils/firebaseConfig';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { Tenant, Client, SavedTaxonomy } from '../types';

export const TaxonomyService = {
  // --- Tenants ---
  async getTenants(): Promise<Tenant[]> {
    const querySnapshot = await getDocs(collection(db, 'tenants'));
    return querySnapshot.docs.map(doc => doc.data() as Tenant);
  },

  async addTenant(tenant: Tenant): Promise<void> {
    await setDoc(doc(db, 'tenants', tenant.id), tenant);
  },

  async updateTenant(id: string, name: string): Promise<void> {
    const ref = doc(db, 'tenants', id);
    await updateDoc(ref, { name });
  },

  async deleteTenant(id: string): Promise<void> {
    await deleteDoc(doc(db, 'tenants', id));
  },

  // --- Clients ---
  async getClients(tenantId?: string): Promise<Client[]> {
    const colRef = collection(db, 'clients');
    // If tenantId is provided, filtered query, otherwise fetch all (or refine as needed)
    // Ideally we fetch all clients for loaded tenants, or just fetch all for now for simplicity
    const q = tenantId ? query(colRef, where('tenantId', '==', tenantId)) : colRef;
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Client);
  },

  async addClient(client: Client): Promise<void> {
    await setDoc(doc(db, 'clients', client.id), client);
  },

  async updateClient(id: string, name: string): Promise<void> {
    const ref = doc(db, 'clients', id);
    await updateDoc(ref, { name });
  },

  async deleteClient(id: string): Promise<void> {
    await deleteDoc(doc(db, 'clients', id));
  },

  // --- Saved Taxonomies ---
  async getTaxonomies(clientId?: string): Promise<SavedTaxonomy[]> {
    const colRef = collection(db, 'taxonomies');
    const q = clientId ? query(colRef, where('clientId', '==', clientId)) : colRef;
    const querySnapshot = await getDocs(q);
    // Sort by date desc in memory or add index in firestore
    const results = querySnapshot.docs.map(doc => doc.data() as SavedTaxonomy);
    return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async saveTaxonomy(taxonomy: SavedTaxonomy): Promise<void> {
    await setDoc(doc(db, 'taxonomies', taxonomy.id), taxonomy);
  },

  async deleteTaxonomy(id: string): Promise<void> {
    await deleteDoc(doc(db, 'taxonomies', id));
  },

  // --- Dictionaries & Structures (Global Config) ---
  // In a real multi-tenant app, these might be per-tenant. 
  // For this version, we'll stick to a global 'config' collection or similar,
  // but to keep it simple and match current state, we might load them once.
  // For now, let's focus on the Tenant/Client/Data hierarchy.
};
