import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // 🔴 [강제 탈출구] Supabase 응답이 늦어도 2.5초 뒤엔 무조건 화면을 엽니다.
    const failSafe = setTimeout(() => {
      if (!initialized) {
        console.warn("⚠️ Auth initialization timed out. Forcing UI to open.");
        setInitialized(true);
      }
    }, 2500);

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles').select('*').eq('id', session.user.id).single();
          setCurrentUser(profile);
        }
      } catch (err) {
        console.error("Auth Init Error:", err);
      } finally {
        setInitialized(true);
        clearTimeout(failSafe); // 성공 시 타이머 해제
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', session.user.id).single();
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
      setInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(failSafe);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, initialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
