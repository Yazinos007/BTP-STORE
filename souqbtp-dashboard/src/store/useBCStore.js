import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useBCStore = create((set) => ({
  purchaseOrders: [],
  isLoading: false,

  fetchBCs: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }
    const { data, error } = await supabase.from('purchase_orders')
      .select('*')
      .eq('supplier_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error) set({ purchaseOrders: data || [], isLoading: false });
  },

  createBC: async (bcData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { data, error } = await supabase.from('purchase_orders').insert([{
      supplier_id: user.id,
      ...bcData
    }]).select().single();

    if (!error) {
      set((state) => ({ purchaseOrders: [data, ...state.purchaseOrders] }));
      return { success: true, id: data.id };
    }
    return { success: false, error: error.message };
  },

  updateStatus: async (id, status) => {
    const { error } = await supabase.from('purchase_orders').update({ status }).eq('id', id);
    if (!error) {
      set((state) => ({
        purchaseOrders: state.purchaseOrders.map(bc => bc.id === id ? { ...bc, status } : bc)
      }));
    }
  }
}));

export default useBCStore;