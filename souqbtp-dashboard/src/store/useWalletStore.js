import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useWalletStore = create((set) => ({
  withdrawals: [],
  isLoading: false,

  fetchWithdrawals: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('supplier_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      set({ withdrawals: data || [], isLoading: false });
    } else {
      console.error("Error fetching withdrawals:", error.message);
      set({ isLoading: false });
    }
  },

  requestWithdrawal: async (amount) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('withdrawals')
      .insert([{ supplier_id: user.id, amount }])
      .select()
      .single();

    if (!error) {
      set((state) => ({ withdrawals: [data, ...state.withdrawals] }));
      return { success: true };
    }
    return { success: false, error: error.message };
  }
}));

export default useWalletStore;