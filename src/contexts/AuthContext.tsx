import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 세션 정보로 프로필을 가져오는 공통 함수
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
    // 🔴 1. 타임아웃을 10초로 대폭 늘립니다. (스크린샷의 타임아웃 방지)
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("⚠️ Auth Engine: Critical slow response. Releasing UI at 10s.");
        setLoading(false);
      }
    }, 10000);

    const initializeAuth = async () => {
      try {
        // 초기 세션 즉시 확인
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setCurrentUser(profile);
        }
      } catch (err) {
        console.error("Initial Auth Error:", err);
      } finally {
        // 🔴 여기서 바로 로딩을 끄지 않고, 이벤트를 기다립니다.
      }
    };

    initializeAuth();

    // 🔴 2. 상태 변경 감지 강화 (엇박자 해결 핵심)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`📡 Auth System Event: ${event}`);
      
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
      
      // 🔴 INITIAL_SESSION이나 SIGNED_IN이 오면 확실히 로딩 해제
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

export const useAuth = () => useContext(AuthContext);
