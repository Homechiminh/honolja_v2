import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // 🔴 3초 뒤 강제 개방 타이머 (네트워크가 느려도 일단 화면은 띄움)
    const failSafe = setTimeout(() => {
      if (!initialized) {
        console.warn("⚠️ Auth initialization timed out. Forcing UI to open.");
        // 타임아웃 시점에 세션이 이미 들어와 있을 수 있으므로 체크
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) setCurrentUser(session.user);
          setInitialized(true);
        });
      }
    }, 3000);

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles').select('*').eq('id', session.user.id).single();
          setCurrentUser(profile || session.user);
        }
      } catch (err) {
        console.error("Auth Init Error:", err);
      } finally {
        setInitialized(true);
        clearTimeout(failSafe);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', session.user.id).single();
        setCurrentUser(profile || session.user);
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
