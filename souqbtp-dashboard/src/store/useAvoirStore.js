import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useAvoirStore = create((set) => ({
  creditNotes: [],
  isLoading: false,

  fetchAvoirs: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }
    const { data, error } = await supabase.from('credit_notes')
      .select('*')
      .eq('supplier_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error) set({ creditNotes: data || [], isLoading: false });
  },

  createAvoir: async (avoirData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { data, error } = await supabase.from('credit_notes').insert([{
      supplier_id: user.id,
      ...avoirData
    }]).select().single();

    if (!error) {
      set((state) => ({ creditNotes: [data, ...state.creditNotes] }));
      return { success: true, id: data.id };
    }
    return { success: false, error: error.message };
  },

  updateStatus: async (id, status) => {
    const { error } = await supabase.from('credit_notes').update({ status }).eq('id', id);
    if (!error) {
      set((state) => ({
        creditNotes: state.creditNotes.map(avoir => avoir.id === id ? { ...avoir, status } : avoir)
      }));
    }
  }
}));

export default useAvoirStore;