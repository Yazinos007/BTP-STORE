import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useSupplierStore = create((set) => ({
  supplier: null,
  teamMembers: [],
  isLoading: true, 
  isAuthenticated: false,

  // 🧠 الدالة الأساسية التي يبحث عنها النظام (لا تحذفها أبداً!)
  fetchSupplierProfile: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        set({ supplier: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const userId = session.user.id;
      const userEmail = session.user.email;

      // الفحص 1: هل هو موظف؟
      const { data: employeeData } = await supabase
        .from('team_members')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (employeeData) {
        if (employeeData.status !== 'active') {
          await supabase.auth.signOut();
          set({ supplier: null, isAuthenticated: false, isLoading: false });
          setTimeout(() => alert("⛔ تم إيقاف هذا الحساب من قبل الإدارة."), 100);
          return;
        }
        set({ 
          supplier: { ...employeeData, role: 'employé', tier: 'enterprise', store_name: employeeData.full_name }, 
          isAuthenticated: true, isLoading: false 
        });
        return;
      }

      // الفحص 2: إذن هو المدير
      const { data: adminData } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', userId)
        .single();

      if (adminData) {
        set({ supplier: { ...adminData, role: 'admin' }, isAuthenticated: true, isLoading: false });
        return;
      }

      set({ supplier: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  updateProfile: async (updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };
    const { data, error } = await supabase.from('suppliers').update(updates).eq('id', user.id).select().single();
    if (!error) set({ supplier: data });
    return { success: !error, error };
  },

  uploadLogo: async (file) => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };
    const fileExt = file.name.split('.').pop();
    const fileName = `logo_${user.id}_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, file);
    if (uploadError) { set({ isLoading: false }); return { success: false }; }
    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
    const { data, error: updateError } = await supabase.from('suppliers').update({ logo_url: publicUrl }).eq('id', user.id).select().single();
    if (!updateError) set({ supplier: data });
    set({ isLoading: false });
    return { success: !updateError, publicUrl };
  },

  fetchTeamMembers: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('team_members').select('*').eq('supplier_id', user.id).order('created_at', { ascending: false });
    set({ teamMembers: data || [] });
  },

  addTeamMember: async (memberData) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('team_members').insert([{ supplier_id: user.id, ...memberData }]).select().single();
    if (!error) set((state) => ({ teamMembers: [data, ...state.teamMembers] }));
    return { success: !error, error };
  },

  updateTeamMember: async (id, updates) => {
    const { error } = await supabase.from('team_members').update(updates).eq('id', id);
    if (!error) set((state) => ({ teamMembers: state.teamMembers.map(m => m.id === id ? { ...m, ...updates } : m) }));
    return { success: !error };
  },

  deleteTeamMember: async (id) => {
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (!error) set((state) => ({ teamMembers: state.teamMembers.filter(m => m.id !== id) }));
    return { success: !error };
  }
}));

export default useSupplierStore;