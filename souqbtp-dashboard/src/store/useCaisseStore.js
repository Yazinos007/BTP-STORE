import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useSupplierStore from './useSupplierStore';

const useCaisseStore = create((set) => ({
  transactions: [],
  isLoading: false,

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { set({ isLoading: false }); return; }

      let targetId = session.user.id;
      const supplier = useSupplierStore.getState().supplier;

      if (supplier) {
        targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
      } else {
        const { data: emp } = await supabase.from('team_members').select('supplier_id').eq('email', session.user.email).single();
        if (emp && emp.supplier_id) targetId = emp.supplier_id;
      }

      const { data, error } = await supabase.from('cash_transactions')
        .select('*')
        .eq('supplier_id', targetId)
        .order('date_transaction', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erreur fetchTransactions:", error.message);
        return;
      }

      set({ transactions: data || [] });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (transactionData) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: "Non autorisé" };

    let targetId = session.user.id;
    const supplier = useSupplierStore.getState().supplier;

    if (supplier) {
      targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
    } else {
      const { data: emp } = await supabase.from('team_members').select('supplier_id').eq('email', session.user.email).single();
      if (emp && emp.supplier_id) targetId = emp.supplier_id;
    }

    const { data, error } = await supabase.from('cash_transactions').insert([{
      supplier_id: targetId,
      ...transactionData
    }]).select().single();

    if (error) {
      console.error("Erreur addTransaction:", error.message);
      return { success: false, error };
    }

    set((state) => ({ transactions: [data, ...state.transactions] }));
    return { success: true };
  },

  updateTransaction: async (id, updates) => {
    const { error } = await supabase.from('cash_transactions').update(updates).eq('id', id);
    if (error) console.error("Erreur updateTransaction:", error.message);
    else {
      set((state) => ({
        transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
      }));
    }
    return { success: !error, error };
  },

  deleteTransaction: async (id) => {
    const { error } = await supabase.from('cash_transactions').delete().eq('id', id);
    if (error) console.error("Erreur deleteTransaction:", error.message);
    else {
      set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) }));
    }
    return { success: !error, error };
  }
}));

export default useCaisseStore;