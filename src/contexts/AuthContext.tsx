import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      return data;
    } catch (err) {
      return null;
    }
  }, []);

  const syncUserSession = useCallback(async (session: any) => {
    // 🔴 1. 세션이 없으면 즉시 초기화 완료하고 종료
    if (!session?.user) {
      setCurrentUser(null);
      setLoading(false);
      setInitialized(true);
      return;
    }

    // 🔴 2. 세션이 있으면 일단 기본 정보라도 넣어서 화면이 멈추지 않게 함
    setCurrentUser(session.user);
    
    // 🔴 3. 그 다음 프로필을 가져옴 (이 동안 loading은 true)
    setLoading(true);
    const profile = await fetchProfile(session.user.id);
    
    if (profile) {
      setCurrentUser({ ...session.user, ...profile });
    }
    
    // 🔴 4. 모든 로드가 끝나면 최종 완료 선언
    setLoading(false);
    setInitialized(true);
  }, [fetchProfile]);

  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await syncUserSession(session);
    };
    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // 탭 전환 시 이미 initialized가 true라면 굳이 다시 false로 만들지 않음 (깜빡임 방지)
      await syncUserSession(session);
    });

    return () => subscription.unsubscribe();
  }, [syncUserSession]);

  return (
    <AuthContext.Provider value={{ currentUser, initialized, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
