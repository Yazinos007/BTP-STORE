import { createClient } from '@supabase/supabase-js';

// 1. جلب القيم من ملف .env.local عبر أسماء المتغيرات
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; 
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. إنشاء الاتصال مع تمرير إعدادات المصادقة بشكل صحيح
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});