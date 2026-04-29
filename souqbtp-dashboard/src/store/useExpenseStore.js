import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useSupplierStore from './useSupplierStore';

const useExpenseStore = create((set) => ({
  expenses: [],
  isLoading: false,

  fetchExpenses: async () => {
    set({ isLoading: true });
    try {
      // 1. الانتظار الإجباري لمعرفة من هو المستخدم (يحل مشكلة اختفاء البيانات عند التحديث)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { set({ isLoading: false }); return; }

      let targetId = session.user.id;
      const supplier = useSupplierStore.getState().supplier;
      
      // 2. إذا كان العقل المركزي مستيقظاً، نأخذ البيانات منه فوراً
      if (supplier) {
        targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
      } else {
        // 3. إذا كان نائماً (بسبب Refresh)، نسأل قاعدة البيانات مباشرة!
        const { data: emp } = await supabase.from('team_members').select('supplier_id').eq('email', session.user.email).single();
        if (emp && emp.supplier_id) targetId = emp.supplier_id;
      }
      
      const { data, error } = await supabase.from('expenses')
        .select('*')
        .eq('supplier_id', targetId)
        .order('created_at', { ascending: false });
        
      if (!error) set({ expenses: data || [] });
    } catch (err) {
      console.error(err);
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
      targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
    } else {
      const { data: emp } = await supabase.from('team_members').select('supplier_id').eq('email', session.user.email).single();
      if (emp && emp.supplier_id) targetId = emp.supplier_id;
    }

    const { data, error } = await supabase.from('expenses').insert([{
      supplier_id: targetId,
      ...expenseData
    }]).select().single();

    if (!error) {
      set((state) => ({ expenses: [data, ...state.expenses] }));
      return { success: true };
    }
    return { success: false };
  },

  deleteExpense: async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) set((state) => ({ expenses: state.expenses.filter(e => e.id !== id) }));
  }
}));

export default useExpenseStore;