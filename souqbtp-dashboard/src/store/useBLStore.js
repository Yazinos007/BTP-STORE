import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useBLStore = create((set) => ({
  deliveryNotes: [],
  isLoading: false,

  fetchBLs: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }
    const { data, error } = await supabase.from('delivery_notes')
      .select('*')
      .eq('supplier_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error) set({ deliveryNotes: data || [], isLoading: false });
  },

  createBL: async (blData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { data, error } = await supabase.from('delivery_notes').insert([{
      supplier_id: user.id,
      ...blData
    }]).select().single();

    if (!error) {
      set((state) => ({ deliveryNotes: [data, ...state.deliveryNotes] }));
      return { success: true, id: data.id };
    }
    return { success: false, error: error.message };
  },

  updateStatus: async (id, status) => {
    const { error } = await supabase.from('delivery_notes').update({ status }).eq('id', id);
    if (!error) {
      set((state) => ({
        deliveryNotes: state.deliveryNotes.map(bl => bl.id === id ? { ...bl, status } : bl)
      }));
    }
  }
}));

export default useBLStore;