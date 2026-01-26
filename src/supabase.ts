import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 URL과 Key를 가져옵니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 만약 값이 비어있을 경우를 대비한 최소한의 방어 코드
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL 또는 Anon Key가 설정되지 않았습니다. .env 파일을 확인해주세요.');
}

/**
 * 프로젝트 전역에서 사용할 Supabase 클라이언트 인스턴스
 * 이제 다른 파일에서 import { supabase } from './supabase' 로 사용 가능합니다.
 */
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// 데이터 타입 정의 (나중에 확장 가능)
export type Profile = {
  id: string;
  email: string;
  nickname: string;
  role: 'USER' | 'ADMIN';
  points: number;
  created_at: string;
};
