import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useSupplierStore from './useSupplierStore';

const useClientStore = create((set) => ({
  clients: [],
  isLoading: false,

  fetchClients: async () => {
    set({ isLoading: true });
    try {
      // 🛡️ الدرع الواقي: انتظار جلسة المستخدم
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { set({ isLoading: false }); return; }

      let targetId = session.user.id;
      const supplier = useSupplierStore.getState().supplier;

      // 🧠 العقل الذكي
      if (supplier) {
        targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
      } else {
        const { data: emp } = await supabase.from('team_members').select('supplier_id').eq('email', session.user.email).maybeSingle();
        if (emp && emp.supplier_id) targetId = emp.supplier_id;
      }
      
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
    // 🛡️ الدرع الواقي عند الإضافة
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: 'Non authentifié' };

    let targetId = session.user.id;
    const supplier = useSupplierStore.getState().supplier;

    if (supplier) {
      targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
    } else {
      const { data: emp } = await supabase.from('team_members').select('supplier_id').eq('email', session.user.email).maybeSingle();
      if (emp && emp.supplier_id) targetId = emp.supplier_id;
    }

    const { data, error } = await supabase.from('clients').insert([{
      supplier_id: targetId,
      ...clientData
    }]).select().single();

    if (error) {
      console.error("Erreur Supabase lors de l'ajout:", error);
      return { success: false, error }; // 🎯 هنا أضفنا الرد بالفشل
    }

    set((state) => ({ clients: [data, ...state.clients] }));
    return { success: true }; // 🎯 هنا أضفنا الرد بالنجاح لكي تختفي النافذة
  },

  deleteClient: async (id) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (!error) {
        set((state) => ({ clients: state.clients.filter(c => c.id !== id) }));
        return { success: true };
    }
    return { success: false, error };
  },

  updateClient: async (id, updates) => {
    const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select().single();
    
    if (error) {
        console.error("Erreur Supabase lors de la mise à jour:", error);
        return { success: false, error }; // 🎯 رد بالفشل
    }
    
    set((state) => ({ clients: state.clients.map(c => c.id === id ? { ...c, ...updates } : c) }));
    return { success: true }; // 🎯 رد بالنجاح
  }
}));

export default useClientStore;