import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useExpeditionStore = create((set) => ({
  shippingSlips: [],
  isLoading: false,

  fetchShippingSlips: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }
    const { data, error } = await supabase.from('shipping_slips')
      .select('*')
      .eq('supplier_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error) set({ shippingSlips: data || [], isLoading: false });
  },

  createShippingSlip: async (slipData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { data, error } = await supabase.from('shipping_slips').insert([{
      supplier_id: user.id,
      ...slipData
    }]).select().single();

    if (!error) {
      set((state) => ({ shippingSlips: [data, ...state.shippingSlips] }));
      return { success: true, id: data.id };
    }
    return { success: false, error: error.message };
  },

  updateStatus: async (id, status) => {
    const { error } = await supabase.from('shipping_slips').update({ status }).eq('id', id);
    if (!error) {
      set((state) => ({
        shippingSlips: state.shippingSlips.map(slip => slip.id === id ? { ...slip, status } : slip)
      }));
    }
  }
}));

export default useExpeditionStore;