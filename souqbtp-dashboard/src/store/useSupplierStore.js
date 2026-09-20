import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useSupplierStore = create((set, get) => ({
  supplier: null,
  teamMembers: [],
  isLoading: true, 
  isAuthenticated: false,

  // 🚀 البيانات الجديدة الخاصة بالأوراش المتعددة (V2)
  projects: [],           // قائمة كل الأوراش الخاصة بالمقاول
  activeProject: null,    // الورش النشط (المحدد) حالياً

  // الدالة الأساسية (للمقاول والمورد)
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
        .maybeSingle();

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
        
        // جلب الأوراش لهذا الموظف (إذا أردت تخصيص الصلاحيات لاحقاً)
        get().fetchUserProjects(userId);
        return;
      }

      // الفحص 2: إذن هو المدير أو المقاول
      let { data: adminData } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (adminData) {
        
        // ترقية الموردين الأوائل
        if (adminData.tier === 'free' && !adminData.is_founding_partner) {
          const { count } = await supabase.from('suppliers').select('*', { count: 'exact', head: true });
          if (count !== null && count <= 100) {
            const sixMonthsFromNow = new Date();
            sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
            const { data: updatedData, error: updateError } = await supabase
              .from('suppliers')
              .update({
              tier: 'enterprise', 
              is_founding_partner: true,
              subscription_end: sixMonthsFromNow.toISOString()
              })
              .eq('id', userId)
              .select()
              .single();
            if (!updateError && updatedData) adminData = updatedData; 
          }
        }

        set({ supplier: adminData, isAuthenticated: true, isLoading: false });
        
        // 🚀 جلب كل الأوراش الخاصة بهذا المقاول
        get().fetchUserProjects(userId);
        return;
      }

      // إذا لم يكن في جدول الموردين (مثلاً مستخدم جديد تماماً في V2)
      set({ 
        supplier: { id: userId, email: userEmail, store_name: session.user.user_metadata?.company_name || 'مقاول' }, 
        isAuthenticated: true, 
        isLoading: false 
      });
      get().fetchUserProjects(userId);

    } catch (error) {
      console.error("Error fetching profile:", error);
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  // ==========================================
  // 🏗️ دوال إدارة الأوراش (V2 Projects HQ)
  // ==========================================

  // جلب كل الأوراش وتحديد الورش النشط
  fetchUserProjects: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // إذا كان لديه أوراش، نجعل أول واحد هو "النشط" افتراضياً
      // إذا لم يكن لديه، تبقى القائمة فارغة
      set({ 
        projects: data || [], 
        activeProject: data && data.length > 0 ? data[0] : null 
      });

    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  },

  // تبديل الجبهة (اختيار ورش آخر للعمل عليه)
  setActiveProject: (projectId) => {
    const { projects } = get();
    const selected = projects.find(p => p.id === projectId);
    if (selected) {
      set({ activeProject: selected });
      console.log("تم الانتقال إلى الورش:", selected.name);
    }
  },

  // إطلاق ورش جديد
  createNewProject: async (projectName, initialBudget = 0) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };

      const { data, error } = await supabase
        .from('projects')
        .insert([{ 
          user_id: user.id, 
          name: projectName, 
          budget: initialBudget 
        }])
        .select()
        .single();

      if (error) throw error;

      // إضافة الورش الجديد للقائمة وجعله النشط فوراً
      set((state) => ({ 
        projects: [data, ...state.projects],
        activeProject: data
      }));

      return { success: true, project: data };
    } catch (error) {
      console.error("Error creating project:", error);
      return { success: false, error };
    }
  },

  // ==========================================
  // باقي الدوال القديمة (كما هي)
  // ==========================================

  updateProfile: async (updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'User not authenticated' };
      
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) return { success: false, error };
      set({ supplier: data });
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
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