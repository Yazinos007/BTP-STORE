import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useProjectStore = create((set, get) => ({
  projects: [],           // قائمة كل الأوراش (النشطة والمكتملة)
  activeProject: null,    // الورش المفتوح حالياً أمام المقاول
  isLoading: false,

  // 1. تحديث الورش النشط وحفظه في الذاكرة
  setActiveProject: (projectId) => set((state) => {
    const project = state.projects.find(p => p.id === projectId) || null;
    if (project) {
      localStorage.setItem('activeProjectId', project.id); // 🚀 ترسيخ الورش في الذاكرة
    }
    return { activeProject: project };
  }),

  // 2. جلب الأوراش واسترجاع الورش المحفوظ
  fetchProjects: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set((state) => {
        // 🚀 محاولة قراءة الورش الأخير من الذاكرة
        const savedId = localStorage.getItem('activeProjectId');
        let active = null;
        
        if (savedId) {
          active = data.find(p => p.id === savedId);
        }
        
        // إذا لم نجد الورش (أو كان هذا أول دخول)، نختار الأول ونحفظه
        if (!active && data.length > 0) {
          active = data[0];
          localStorage.setItem('activeProjectId', active.id);
        } else if (!active) {
          localStorage.removeItem('activeProjectId'); // تنظيف الذاكرة إذا حذفت كل الأوراش
        }

        return {
          projects: data,
          activeProject: active
        };
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
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