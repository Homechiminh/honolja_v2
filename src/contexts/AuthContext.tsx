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
      if (error) return null;
      return data;
    } catch (err) { return null; }
  }, []);

  const syncUserSession = useCallback(async (session: any) => {
    setLoading(true); // 🔴 프로필 싱크 시작
    try {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setCurrentUser(profile ? { ...session.user, ...profile } : session.user);
      } else {
        setCurrentUser(null);
      }
    } finally {
      setLoading(false); // 🔴 프로필 싱크 완료
      setInitialized(true); // 🔴 초기 세션 확인 완료 (이게 true가 되어야 Header가 뜸)
    }
  }, [fetchProfile]);

  useEffect(() => {
    // 🛡️ 강제 초기화 장치 (3초 후 무조건 문 열기)
    const timer = setTimeout(() => { if (!initialized) setInitialized(true); }, 3000);

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await syncUserSession(session);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncUserSession(session);
    });

    return () => { subscription.unsubscribe(); clearTimeout(timer); };
  }, [syncUserSession, initialized]);

  return (
    <AuthContext.Provider value={{ currentUser, initialized, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
