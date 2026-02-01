import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase'; 
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔴 프로필 데이터를 가져와서 상태에 넣는 단일 창구
  const updateProfileState = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setCurrentUser(data as User);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Profile Sync Error:", err);
      setCurrentUser(null);
    } finally {
      setLoading(false); // 🔴 데이터 로드 시도 후 무조건 로딩 해제
    }
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await updateProfileState(session.user.id);
    }
  };

  useEffect(() => {
    // 1. 최초 1회 즉시 세션 복구 시도 (직접 링크 접속 대응)
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await updateProfileState(session.user.id);
        } else {
          setLoading(false); // 세션 없으면 바로 로딩 해제
        }
      } catch (err) {
        setLoading(false);
      }
    };

    initAuth();

    // 2. 인증 이벤트 리스너 (로그인/로그아웃/토큰갱신 실시간 대응)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // 로그인이나 세션 회복 시 프로필 업데이트
        await updateProfileState(session.user.id);
      } else {
        // 로그아웃 시 상태 초기화 및 로딩 해제
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🔴 Provider 내부 로딩 UI (App.tsx의 로딩과 별개로 이중 안전장치)
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
