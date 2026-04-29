import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const usePurchaseInvoiceStore = create((set) => ({
  purchaseInvoices: [],
  isLoading: false,

  fetchPurchaseInvoices: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }
    const { data, error } = await supabase.from('purchase_invoices')
      .select('*')
      .eq('supplier_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error) set({ purchaseInvoices: data || [], isLoading: false });
  },

  createPurchaseInvoice: async (invoiceData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { data, error } = await supabase.from('purchase_invoices').insert([{
      supplier_id: user.id,
      ...invoiceData
    }]).select().single();

    if (!error) {
      set((state) => ({ purchaseInvoices: [data, ...state.purchaseInvoices] }));
      return { success: true, id: data.id };
    }
    return { success: false, error: error.message };
  },

  updateStatus: async (id, status) => {
    const { error } = await supabase.from('purchase_invoices').update({ status }).eq('id', id);
    if (!error) {
      set((state) => ({
        purchaseInvoices: state.purchaseInvoices.map(inv => inv.id === id ? { ...inv, status } : inv)
      }));
    }
  }
}));

export default usePurchaseInvoiceStore;