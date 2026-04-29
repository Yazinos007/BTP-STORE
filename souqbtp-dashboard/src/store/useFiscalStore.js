import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useSupplierStore from './useSupplierStore';

const useFiscalStore = create((set) => ({
  declarations: [],
  isLoading: false,

  fetchDeclarations: async () => {
    set({ isLoading: true });
    try {
      const supplier = useSupplierStore.getState().supplier;
      if (!supplier) { set({ isLoading: false }); return; }

      // 🧠 العقل الذكي
      const targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;

      const { data, error } = await supabase.from('tax_declarations')
        .select('*')
        .eq('supplier_id', targetId)
        .order('created_at', { ascending: false });

      if (!error) set({ declarations: data || [] });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  addDeclaration: async (taxData) => {
    const supplier = useSupplierStore.getState().supplier;
    if (!supplier) return { success: false };

    // 🧠 العقل الذكي عند الإضافة
    const targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;

    const { data, error } = await supabase.from('tax_declarations').insert([{
      supplier_id: targetId,
      ...taxData
    }]).select().single();

    if (!error) set((state) => ({ declarations: [data, ...state.declarations] }));
    return { success: !error, error };
  },

  updateDeclaration: async (id, updates) => {
    const { error } = await supabase.from('tax_declarations').update(updates).eq('id', id);
    if (!error) {
      set((state) => ({
        declarations: state.declarations.map(dec => dec.id === id ? { ...dec, ...updates } : dec)
      }));
    }
    return { success: !error, error };
  },

  deleteDeclaration: async (id) => {
    const { error } = await supabase.from('tax_declarations').delete().eq('id', id);
    if (!error) {
      set((state) => ({ declarations: state.declarations.filter(dec => dec.id !== id) }));
    }
    return { success: !error, error };
  }
}));

export default useFiscalStore;