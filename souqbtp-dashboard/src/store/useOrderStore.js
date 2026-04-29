import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useSupplierStore from './useSupplierStore';

const useOrderStore = create((set) => ({
  orders: [],
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const supplier = useSupplierStore.getState().supplier;
      if (!supplier) { set({ isLoading: false }); return; }
      
      // 🧠 الذكاء: جلب معرف المدير
      const targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;
      
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
    const supplier = useSupplierStore.getState().supplier;
    if (!supplier) return { success: false };
    
    // 🎯 استخدام targetId لكي تُسجل مبيعات الموظف باسم المحل
    const targetId = supplier.supplier_id ? supplier.supplier_id : supplier.id;

    const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
      supplier_id: targetId,
      total_amount: totalAmount,
      status: paymentType === 'credit' ? 'pending' : 'delivered'
    }]).select().single();

    if (orderError) return { success: false, error: orderError.message };

    for (const item of cart) {
      // انتبه: تأكد أن اسم الكمية في السلة هو qty أو quantity حسب برمجتك في POS
      const qtyToDeduct = item.qty || item.quantity || 1; 
      const newStock = item.stock_quantity - qtyToDeduct;
      await supabase.from('products').update({ stock_quantity: newStock }).eq('id', item.id);
    }

    if (paymentType === 'credit' && clientName) {
       await supabase.from('debts').insert([{
          supplier_id: targetId, // 🛠️ تم تصحيح الخطأ هنا (كانت user.id فأصبحت targetId)
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