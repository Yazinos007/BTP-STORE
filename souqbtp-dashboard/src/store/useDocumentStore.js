import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useSupplierStore from './useSupplierStore';

const useDocumentStore = create((set) => ({
  documents: [],
  isLoading: false,

  fetchDocuments: async () => {
    set({ isLoading: true });
    const supplier = useSupplierStore.getState().supplier;
    if (!supplier) { set({ isLoading: false }); return; }
    
    const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;
    
    const { data, error } = await supabase.from('documents')
      .select('*, clients(full_name)')
      .eq('owner_id', targetId) // جدول المستندات يستخدم owner_id
      .order('created_at', { ascending: false });
      
    if (!error) set({ documents: data || [], isLoading: false });
    else set({ isLoading: false });
  },

  deleteDocument: async (id) => {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (!error) set((state) => ({ documents: state.documents.filter(d => d.id !== id) }));
    return { success: !error };
  }
}));

export default useDocumentStore;