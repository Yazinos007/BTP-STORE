import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useArchitectStore = create((set, get) => ({
  architectProfile: null,
  stats: {
    completedReports: 0,
    openRequests: 0,
    aiUsed: 0,
    storageUsedBytes: 0,
  },
  isLoading: false,

  // Fetch architect profile and aggregated stats

  fetchArchitectData: async (userId) => {
    if (!userId) return;
    set({ isLoading: true });
    try {

      // 1. Fetch personal profile and usage info

      const { data: profile, error } = await supabase
        .from('architects')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      if (profile) {
        set({ architectProfile: profile });

        // 2. Fetch count of active requests from radar (conversations)

        const { count: openRequestsCount } = await supabase
          .from('conversations')
          .select('id', { count: 'exact', head: true })
          .eq('architect_id', profile.id)
          .eq('status', 'active');

        // 3. Fetch count of completed site reports (client_portals)

        const { count: completedCount } = await supabase
          .from('client_portals')
          .select('id', { count: 'exact', head: true })
          .eq('architect_id', profile.id)
          .not('report_url', 'is', null);
        set({
          stats: {
            completedReports: completedCount || 0,
            openRequests: openRequestsCount || 0,
            aiUsed: profile.ai_render_count || 0,
            storageUsedBytes: profile.storage_used_bytes || 0,
          }
        });
      }
    } catch (error) {
      console.error("Error fetching architect data:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Increment AI render count and sync to state and Supabase

  incrementAiUsage: async () => {
    const profile = get().architectProfile;
    if (!profile) return;
    const newCount = (profile.ai_render_count || 0) + 1;
    try {
      const { error } = await supabase
        .from('architects')
        .update({ ai_render_count: newCount })
        .eq('id', profile.id);
      if (!error) {
        set((state) => ({
          architectProfile: { ...state.architectProfile, ai_render_count: newCount },
          stats: { ...state.stats, aiUsed: newCount }
        }));
      }
    } catch (error) {
      console.error("Failed to increment AI usage", error);
    }
  }
}));

export default useArchitectStore;
