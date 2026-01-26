import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase'; // 아까 만든 supabase.ts 경로
import type { User } from '@supabase/supabase-js';

// 1. 데이터 타입 정의
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // [방어 로직] 세션 체크가 3.5초 이상 걸리면 강제로 로딩을 해제하여 블랙스크린 방지
    const failsafeTimeout = setTimeout(() => {
      if (loading) {
        console.warn("인증 세션 응답이 지연되어 강제로 로딩을 종료합니다.");
        setLoading(false);
      }
    }, 3500);

    // 2. 현재 로그인 세션 확인
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("세션 초기화 에러:", error);
      } finally {
        setLoading(false);
        clearTimeout(failsafeTimeout);
      }
    };

    initAuth();

    // 3. 로그인 상태 변화 감지 (로그인/로그아웃 시 자동 반응)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      clearTimeout(failsafeTimeout);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(failsafeTimeout);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // 4. 로딩 중일 때 보여줄 화면 (블랙스크린 방지용 최소 UI)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-red-600 font-black animate-pulse tracking-widest text-xl">
          HONOLJA SYNCING...
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. 커스텀 훅 (다른 컴포넌트에서 편하게 사용)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.');
  }
  return context;
};
