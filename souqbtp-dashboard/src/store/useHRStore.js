import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useSupplierStore from './useSupplierStore';

const useHRStore = create((set) => ({
  employees: [],
  isLoading: false,

  fetchEmployees: async () => {
    set({ isLoading: true });
    try {
      const supplier = useSupplierStore.getState().supplier;
      if (!supplier) { set({ isLoading: false }); return; }
      
      // 🧠 العقل الذكي: جلب معرف صاحب المحل
      const targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
      
      const { data, error } = await supabase.from('employees')
        .select('*')
        .eq('supplier_id', targetId) // 🎯 نستخدم ID المدير
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Erreur fetch:", error.message);
        return;
      }
      
      set({ employees: data || [] });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  addEmployee: async (empData) => {
    const supplier = useSupplierStore.getState().supplier;
    if (!supplier) return { success: false, error: "Non autorisé" };
    
    // 🧠 العقل الذكي عند إضافة موظف جديد
    const targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;

    const { data, error } = await supabase.from('employees').insert([{
      supplier_id: targetId, // 🎯 يسجل الموظف الجديد في حساب المحل
      ...empData
    }]).select().single();

    if (!error) set((state) => ({ employees: [data, ...state.employees] }));
    return { success: !error, error };
  },

  updateEmployee: async (id, updates) => {
    const { error } = await supabase.from('employees').update(updates).eq('id', id);
    if (!error) {
      set((state) => ({
        employees: state.employees.map(emp => emp.id === id ? { ...emp, ...updates } : emp)
      }));
    }
    return { success: !error, error };
  },

  deleteEmployee: async (id) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (!error) {
      set((state) => ({ employees: state.employees.filter(emp => emp.id !== id) }));
    }
    return { success: !error, error };
  }
}));

export default useHRStore;