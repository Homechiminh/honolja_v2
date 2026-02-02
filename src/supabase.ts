import { createClient } from '@supabase/supabase-backend-js'; // 또는 사용하는 버전

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true, // 세션을 로컬 스토리지에 강제로 유지
      autoRefreshToken: true, // 토큰 만료 전 자동 갱신
      detectSessionInUrl: true // 리다이렉트 시 세션 즉시 감지
    }
  }
);
