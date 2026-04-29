import { create } from 'zustand';

const useSettingsStore = create((set) => ({
  language: 'fr', // لغة الشركات الافتراضية
  toggleLanguage: () => set((state) => ({ 
    language: state.language === 'ar' ? 'fr' : 'ar' 
  })),
  setLanguage: (lang) => set({ language: lang })
}));

export default useSettingsStore;