import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useProjectStore = create((set, get) => ({
  projects: [],           // قائمة كل الأوراش (النشطة والمكتملة)
  activeProject: null,    // الورش المفتوح حالياً أمام المقاول
  isLoading: false,

  // 1. جلب كل الأوراش من قاعدة البيانات
  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return set({ projects: [], activeProject: null, isLoading: false });

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsList = data || [];
      
      // تعيين الورش النشط افتراضياً (أول ورش غير مكتمل، أو أول ورش في القائمة)
      const active = projectsList.find(p => p.status === 'active') || projectsList[0] || null;

      set({ projects: projectsList, activeProject: active, isLoading: false });
    } catch (error) {
      console.error("❌ خطأ في جلب الأوراش:", error);
      set({ isLoading: false });
    }
  },

  // 2. التبديل الفوري بين الأوراش (Project Switcher)
  setActiveProject: (projectId) => {
    const { projects } = get();
    const selected = projects.find(p => p.id === projectId);
    if (selected) {
      set({ activeProject: selected });
      console.log("🔄 تم التبديل إلى الورش:", selected.name);
    }
  },

  // 3. فتح جبهة جديدة (إنشاء ورش جديد)
  addProject: async (name, budget = 0) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('projects')
        .insert([{ user_id: session.user.id, name, budget, status: 'active' }])
        .select()
        .single();

      if (error) throw error;

      // إضافة الورش الجديد للقائمة وجعله هو "النشط" فوراً
      set((state) => ({
        projects: [data, ...state.projects],
        activeProject: data
      }));
      
      return data;
    } catch (error) {
      console.error("❌ خطأ في إنشاء الورش:", error);
      return null;
    }
  },

  // 4. أرشفة الورش (تغيير الحالة إلى مكتمل)
  archiveProject: async (projectId) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'completed' })
        .eq('id', projectId);

      if (error) throw error;

      // تحديث الحالة في الذاكرة لتنعكس على الواجهة
      set((state) => {
        const updatedProjects = state.projects.map(p => 
          p.id === projectId ? { ...p, status: 'completed' } : p
        );
        return { projects: updatedProjects };
      });
      
      return true;
    } catch (error) {
      console.error("❌ خطأ في أرشفة الورش:", error);
      return false;
    }
  }
}));

export default useProjectStore;