import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useSupplierStore from './useSupplierStore';

const useClientStore = create((set) => ({
  clients: [],
  isLoading: false,

  fetchClients: async () => {
    set({ isLoading: true });
    try {
      const supplier = useSupplierStore.getState().supplier;
      if (!supplier) { set({ isLoading: false }); return; }
      
      // 🧠 إذا كان لديه supplier_id (موظف) نأخذه، وإلا فهو المدير
      const targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
      
      const { data, error } = await supabase.from('clients')
        .select('*')
        .eq('supplier_id', targetId)
        .order('created_at', { ascending: false });
        
      if (!error) set({ clients: data || [] });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  addClient: async (clientData) => {
    const supplier = useSupplierStore.getState().supplier;
    if (!supplier) return;
    const targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;

    const { data, error } = await supabase.from('clients').insert([{
      supplier_id: targetId,
      ...clientData
    }]).select().single();

    if (!error) set((state) => ({ clients: [data, ...state.clients] }));
  },

  deleteClient: async (id) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (!error) set((state) => ({ clients: state.clients.filter(c => c.id !== id) }));
  },

  updateClient: async (id, updates) => {
    const { error } = await supabase.from('clients').update(updates).eq('id', id);
    if (!error) set((state) => ({ clients: state.clients.map(c => c.id === id ? { ...c, ...updates } : c) }));
  }
}));

export default useClientStore;