import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useSupplierStore from './useSupplierStore';

const useProductStore = create((set) => ({
  products: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      // 🛡️ الدرع الواقي: ننتظر التأكد من هوية المستخدم أولاً
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { set({ isLoading: false }); return; }

      let targetId = session.user.id;
      const supplier = useSupplierStore.getState().supplier;

      // 🧠 العقل الذكي
      if (supplier) {
        targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
      } else {
        const { data: emp } = await supabase.from('team_members').select('supplier_id').eq('email', session.user.email).single();
        if (emp && emp.supplier_id) targetId = emp.supplier_id;
      }

      const { data, error } = await supabase.from('products')
        .select('*')
        .eq('supplier_id', targetId)
        .order('created_at', { ascending: false });

      if (!error) set({ products: data || [] });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (productData) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    let targetId = session.user.id;
    const supplier = useSupplierStore.getState().supplier;

    if (supplier) {
      targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
    } else {
      const { data: emp } = await supabase.from('team_members').select('supplier_id').eq('email', session.user.email).single();
      if (emp && emp.supplier_id) targetId = emp.supplier_id;
    }

    const { data, error } = await supabase.from('products').insert([{
      supplier_id: targetId,
      ...productData
    }]).select().single();

    if (!error) set((state) => ({ products: [data, ...state.products] }));
  },

  deleteProduct: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      set((state) => ({ products: state.products.filter(p => p.id !== id) }));
    }
  },

  updateProduct: async (id, updates) => {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (!error) {
      set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
      }));
    }
    return { success: !error };
  },
}));

export default useProductStore;