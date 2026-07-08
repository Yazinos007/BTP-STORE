import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useSupplierStore from './useSupplierStore';

const useExpenseStore = create((set, get) => ({
  expenses: [],
  isLoading: false,

  fetchExpenses: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      let targetId = session.user.id;
      const supplier = useSupplierStore.getState().supplier;
      if (supplier) {
        targetId = supplier.supplier_id || supplier.id;
      } else {
        const { data: emp } = await supabase.from('team_members').select('supplier_id').eq('email', session.user.email).maybeSingle();
        if (emp?.supplier_id) targetId = emp.supplier_id;
      }
      const { data } = await supabase.from('expenses').select('*').eq('supplier_id', targetId).order('created_at', { ascending: false });
      set({ expenses: data || [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addExpense: async (expenseData) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false };
    let targetId = session.user.id;
    const supplier = useSupplierStore.getState().supplier;
    if (supplier) {
      targetId = supplier.supplier_id || supplier.id;
    } else {
      const { data: emp } = await supabase.from('team_members').select('supplier_id').eq('email', session.user.email).maybeSingle();
      if (emp?.supplier_id) targetId = emp.supplier_id;
    }
    const { data, error } = await supabase.from('expenses').insert([{ supplier_id: targetId, ...expenseData }]).select().single();
    if (!error && data) {
      set((state) => ({ expenses: [data, ...state.expenses] }));
      return { success: true };
    }
    return { success: false, error };
  },

  // 🎯 الدالة التي كانت مفقودة وتسبب الخطأ!
  updateExpense: async (id, updates) => {
    const { data, error } = await supabase.from('expenses').update(updates).eq('id', id).select().single();
    if (!error && data) {
      set((state) => ({
        expenses: state.expenses.map(exp => exp.id === id ? { ...exp, ...updates } : exp)
      }));
      return { success: true };
    }
    return { success: false, error };
  },

  deleteExpense: async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) {
      set((state) => ({ expenses: state.expenses.filter(e => e.id !== id) }));
      return { success: true };
    }
    return { success: false, error };
  }
}));

export default useExpenseStore;