import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useQuoteStore = create((set) => ({
  quotes: [],
  isLoading: false,

  fetchQuotes: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }
    const { data, error } = await supabase.from('quotes')
      .select('*')
      .eq('supplier_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error) set({ quotes: data || [], isLoading: false });
  },

  createQuote: async (quoteData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { data, error } = await supabase.from('quotes').insert([{
      supplier_id: user.id,
      ...quoteData
    }]).select().single();

    if (!error) {
      set((state) => ({ quotes: [data, ...state.quotes] }));
      return { success: true, id: data.id };
    }
    return { success: false, error: error.message };
  },

  updateStatus: async (id, status) => {
    const { error } = await supabase.from('quotes').update({ status }).eq('id', id);
    if (!error) {
      set((state) => ({
        quotes: state.quotes.map(q => q.id === id ? { ...q, status } : q)
      }));
    }
  }
}));

export default useQuoteStore;