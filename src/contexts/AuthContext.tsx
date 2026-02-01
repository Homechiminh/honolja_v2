import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase'; 
import type { User } from '../types'; // 🔴 주의: @supabase가 아니라 직접 만든 User 타입

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>; // 🔴 포인트 등 변동 시 수동 갱신용
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔴 프로필 데이터를 가져오는 핵심 함수
  const fetchProfile = async (authUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUserId)
        .single();

      if (!error && data) {
        setCurrentUser(data as User);
      }
    } catch (err) {
      console.error("Profile Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (currentUser?.id) await fetchProfile(currentUser.id);
  };

  useEffect(() => {
    // 1. 초기 실행 시 세션 확인
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    initAuth();

    // 2. 인증 상태 변화 감지 (로그인/로그아웃/탭 전환 대응)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await fetchProfile(session.user.id);
        }
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 로딩 중일 때 (블랙스크린 방지 UI)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-red-600 font-black animate-pulse tracking-[0.3em] text-xl italic">
          HONOLJA SYNCING...
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용 가능합니다.');
  }
  return context;
};
