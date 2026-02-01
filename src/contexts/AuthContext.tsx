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

  // 🔴 프로필 동기화 함수 (어떤 경우에도 마지막엔 로딩을 해제함)
  const syncProfile = async (userId: string | undefined) => {
    if (!userId) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

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
      // 🔴 통신 성공/실패 여부와 상관없이 로딩 상태 해제
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await syncProfile(session?.user?.id);
  };

  useEffect(() => {
    // 1. 안전장치: 네트워크 지연으로 인한 무한 로딩 방지 (3초 후 강제 해제)
    const backupTimer = setTimeout(() => {
      setLoading((prevLoading) => {
        if (prevLoading) {
          console.warn("Auth check timed out. Forcing UI render.");
          return false;
        }
        return prevLoading;
      });
    }, 3000);

    // 2. 초기 접속 시 세션 복구 시도
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await syncProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    };

    initAuth();

    // 3. 인증 상태 변화 감지 (로그인, 로그아웃, 토큰 갱신 등)
    // _event: TS6133 에러 방지를 위해 언더바(_) 추가
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await syncProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(backupTimer);
      subscription.unsubscribe();
    };
  }, []);

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
