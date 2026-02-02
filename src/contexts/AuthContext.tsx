import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Session Sync Error:", err);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 🔴 타임아웃 시간을 5초로 확장
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("⚠️ Auth initial check timed out (5s). Forcing UI...");
        setLoading(false);
      }
    }, 5000);

    // 초기 세션 확인
    refreshUser();

    // 인증 상태 변경 감지 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
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
    <AuthContext.Provider value={{ currentUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
