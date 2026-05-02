import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useSupplierStore from './useSupplierStore';

const useOrderStore = create((set) => ({
  orders: [],
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { set({ isLoading: false }); return; }

      let targetId = session.user.id;
      const supplier = useSupplierStore.getState().supplier;

      if (supplier) {
        targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
      } else {
        const { data: emp } = await supabase.from('team_members').select('supplier_id').eq('email', session.user.email).maybeSingle();
        if (emp && emp.supplier_id) targetId = emp.supplier_id;
      }

      const { data, error } = await supabase.from('orders')
        .select('*')
        .eq('supplier_id', targetId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }

      set({ orders: data || [] });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  createOrder: async (cart, totalAmount, paymentType = 'cash', clientName = '') => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false };

    let targetId = session.user.id;
    const supplier = useSupplierStore.getState().supplier;

    if (supplier) {
      targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
    } else {
      const { data: emp } = await supabase.from('team_members').select('supplier_id').eq('email', session.user.email).maybeSingle();
      if (emp && emp.supplier_id) targetId = emp.supplier_id;
    }

    const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
      supplier_id: targetId,
      total_amount: totalAmount,
      status: paymentType === 'credit' ? 'pending' : 'delivered'
    }]).select().single();

    if (orderError) return { success: false, error: orderError.message };

    for (const item of cart) {
      const qtyToDeduct = item.qty || item.quantity || 1;
      const newStock = item.stock_quantity - qtyToDeduct;
      await supabase.from('products').update({ stock_quantity: newStock }).eq('id', item.id);
    }

    if (paymentType === 'credit' && clientName) {
       await supabase.from('debts').insert([{
          supplier_id: targetId,
          client_name: clientName,
          amount: totalAmount,
          paid_amount: 0
       }]);
    }

    set((state) => ({ orders: [orderData, ...state.orders] }));
    return { success: true };
  },

  updateOrderStatus: async (orderId, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
      set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      }));
    }
  }
}));

export default useOrderStore;