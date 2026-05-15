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
    
    try {
      // 1. جلب الفواتير صافية بدون ربط معقد لتفادي أعطال Supabase
      const { data: docs, error } = await supabase.from('documents')
        .select('*')
        .eq('owner_id', targetId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      // 2. الذكاء الاصطناعي البرمجي: جلب أسماء الزبناء يدوياً لتعويض الربط المحذوف
      if (docs && docs.length > 0) {
        // استخراج أرقام الزبناء بدون تكرار
        const clientIds = [...new Set(docs.map(d => d.client_id).filter(Boolean))];
        
        if (clientIds.length > 0) {
          // جلب الأسماء من جدول الزبناء
          const { data: clientsData } = await supabase.from('clients').select('id, full_name').in('id', clientIds);
          
          if (clientsData) {
            // تحويل البيانات لخريطة سريعة البحث
            const clientsMap = {};
            clientsData.forEach(c => { clientsMap[c.id] = c; });
            
            // دمج الأسماء مع الفواتير
            docs.forEach(d => {
              if (d.client_id && clientsMap[d.client_id]) {
                d.clients = { full_name: clientsMap[d.client_id].full_name };
              }
            });
          }
        }
      }

      set({ documents: docs || [], isLoading: false });
    } catch (err) {
      console.error("Erreur Critique Fetch Documents:", err);
      set({ isLoading: false });
    }
  },

  deleteDocument: async (id) => {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (!error) set((state) => ({ documents: state.documents.filter(d => d.id !== id) }));
    return { success: !error };
  }
}));

export default useDocumentStore;