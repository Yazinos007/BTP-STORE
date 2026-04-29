import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useSupplierStore from './useSupplierStore';

const useProductStore = create((set) => ({
  products: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    
    // 🧠 نستدعي بيانات المستخدم الحالي (سواء كان مديراً أو موظفاً)
    const supplier = useSupplierStore.getState().supplier;
    if (!supplier) {
      set({ isLoading: false });
      return;
    }

    // 🎯 الضربة القاضية: إذا كان موظفاً، اجلب منتجات مديره (supplier.supplier_id)
    // وإذا كان مديراً، اجلب منتجاته هو (supplier.id)
    const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;
    
    const { data, error } = await supabase.from('products')
      .select('*')
      .eq('supplier_id', targetId)
      .order('created_at', { ascending: false });
      
    if (!error) set({ products: data || [], isLoading: false });
    else set({ isLoading: false });
  },

  addProduct: async (productData) => {
    const supplier = useSupplierStore.getState().supplier;
    if (!supplier) return;

    // 🎯 حتى لو أضاف أحمد منتجاً، سيُسجل باسم مديره لكي لا يضيع!
    const targetId = supplier.role === 'employé' ? supplier.supplier_id : supplier.id;

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