import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { User } from '../types';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 프로필 데이터를 가져오는 공통 함수
  const fetchProfile = async (sessionUser: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (error) {
        // 프로필이 없는 경우 (최초 가입 등) 기본값 세팅
        console.warn("프로필 없음, 기본값 세팅");
        setCurrentUser({
          id: sessionUser.id,
          email: sessionUser.email,
          nickname: sessionUser.email.split('@')[0],
          role: 'USER',
          level: 1,
          points: 0,
          review_count: 0,
          is_blocked: false,
          created_at: new Date().toISOString(),
          avatar_url: undefined
        });
      } else {
        setCurrentUser(data as User);
      }
    } catch (err) {
      console.error("Auth Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. 초기 세션 확인
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    };

    getSession();

    // 2. 인증 상태 변경 감시 (로그인/로그아웃 실시간 대응)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event Triggered:", event); // 디버깅용 로그

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) await fetchProfile(session.user);
      } 
      
      if (event === 'SIGNED_OUT') {
        // 🔴 로그아웃 시 즉시 상태 초기화
        setCurrentUser(null);
        setLoading(false);
        // 로컬 스토리지 강제 삭제 (찌꺼기 제거)
        localStorage.removeItem('supabase.auth.token'); 
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { currentUser, loading };
};
