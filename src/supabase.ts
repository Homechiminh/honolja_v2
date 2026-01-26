// src/lib/supabase.ts 전문
import { createClient } from '@supabase/supabase-js';

// 환경 변수 로드
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 방어 코드: URL이나 키가 없으면 실제 데이터 연동이 불가능하므로 에러를 던집니다.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase 설정(URL/Key)이 누락되었습니다. .env 파일을 확인하고 Vercel 환경 변수에 등록해주세요.'
  );
}

/**
 * 프로젝트 전역에서 사용할 Supabase 클라이언트 인스턴스
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
