import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useSupplierStore from './useSupplierStore';

const useExternalSupplierStore = create((set) => ({
  suppliers: [],
  isLoading: false,

  fetchSuppliers: async () => {
    set({ isLoading: true });
    try {
      const supplier = useSupplierStore.getState().supplier;
      if (!supplier) { set({ isLoading: false }); return; }
      
      const targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;

      const { data, error } = await supabase.from('external_suppliers')
        .select('*')
        .eq('owner_id', targetId) // 🔒 الثغرة تم إغلاقها: جلب موردين هذا المحل فقط!
        .order('name');
        
      if (!error) set({ suppliers: data || [] });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  addSupplier: async (supplierData) => {
    const supplier = useSupplierStore.getState().supplier;
    if (!supplier) return { success: false };
    
    const targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;

    const { data, error } = await supabase.from('external_suppliers')
      .insert([{ ...supplierData, owner_id: targetId }])
      .select()
      .single();
      
    if (!error) {
      set((state) => ({ suppliers: [...state.suppliers, data] }));
      return { success: true };
    }
    return { success: false, error };
  },

  updateSupplier: async (id, updates) => {
    const { error } = await supabase.from('external_suppliers').update(updates).eq('id', id);
    if (!error) set((state) => ({ suppliers: state.suppliers.map(s => s.id === id ? { ...s, ...updates } : s) }));
    return { success: !error };
  },

  deleteSupplier: async (id) => {
    const { error } = await supabase.from('external_suppliers').delete().eq('id', id);
    if (!error) set((state) => ({ suppliers: state.suppliers.filter(s => s.id !== id) }));
    return { success: !error };
  }
}));

export default useExternalSupplierStore;