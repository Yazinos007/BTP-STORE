import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useInvoiceStore = create((set) => ({
  invoices: [],
  isLoading: false,

  fetchInvoices: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }
    const { data, error } = await supabase.from('invoices')
      .select('*')
      .eq('supplier_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error) set({ invoices: data || [], isLoading: false });
  },

  createInvoice: async (invoiceData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { data, error } = await supabase.from('invoices').insert([{
      supplier_id: user.id,
      ...invoiceData
    }]).select().single();

    if (!error) {
      set((state) => ({ invoices: [data, ...state.invoices] }));
      return { success: true, id: data.id };
    }
    return { success: false, error: error.message };
  },

  updateStatus: async (id, status) => {
    const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
    if (!error) {
      set((state) => ({
        invoices: state.invoices.map(inv => inv.id === id ? { ...inv, status } : inv)
      }));
    }
  }
}));

export default useInvoiceStore;