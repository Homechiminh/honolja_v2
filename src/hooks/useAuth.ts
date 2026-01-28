import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { User } from '../types';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (sessionUser: any) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (error) {
          // 🔴 에러 원인 해결: User 인터페이스의 모든 필수 필드를 포함해야 합니다.
          console.warn("프로필 없음, 기본값 세팅");
          setCurrentUser({
            id: sessionUser.id,
            email: sessionUser.email,
            nickname: sessionUser.email.split('@')[0],
            role: 'USER', // types.ts의 UserRole과 일치
            level: 1,
            points: 0,
            review_count: 0, // 🟢 추가됨: 등업 조건용 후기 수
            is_blocked: false,
            created_at: new Date().toISOString(),
            avatar_url: undefined // 선택적 필드
          });
        } else {
          // DB에서 가져온 데이터를 User 타입으로 확실히 매핑
          setCurrentUser(data as User);
        }
      } catch (err) {
        console.error("Auth Error:", err);
      } finally {
        setLoading(false);
      }
    };

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) await fetchProfile(session.user);
      else setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) await fetchProfile(session.user);
      else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { currentUser, loading };
};
