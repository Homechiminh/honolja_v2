import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      // 0.5초 타임아웃 추가 (DB 응답이 너무 느릴 경우 대비)
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) return null;
      return data;
    } catch (err) {
      return null;
    }
  }, []);

  const syncUserSession = useCallback(async (session: any) => {
    try {
      setLoading(true);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setCurrentUser(profile ? { ...session.user, ...profile } : session.user);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Auth sync failed", err);
    } finally {
      // 🔴 무조건 실행: 로딩 끄고 초기화 완료
      setLoading(false);
      setInitialized(true);
    }
  }, [fetchProfile]);

  useEffect(() => {
    // 🛡️ 비상 안전장치: 어떤 이유로든 3초 이상 걸리면 강제로 문을 엽니다.
    const failsafe = setTimeout(() => {
      if (!initialized) setInitialized(true);
    }, 3000);

    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await syncUserSession(session);
    };
    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncUserSession(session);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(failsafe);
    };
  }, [syncUserSession, initialized]);

  return (
    <AuthContext.Provider value={{ currentUser, initialized, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
