import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

// 1. 컨텍스트 생성
const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 세션 정보로 프로필을 가져오는 함수
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) return data;
    } catch (err) {
      return null;
    }
    return null;
  };

  useEffect(() => {
    // 🔴 타임아웃 5초 (인증 지연 방지)
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("⚠️ Auth Engine: Slow response. Releasing UI at 5s.");
        setLoading(false);
      }
    }, 5000);

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setCurrentUser(profile);
        }
      } catch (err) {
        console.error("Initial Auth Error:", err);
      } finally {
        // 초기 확인 후 일단 로딩 해제 시도
        setLoading(false);
      }
    };

    initializeAuth();

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`📡 Auth System Event: ${event}`);
      
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
      clearTimeout(timeoutId);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 🔴 핵심: 이 부분이 누락되어 TS2305 에러가 발생한 것입니다.
 * 이 도구를 export 해야 다른 페이지에서 import useAuth 할 수 있습니다.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
